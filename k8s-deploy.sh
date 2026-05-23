#!/bin/bash
# ── BlockVerse K8s Deploy Script ─────────────────────────────────────────────
# Run this ONCE after `terraform apply` to apply all manifests to k3s.
# Usage: bash k8s-deploy.sh <EC2_ELASTIC_IP>
# Example: bash k8s-deploy.sh 13.234.X.X
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

EC2_IP="${1:?Usage: bash k8s-deploy.sh <EC2_ELASTIC_IP>}"
SSH_KEY="${SSH_KEY:-$HOME/.ssh/id_ed25519}"
REMOTE="ubuntu@$EC2_IP"
KUBECTL="kubectl --kubeconfig=/home/ubuntu/.kube/config"

echo "==> Deploying BlockVerse to k3s at $EC2_IP"

# ── 1. Wait for k3s to be fully ready ────────────────────────────────────────
echo "==> Waiting for k3s to be ready on EC2..."
until ssh -o StrictHostKeyChecking=no -i "$SSH_KEY" "$REMOTE" \
  "$KUBECTL get nodes 2>/dev/null | grep -q Ready"; do
  echo "   k3s not ready yet, retrying in 15s..."
  sleep 15
done
echo "   k3s is ready!"

# ── 2. Copy all K8s manifests to EC2 ─────────────────────────────────────────
echo "==> Copying K8s manifests to EC2..."
scp -r -i "$SSH_KEY" -o StrictHostKeyChecking=no \
  "$(dirname "$0")/k8s" "$REMOTE:/home/ubuntu/k8s"

# ── 3. Apply manifests in order ───────────────────────────────────────────────
echo "==> Applying K8s manifests..."
ssh -i "$SSH_KEY" "$REMOTE" bash << 'REMOTE_SCRIPT'
set -euo pipefail
K="kubectl --kubeconfig=/home/ubuntu/.kube/config"

echo "  Applying namespace..."
$K apply -f k8s/namespace/

echo "  Applying service account..."
$K apply -f k8s/serviceaccount/

echo "  Applying configmap and secrets..."
$K apply -f k8s/secrets/

echo "  Applying infrastructure (Redis, Kafka)..."
$K apply -f k8s/infrastructure/

echo "  Applying backend..."
$K apply -f k8s/backend/

echo "  Applying frontend..."
$K apply -f k8s/frontend/

echo "  Applying ingress..."
$K apply -f k8s/ingress/ingress.yaml

echo "  Waiting for pods to be ready..."
$K rollout status deployment/blockverse-backend  -n blockverse --timeout=180s
$K rollout status deployment/blockverse-frontend -n blockverse --timeout=180s

echo ""
echo "==> All done! Pod status:"
$K get pods -n blockverse
echo ""
echo "==> Access your app at: http://$1"
REMOTE_SCRIPT

echo ""
echo "==> Deployment complete! Open: http://$EC2_IP"
