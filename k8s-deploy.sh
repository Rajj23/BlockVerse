#!/bin/bash
# BlockVerse Deploy Script
# Usage: bash k8s-deploy.sh <EC2_IP>
# Example: bash k8s-deploy.sh <EC2_IP>

EC2_IP="${1:?Please provide the EC2 IP: bash k8s-deploy.sh <EC2_IP>}"
SSH_KEY="${SSH_KEY:-$HOME/.ssh/id_ed25519}"
REMOTE="ubuntu@$EC2_IP"

echo "==> Connecting to $EC2_IP..."

# Step 1: Copy all k8s manifests to the server
echo "==> Copying k8s manifests..."
scp -r -i "$SSH_KEY" -o StrictHostKeyChecking=no ./k8s "$REMOTE:/home/ubuntu/k8s"

# Step 2: Apply the manifests on the server
echo "==> Applying manifests on EC2..."
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$REMOTE" bash << 'EOF'
K="kubectl"

echo "  [0/4] Preparing configurations and substituting placeholders..."
# Retrieve AWS account ID and region dynamically on the EC2 server
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
AWS_REGION=$(aws configure get region || echo "ap-south-1")

DB_HOST="blockverse-production-mysql.ch2uwg2a80dc.ap-south-1.rds.amazonaws.com"
S3_BUCKET="blockverse-production-assets-bucket-yjpr1x6d"
DOMAIN_NAME="blockverse.rajjaiswal.online"
EMAIL_ADDRESS="raj.jaiswal.work@gmail.com"

# Perform search-and-replace in the copied manifests on the server
find /home/ubuntu/k8s -name "*.yaml" -type f -exec sed -i \
  -e "s|<AWS_ACCOUNT_ID>|$AWS_ACCOUNT_ID|g" \
  -e "s|<AWS_REGION>|$AWS_REGION|g" \
  -e "s|<AWS_RDS_ENDPOINT>|$DB_HOST|g" \
  -e "s|<AWS_S3_BUCKET_NAME>|$S3_BUCKET|g" \
  -e "s|<YOUR_DOMAIN_NAME>|$DOMAIN_NAME|g" \
  -e "s|<YOUR_EMAIL_ADDRESS>|$EMAIL_ADDRESS|g" {} +

echo "  [1/4] Namespace, Config & Secrets..."
$K apply -f k8s/1-setup.yaml
$K apply -f k8s/secrets.yaml   # gitignored — applied separately

echo "  [2/4] Redis & Kafka..."
$K apply -f k8s/2-infrastructure.yaml

echo "  [3/4] Backend..."
$K apply -f k8s/3-backend.yaml

echo "  [4/4] Frontend & Ingress..."
$K apply -f k8s/4-frontend.yaml

echo ""
echo "==> Waiting for pods to start..."
$K rollout status deployment/blockverse-backend  -n blockverse --timeout=180s
$K rollout status deployment/blockverse-frontend -n blockverse --timeout=180s

echo ""
echo "==> Done! All pods:"
$K get pods -n blockverse
EOF

echo ""
echo "==> App is live at: http://$EC2_IP"
