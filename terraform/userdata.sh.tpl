#!/bin/bash
set -euo pipefail
exec > /var/log/userdata.log 2>&1

echo "==> Starting BlockVerse EC2 bootstrap at $(date)"

# ── 1. System update ─────────────────────────────────────────────────────────
apt-get update -y
apt-get install -y curl unzip ca-certificates

# ── 2. Install AWS CLI v2 ────────────────────────────────────────────────────
echo "==> Installing AWS CLI v2"
curl -fsSL "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o /tmp/awscliv2.zip
unzip -q /tmp/awscliv2.zip -d /tmp
/tmp/aws/install
rm -rf /tmp/awscliv2.zip /tmp/aws
echo "AWS CLI version: $(aws --version)"

# ── 3. Install k3s (lightweight Kubernetes) ──────────────────────────────────
echo "==> Installing k3s"
curl -sfL https://get.k3s.io | INSTALL_K3S_EXEC="--disable traefik" sh -
# Wait until k3s is ready
sleep 15
until kubectl get nodes 2>/dev/null | grep -q " Ready"; do
  echo "Waiting for k3s to be ready..."
  sleep 5
done
echo "k3s is ready"

# Give ubuntu user kubectl access (no sudo needed)
mkdir -p /home/ubuntu/.kube
cp /etc/rancher/k3s/k3s.yaml /home/ubuntu/.kube/config
sed -i "s|127.0.0.1|$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)|g" /home/ubuntu/.kube/config
chown -R ubuntu:ubuntu /home/ubuntu/.kube
chmod 600 /home/ubuntu/.kube/config

# ── 4. Install Helm ──────────────────────────────────────────────────────────
echo "==> Installing Helm"
curl -fsSL https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# ── 5. Install nginx-ingress via Helm ────────────────────────────────────────
echo "==> Installing nginx-ingress"
export KUBECONFIG=/etc/rancher/k3s/k3s.yaml
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update
helm upgrade --install ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-nginx \
  --create-namespace \
  --set controller.service.type=NodePort \
  --set controller.service.nodePorts.http=80 \
  --set controller.service.nodePorts.https=443 \
  --set controller.hostPort.enabled=true \
  --wait --timeout 3m

# ── 6. Install cert-manager via Helm ────────────────────────────────────────
echo "==> Installing cert-manager"
helm repo add jetstack https://charts.jetstack.io
helm repo update
helm upgrade --install cert-manager jetstack/cert-manager \
  --namespace cert-manager \
  --create-namespace \
  --set crds.enabled=true \
  --wait --timeout 3m

# ── 7. ECR login script (k3s uses containerd — we patch containerd config) ──
echo "==> Setting up ECR credentials for containerd"
ECR_REGISTRY="${ecr_registry}"
AWS_REGION="${aws_region}"

cat > /usr/local/bin/ecr-login.sh << 'ECRSCRIPT'
#!/bin/bash
set -euo pipefail
ECR_REGISTRY="__ECR_REGISTRY__"
AWS_REGION="__AWS_REGION__"

# Get ECR token
TOKEN=$(aws ecr get-login-password --region "$AWS_REGION")

# Write containerd config for ECR auth
mkdir -p /etc/rancher/k3s
cat > /etc/rancher/k3s/registries.yaml << REGISTRIESYAML
mirrors:
  "$ECR_REGISTRY":
    endpoint:
      - "https://$ECR_REGISTRY"
configs:
  "$ECR_REGISTRY":
    auth:
      username: AWS
      password: "$TOKEN"
REGISTRIESYAML

# Restart k3s so it picks up the new registry config
systemctl restart k3s
sleep 10
echo "ECR login refreshed at $(date)"
ECRSCRIPT

# Replace placeholders in the script
sed -i "s|__ECR_REGISTRY__|$ECR_REGISTRY|g" /usr/local/bin/ecr-login.sh
sed -i "s|__AWS_REGION__|$AWS_REGION|g" /usr/local/bin/ecr-login.sh
chmod +x /usr/local/bin/ecr-login.sh

# Run it once immediately
/usr/local/bin/ecr-login.sh

# Refresh every 10 hours (ECR tokens expire after 12 hours)
echo "0 */10 * * * root /usr/local/bin/ecr-login.sh >> /var/log/ecr-login.log 2>&1" > /etc/cron.d/ecr-login

echo "==> Bootstrap complete at $(date)"
