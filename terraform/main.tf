locals { prefix = var.project_name }

data "aws_caller_identity" "current" {}

data "archive_file" "backend" {
  type        = "zip"
  source_dir  = "${path.module}/.."
  output_path = "${path.module}/backend.zip"
  excludes    = [".git", ".github", "docs", "frontend", "terraform", "backend/tests", "__pycache__", ".venv", "node_modules", "dist"]
}

resource "aws_dynamodb_table" "tables" {
  for_each     = { users = { sort = null }, accounts = { sort = null }, costs = { sort = "recordId" }, anomalies = { sort = "anomalyId" }, notifications = { sort = "notificationId" } }
  name         = "${local.prefix}-${each.key}"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "userId"
  range_key    = each.value.sort
  attribute {
    name = "userId"
    type = "S"
  }
  dynamic "attribute" {
    for_each = each.value.sort == null ? [] : [each.value.sort]
    content {
      name = attribute.value
      type = "S"
    }
  }
  point_in_time_recovery { enabled = true }
  tags = var.tags
}

resource "aws_sns_topic" "alerts" {
  name = "${local.prefix}-alerts"
  tags = var.tags
}
resource "aws_sns_topic_subscription" "email" {
  topic_arn = aws_sns_topic.alerts.arn
  protocol  = "email"
  endpoint  = var.alert_email
}

resource "aws_cognito_user_pool" "users" {
  name                     = "${local.prefix}-users"
  username_attributes      = ["email"]
  auto_verified_attributes = ["email"]
  password_policy {
    minimum_length                   = 12
    require_lowercase                = true
    require_numbers                  = true
    require_symbols                  = true
    require_uppercase                = true
    temporary_password_validity_days = 3
  }
  schema {
    attribute_data_type = "String"
    name                = "email"
    required            = true
    mutable             = false
  }
  tags = var.tags
}
resource "aws_cognito_user_pool_client" "web" {
  name                          = "${local.prefix}-web"
  user_pool_id                  = aws_cognito_user_pool.users.id
  generate_secret               = false
  explicit_auth_flows           = ["ALLOW_USER_PASSWORD_AUTH", "ALLOW_REFRESH_TOKEN_AUTH"]
  prevent_user_existence_errors = "ENABLED"
}

data "aws_iam_policy_document" "lambda_assume" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}
resource "aws_iam_role" "lambda" {
  name               = "${local.prefix}-lambda"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume.json
  tags               = var.tags
}
resource "aws_iam_role_policy" "lambda" {
  name = "sentinel-runtime"
  role = aws_iam_role.lambda.id
  policy = jsonencode({ Version = "2012-10-17", Statement = [
    { Effect = "Allow", Action = ["logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents", "xray:PutTraceSegments", "xray:PutTelemetryRecords"], Resource = "*" },
    { Effect = "Allow", Action = ["dynamodb:GetItem", "dynamodb:PutItem", "dynamodb:Query", "dynamodb:Scan"], Resource = [for t in aws_dynamodb_table.tables : t.arn] },
    { Effect = "Allow", Action = ["sns:Publish"], Resource = aws_sns_topic.alerts.arn },
    { Effect = "Allow", Action = ["ssm:GetParameter"], Resource = "arn:aws:ssm:${var.aws_region}:${data.aws_caller_identity.current.account_id}:parameter/${local.prefix}/*" },
    { Effect = "Allow", Action = ["sts:AssumeRole"], Resource = "arn:aws:iam::*:role/CloudWatchSentinelReadOnly" }
  ] })
}

resource "aws_lambda_function" "api" {
  function_name    = "${local.prefix}-api"
  role             = aws_iam_role.lambda.arn
  handler          = "backend.handler.api_handler"
  runtime          = "python3.12"
  filename         = data.archive_file.backend.output_path
  source_code_hash = data.archive_file.backend.output_base64sha256
  timeout          = 29
  tracing_config { mode = "Active" }
  environment {
    variables = {
      USERS_TABLE         = aws_dynamodb_table.tables["users"].name
      ACCOUNTS_TABLE      = aws_dynamodb_table.tables["accounts"].name
      COST_HISTORY_TABLE  = aws_dynamodb_table.tables["costs"].name
      ANOMALIES_TABLE     = aws_dynamodb_table.tables["anomalies"].name
      NOTIFICATIONS_TABLE = aws_dynamodb_table.tables["notifications"].name
      ALERT_TOPIC_ARN     = aws_sns_topic.alerts.arn
      COGNITO_CLIENT_ID   = aws_cognito_user_pool_client.web.id
    }
  }
  tags = var.tags
}
resource "aws_lambda_function" "collector" {
  function_name    = "${local.prefix}-collector"
  role             = aws_iam_role.lambda.arn
  handler          = "backend.collector.scheduled_collector"
  runtime          = "python3.12"
  filename         = data.archive_file.backend.output_path
  source_code_hash = data.archive_file.backend.output_base64sha256
  timeout          = 300
  tracing_config { mode = "Active" }
  environment {
    variables = {
      ACCOUNTS_TABLE      = aws_dynamodb_table.tables["accounts"].name
      COST_HISTORY_TABLE  = aws_dynamodb_table.tables["costs"].name
      ANOMALIES_TABLE     = aws_dynamodb_table.tables["anomalies"].name
      NOTIFICATIONS_TABLE = aws_dynamodb_table.tables["notifications"].name
      ALERT_TOPIC_ARN     = aws_sns_topic.alerts.arn
    }
  }
  tags = var.tags
}

resource "aws_cloudwatch_log_group" "api" {
  name              = "/aws/lambda/${aws_lambda_function.api.function_name}"
  retention_in_days = 30
}
resource "aws_cloudwatch_log_group" "collector" {
  name              = "/aws/lambda/${aws_lambda_function.collector.function_name}"
  retention_in_days = 30
}
resource "aws_cloudwatch_event_rule" "collector" {
  name                = "${local.prefix}-six-hour-collection"
  schedule_expression = "rate(6 hours)"
}
resource "aws_cloudwatch_event_target" "collector" {
  rule = aws_cloudwatch_event_rule.collector.name
  arn  = aws_lambda_function.collector.arn
}
resource "aws_lambda_permission" "events" {
  statement_id  = "AllowEventBridge"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.collector.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.collector.arn
}

resource "aws_apigatewayv2_api" "api" {
  name          = "${local.prefix}-api"
  protocol_type = "HTTP"
  cors_configuration {
    allow_origins = [var.allowed_cors_origin]
    allow_methods = ["GET", "POST", "OPTIONS"]
    allow_headers = ["authorization", "content-type"]
  }
}
resource "aws_apigatewayv2_integration" "api" {
  api_id                 = aws_apigatewayv2_api.api.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.api.invoke_arn
  payload_format_version = "2.0"
}
resource "aws_apigatewayv2_authorizer" "jwt" {
  api_id           = aws_apigatewayv2_api.api.id
  authorizer_type  = "JWT"
  identity_sources = ["$request.header.Authorization"]
  name             = "cognito-jwt"
  jwt_configuration {
    audience = [aws_cognito_user_pool_client.web.id]
    issuer   = "https://cognito-idp.${var.aws_region}.amazonaws.com/${aws_cognito_user_pool.users.id}"
  }
}
resource "aws_apigatewayv2_route" "public" {
  for_each  = toset(["POST /login", "POST /register", "POST /confirm-registration"])
  api_id    = aws_apigatewayv2_api.api.id
  route_key = each.value
  target    = "integrations/${aws_apigatewayv2_integration.api.id}"
}
resource "aws_apigatewayv2_route" "protected" {
  for_each           = toset(["POST /connect-account", "GET /dashboard", "GET /summary", "GET /cost-history", "GET /anomalies", "POST /alerts"])
  api_id             = aws_apigatewayv2_api.api.id
  route_key          = each.value
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.jwt.id
  target             = "integrations/${aws_apigatewayv2_integration.api.id}"
}
resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.api.id
  name        = "$default"
  auto_deploy = true
  tags        = var.tags
}
resource "aws_lambda_permission" "api" {
  statement_id  = "AllowApiGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.api.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.api.execution_arn}/*/*"
}

resource "aws_ssm_parameter" "external_id_hint" {
  name  = "/${local.prefix}/cross-account-external-id-guidance"
  type  = "String"
  value = "Generate a distinct random external ID per connected customer account; do not store customer credentials."
  tags  = var.tags
}
