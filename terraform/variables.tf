variable "aws_region" {
  type    = string
  default = "ap-south-1"
}

variable "project_name" {
  type    = string
  default = "cloudwatch-sentinel"
}

variable "alert_email" {
  type        = string
  description = "Email address subscribed to cost anomaly alerts"
}

variable "allowed_cors_origin" {
  type    = string
  default = "http://localhost:5173"
}

variable "tags" {
  type    = map(string)
  default = { Project = "CloudWatch-Sentinel", ManagedBy = "Terraform" }
}
