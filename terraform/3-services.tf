# ── 3-services.tf ─────────────────────────────────────────────────────────────
# All AWS managed services: ECR, S3, RDS, IAM roles, and Secrets Manager.
# ──────────────────────────────────────────────────────────────────────────────

# ── ECR (Container Registries) ────────────────────────────────────────────────

resource "aws_ecr_repository" "backend" {
  name                 = "blockverse-backend"
  image_tag_mutability = "MUTABLE"
  image_scanning_configuration { scan_on_push = true }
  tags = local.tags
}

resource "aws_ecr_repository" "frontend" {
  name                 = "blockverse-frontend"
  image_tag_mutability = "MUTABLE"
  image_scanning_configuration { scan_on_push = true }
  tags = local.tags
}

# Auto-delete untagged images after 14 days and keep only the last 30 images
locals {
  ecr_lifecycle_policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Remove untagged images older than 14 days"
        selection = {
          tagStatus   = "untagged"
          countType   = "sinceImagePushed"
          countUnit   = "days"
          countNumber = 14
        }
        action = { type = "expire" }
      },
      {
        rulePriority = 2
        description  = "Keep only the last 30 tagged images"
        selection = {
          tagStatus   = "any"
          countType   = "imageCountMoreThan"
          countNumber = 30
        }
        action = { type = "expire" }
      }
    ]
  })
}

resource "aws_ecr_lifecycle_policy" "backend" {
  repository = aws_ecr_repository.backend.name
  policy     = local.ecr_lifecycle_policy
}

resource "aws_ecr_lifecycle_policy" "frontend" {
  repository = aws_ecr_repository.frontend.name
  policy     = local.ecr_lifecycle_policy
}

# ── S3 (Asset Storage) ────────────────────────────────────────────────────────

resource "random_string" "bucket_suffix" {
  length  = 8
  special = false
  upper   = false
}

resource "aws_s3_bucket" "assets" {
  bucket        = "${local.name}-assets-bucket-${random_string.bucket_suffix.result}"
  force_destroy = true
  tags          = local.tags
}

resource "aws_s3_bucket_public_access_block" "assets_block" {
  bucket                  = aws_s3_bucket.assets.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_versioning" "assets_versioning" {
  bucket = aws_s3_bucket.assets.id
  versioning_configuration { status = "Enabled" }
}

# ── RDS (MySQL Database) ──────────────────────────────────────────────────────

# RDS requires subnets in 2 AZs even for a single-AZ deployment
resource "aws_db_subnet_group" "db_subnet_group" {
  name       = "${local.name}-db-subnet-group"
  subnet_ids = [aws_subnet.db_1.id, aws_subnet.db_2.id]
  tags       = merge(local.tags, { Name = "${local.name}-db-subnet-group" })
}

# RDS Security Group — only reachable from the EC2 k3s instance
resource "aws_security_group" "rds_sg" {
  name        = "${local.name}-rds-sg"
  description = "Allow MySQL traffic from k3s EC2 only"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "MySQL from k3s"
    from_port       = 3306
    to_port         = 3306
    protocol        = "tcp"
    security_groups = [aws_security_group.k3s_sg.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(local.tags, { Name = "${local.name}-rds-sg" })
}

resource "aws_db_parameter_group" "rds_params" {
  name   = "${local.name}-rds-params"
  family = "mysql8.0"

  parameter {
    name  = "character_set_server"
    value = "utf8mb4"
  }

  parameter {
    name  = "collation_server"
    value = "utf8mb4_unicode_ci"
  }

  tags = local.tags
}

resource "aws_db_instance" "mysql" {
  identifier             = "${local.name}-mysql"
  engine                 = "mysql"
  engine_version         = "8.0"
  instance_class         = "db.t3.micro"
  allocated_storage      = 20
  max_allocated_storage  = 50
  storage_type           = "gp3"
  db_name                = "blockverse"
  username               = var.db_username
  password               = var.db_password
  db_subnet_group_name   = aws_db_subnet_group.db_subnet_group.name
  vpc_security_group_ids = [aws_security_group.rds_sg.id]
  parameter_group_name   = aws_db_parameter_group.rds_params.name
  multi_az               = false
  availability_zone      = "${var.aws_region}a"
  skip_final_snapshot    = true
  tags                   = merge(local.tags, { Name = "${local.name}-mysql" })
}

# ── IAM (EC2 Permissions) ─────────────────────────────────────────────────────
# Gives the EC2 instance permission to pull from ECR, write to S3, and read secrets.

resource "aws_iam_role" "k3s_instance_role" {
  name = "${local.name}-k3s-instance-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "ec2.amazonaws.com" }
    }]
  })

  tags = local.tags
}

resource "aws_iam_instance_profile" "k3s_profile" {
  name = "${local.name}-k3s-instance-profile"
  role = aws_iam_role.k3s_instance_role.name
}

# ECR Pull — so k3s can pull container images from ECR
resource "aws_iam_role_policy_attachment" "k3s_ecr_read" {
  role       = aws_iam_role.k3s_instance_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
}

# S3 Access — so backend pods can upload/download files
resource "aws_iam_policy" "s3_access" {
  name = "${local.name}-s3-access-policy"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["s3:PutObject", "s3:GetObject", "s3:DeleteObject", "s3:ListBucket"]
      Resource = [aws_s3_bucket.assets.arn, "${aws_s3_bucket.assets.arn}/*"]
    }]
  })

  tags = local.tags
}

resource "aws_iam_role_policy_attachment" "k3s_s3_access" {
  role       = aws_iam_role.k3s_instance_role.name
  policy_arn = aws_iam_policy.s3_access.arn
}

# ECR Push — so GitHub Actions CI/CD can push new images
resource "aws_iam_policy" "ecr_push" {
  name = "${local.name}-ecr-push-policy"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
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
    }]
  })

  tags = local.tags
}

resource "aws_iam_role_policy_attachment" "k3s_ecr_push" {
  role       = aws_iam_role.k3s_instance_role.name
  policy_arn = aws_iam_policy.ecr_push.arn
}

# ── Secrets Manager ───────────────────────────────────────────────────────────
# Stores DB password, JWT secret, and Redis password securely in AWS.

resource "aws_secretsmanager_secret" "db_password" {
  name                    = "${local.name}-db-password"
  recovery_window_in_days = 0
  tags                    = local.tags
}

resource "aws_secretsmanager_secret_version" "db_password" {
  secret_id     = aws_secretsmanager_secret.db_password.id
  secret_string = var.db_password
}

resource "random_password" "jwt" {
  length  = 64
  special = true
}

resource "aws_secretsmanager_secret" "jwt_secret" {
  name                    = "${local.name}-jwt-secret"
  recovery_window_in_days = 0
  tags                    = local.tags
}

resource "aws_secretsmanager_secret_version" "jwt" {
  secret_id     = aws_secretsmanager_secret.jwt_secret.id
  secret_string = random_password.jwt.result
}

resource "random_password" "redis" {
  length  = 32
  special = false
}

resource "aws_secretsmanager_secret" "redis_password" {
  name                    = "${local.name}-redis-password"
  recovery_window_in_days = 0
  tags                    = local.tags
}

resource "aws_secretsmanager_secret_version" "redis" {
  secret_id     = aws_secretsmanager_secret.redis_password.id
  secret_string = random_password.redis.result
}

# Secrets Manager Read — so the instance can fetch secrets at deploy time
resource "aws_iam_policy" "secrets_read" {
  name = "${local.name}-secrets-read-policy"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = ["secretsmanager:GetSecretValue", "secretsmanager:DescribeSecret"]
      Resource = [
        aws_secretsmanager_secret.db_password.arn,
        aws_secretsmanager_secret.jwt_secret.arn,
        aws_secretsmanager_secret.redis_password.arn
      ]
    }]
  })

  tags = local.tags
}

resource "aws_iam_role_policy_attachment" "k3s_secrets_read" {
  role       = aws_iam_role.k3s_instance_role.name
  policy_arn = aws_iam_policy.secrets_read.arn
}
