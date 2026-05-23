# ── EC2 Instance Profile (allows the instance to pull from ECR, access S3, read Secrets Manager) ──

resource "aws_iam_role" "k3s_instance_role" {
  name = "${local.name}-k3s-instance-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })

  tags = local.tags
}

resource "aws_iam_instance_profile" "k3s_profile" {
  name = "${local.name}-k3s-instance-profile"
  role = aws_iam_role.k3s_instance_role.name
}

# ECR Pull — so k3s can pull container images
resource "aws_iam_role_policy_attachment" "k3s_ecr_read" {
  role       = aws_iam_role.k3s_instance_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
}

# S3 Access — so backend pods can read/write app assets
resource "aws_iam_policy" "s3_access" {
  name        = "${local.name}-s3-access-policy"
  description = "Allows backend to read/write to the app S3 bucket"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:GetObject",
          "s3:DeleteObject",
          "s3:ListBucket"
        ]
        Resource = [
          aws_s3_bucket.assets.arn,
          "${aws_s3_bucket.assets.arn}/*"
        ]
      }
    ]
  })

  tags = local.tags
}

resource "aws_iam_role_policy_attachment" "k3s_s3_access" {
  role       = aws_iam_role.k3s_instance_role.name
  policy_arn = aws_iam_policy.s3_access.arn
}

# ECR Push — so CI/CD on the instance can push images (optional, mainly for Jenkins on same box)
resource "aws_iam_policy" "ecr_push" {
  name        = "${local.name}-ecr-push-policy"
  description = "Allows pushing images to ECR (for CI/CD)"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ecr:GetAuthorizationToken",
          "ecr:BatchCheckLayerAvailability",
          "ecr:InitiateLayerUpload",
          "ecr:UploadLayerPart",
          "ecr:CompleteLayerUpload",
          "ecr:PutImage",
          "ecr:BatchGetImage",
          "ecr:GetDownloadUrlForLayer"
        ]
        Resource = "*"
      }
    ]
  })

  tags = local.tags
}

resource "aws_iam_role_policy_attachment" "k3s_ecr_push" {
  role       = aws_iam_role.k3s_instance_role.name
  policy_arn = aws_iam_policy.ecr_push.arn
}

# Secrets Manager Read — so the instance can fetch secrets at deploy time
resource "aws_iam_policy" "secrets_read" {
  name        = "${local.name}-secrets-read-policy"
  description = "Allows reading secrets from Secrets Manager"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue",
          "secretsmanager:DescribeSecret"
        ]
        Resource = [
          aws_secretsmanager_secret.db_password.arn,
          aws_secretsmanager_secret.jwt_secret.arn,
          aws_secretsmanager_secret.redis_password.arn
        ]
      }
    ]
  })

  tags = local.tags
}

resource "aws_iam_role_policy_attachment" "k3s_secrets_read" {
  role       = aws_iam_role.k3s_instance_role.name
  policy_arn = aws_iam_policy.secrets_read.arn
}
