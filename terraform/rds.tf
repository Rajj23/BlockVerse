# DB Subnet Group (RDS requires subnets in 2 AZs even for single-AZ deployment)
resource "aws_db_subnet_group" "db_subnet_group" {
  name       = "${local.name}-db-subnet-group"
  subnet_ids = [aws_subnet.db_1.id, aws_subnet.db_2.id]

  tags = merge(local.tags, { Name = "${local.name}-db-subnet-group" })
}

# RDS Security Group — only reachable from the k3s EC2 instance
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

# RDS Parameter Group (MySQL 8.0)
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

# RDS Instance — Single AZ, cost-optimized
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

  # Single-AZ — this is a project, not SaaS
  multi_az            = false
  availability_zone   = "${var.aws_region}a"
  skip_final_snapshot = true

  tags = merge(local.tags, { Name = "${local.name}-mysql" })
}
