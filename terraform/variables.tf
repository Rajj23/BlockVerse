variable "aws_region" {
  description = "AWS deployment region"
  type        = string
  default     = "ap-south-1"
}

variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "blockverse"
}

variable "environment" {
  description = "Target deployment environment"
  type        = string
  default     = "production"
}

variable "domain_name" {
  description = "The parent domain name registered in Route 53 (e.g., example.com)"
  type        = string
  default     = "yourdomain.com"
}

variable "subdomain_name" {
  description = "The subdomain name for the application (e.g., blockverse)"
  type        = string
  default     = "blockverse"
}

variable "db_username" {
  description = "Administrator username for RDS MySQL"
  type        = string
  default     = "dbadmin"
}

variable "db_password" {
  description = "Administrator password for RDS MySQL"
  type        = string
  sensitive   = true
}

variable "ec2_instance_type" {
  description = "EC2 instance type for k3s server. t3.small (2 vCPU, 2GB) — cost-optimized for Spring Boot + Next.js + Redis + Kafka."
  type        = string
  default     = "t3.small"
}

variable "ssh_public_key" {
  description = "SSH public key for EC2 access. Generate with: ssh-keygen -t ed25519"
  type        = string
}

