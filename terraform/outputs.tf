output "api_url" { value = aws_apigatewayv2_api.api.api_endpoint }
output "cognito_user_pool_id" { value = aws_cognito_user_pool.users.id }
output "cognito_client_id" { value = aws_cognito_user_pool_client.web.id }
output "alerts_topic_arn" { value = aws_sns_topic.alerts.arn }
