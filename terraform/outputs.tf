# ── EC2 / k3s Outputs ─────────────────────────────────────────────────────────
output "k3s_public_ip" {
  description = "Public IP (Elastic IP) of the k3s server"
  value       = aws_eip.k3s.public_ip
}

output "k3s_instance_id" {
  description = "EC2 instance ID of the k3s server"
  value       = aws_instance.k3s.id
}

output "ssh_command" {
  description = "SSH command to connect to the k3s server"
  value       = "ssh -i ~/.ssh/id_ed25519 ubuntu@${aws_eip.k3s.public_ip}"
}

output "kubeconfig_command" {
  description = "Command to fetch kubeconfig from k3s server to your local machine"
  value       = "scp -i ~/.ssh/id_ed25519 ubuntu@${aws_eip.k3s.public_ip}:/etc/rancher/k3s/k3s.yaml ~/.kube/blockverse-config"
}

# ── ECR Outputs ───────────────────────────────────────────────────────────────
output "ecr_backend_url" {
  description = "ECR backend repository URL"
  value       = aws_ecr_repository.backend.repository_url
}

output "ecr_frontend_url" {
  description = "ECR frontend repository URL"
  value       = aws_ecr_repository.frontend.repository_url
}

# ── RDS Outputs ───────────────────────────────────────────────────────────────
output "rds_endpoint" {
  description = "RDS MySQL connection endpoint (host:port)"
  value       = aws_db_instance.mysql.endpoint
}

output "rds_hostname" {
  description = "RDS MySQL host"
  value       = aws_db_instance.mysql.address
}

# ── S3 Outputs ────────────────────────────────────────────────────────────────
output "s3_bucket_name" {
  description = "S3 bucket name for app assets"
  value       = aws_s3_bucket.assets.id
}

# ── DNS Outputs ───────────────────────────────────────────────────────────────
output "app_url" {
  description = "Application URL"
  value       = "http://${aws_eip.k3s.public_ip}"
}
