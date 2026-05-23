# ── EC2 Security Group ────────────────────────────────────────────────────────
resource "aws_security_group" "k3s_sg" {
  name        = "${local.name}-k3s-sg"
  description = "Security group for k3s EC2 instance"
  vpc_id      = aws_vpc.main.id

  # SSH access (restrict to your IP in production)
  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # TODO: Restrict to your IP
  }

  # HTTP
  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # HTTPS
  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Kubernetes API (for kubectl from your machine)
  ingress {
    description = "Kubernetes API"
    from_port   = 6443
    to_port     = 6443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # TODO: Restrict to your IP
  }

  # All outbound traffic
  egress {
    from_port        = 0
    to_port          = 0
    protocol         = "-1"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  tags = merge(local.tags, { Name = "${local.name}-k3s-sg" })
}

# ── SSH Key Pair ──────────────────────────────────────────────────────────────
resource "aws_key_pair" "k3s_key" {
  key_name   = "${local.name}-k3s-key-v2"
  public_key = var.ssh_public_key

  tags = local.tags
}

# ── Elastic IP (static public IP for Route 53 A record) ──────────────────────
resource "aws_eip" "k3s" {
  domain   = "vpc"
  instance = aws_instance.k3s.id

  tags = merge(local.tags, { Name = "${local.name}-k3s-eip" })
}

# ── Bootstrap script for k3s ─────────────────────────────────────────────────
locals {
  ecr_registry = split("/", aws_ecr_repository.backend.repository_url)[0]

  k3s_userdata = templatefile("${path.module}/userdata.sh.tpl", {
    aws_region   = var.aws_region
    ecr_registry = local.ecr_registry
  })
}

# ── EC2 Instance (k3s single-node Kubernetes) ────────────────────────────────
resource "aws_instance" "k3s" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = var.ec2_instance_type
  key_name               = aws_key_pair.k3s_key.key_name
  vpc_security_group_ids = [aws_security_group.k3s_sg.id]
  subnet_id              = aws_subnet.public.id
  iam_instance_profile   = aws_iam_instance_profile.k3s_profile.name

  root_block_device {
    volume_size = 30
    volume_type = "gp3"
    encrypted   = true
  }

  user_data = local.k3s_userdata

  tags = merge(local.tags, { Name = "${local.name}-k3s-server" })
}

# ── Latest Ubuntu 22.04 LTS AMI ──────────────────────────────────────────────
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }

  filter {
    name   = "architecture"
    values = ["x86_64"]
  }
}


