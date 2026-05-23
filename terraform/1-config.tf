# ── 1-config.tf ───────────────────────────────────────────────────────────────
# Terraform settings, AWS provider, variables, and shared locals.
# ──────────────────────────────────────────────────────────────────────────────

terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

locals {
  name = "${var.project_name}-${var.environment}"
  tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

# ── Variables ──────────────────────────────────────────────────────────────────

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
  description = "EC2 instance type. t3.small (2 vCPU, 2GB RAM) — runs k3s + Spring Boot + Next.js + Redis + Kafka."
  type        = string
  default     = "t3.small"
}

variable "ssh_public_key" {
  description = "SSH public key for EC2 access. Generate with: ssh-keygen -t ed25519"
  type        = string
}
