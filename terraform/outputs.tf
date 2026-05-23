# ── outputs.tf ────────────────────────────────────────────────────────────────
# Values printed after `terraform apply` — useful references.
# ──────────────────────────────────────────────────────────────────────────────

output "app_url" {
  description = "Application URL"
  value       = "http://${aws_eip.k3s.public_ip}"
}

output "ssh_command" {
  description = "SSH into the k3s server"
  value       = "ssh -i ~/.ssh/id_ed25519 ubuntu@${aws_eip.k3s.public_ip}"
}

output "k3s_public_ip" {
  description = "Elastic IP of the k3s server"
  value       = aws_eip.k3s.public_ip
}

output "ecr_backend_url" {
  description = "ECR backend image URL"
  value       = aws_ecr_repository.backend.repository_url
}

output "ecr_frontend_url" {
  description = "ECR frontend image URL"
  value       = aws_ecr_repository.frontend.repository_url
}

output "rds_endpoint" {
  description = "RDS MySQL endpoint"
  value       = aws_db_instance.mysql.endpoint
}

output "s3_bucket_name" {
  description = "S3 bucket for app assets"
  value       = aws_s3_bucket.assets.id
}
