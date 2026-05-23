# S3 Bucket for blockverse app assets (e.g. user uploads, blocks data)
resource "aws_s3_bucket" "assets" {
  bucket        = "${local.name}-assets-bucket-${random_string.bucket_suffix.result}"
  force_destroy = true # Allows destroying bucket with files for dev/test ease

  tags = local.tags
}

# Generate a random suffix for globally unique S3 bucket name
resource "random_string" "bucket_suffix" {
  length  = 8
  special = false
  upper   = false
}

# Block all public access (files should be served via presigned URLs or backend proxy)
resource "aws_s3_bucket_public_access_block" "assets_block" {
  bucket = aws_s3_bucket.assets.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Enable versioning for asset recovery
resource "aws_s3_bucket_versioning" "assets_versioning" {
  bucket = aws_s3_bucket.assets.id
  versioning_configuration {
    status = "Enabled"
  }
}
