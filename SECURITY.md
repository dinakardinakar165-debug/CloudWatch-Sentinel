# Security Policy

Never commit AWS credentials, Cognito tokens, `.env` files, Terraform state, or account IDs. Report suspected vulnerabilities privately to the repository owner. Rotate any exposed credential immediately using AWS IAM and invalidate affected Cognito sessions.

The application uses Cognito JWT verification at API Gateway, IAM execution roles, TLS AWS service endpoints, DynamoDB point-in-time recovery, and cross-account STS with an external ID. Review the generated IAM policy before deployment and restrict `allowed_cors_origin` to the production frontend domain.
