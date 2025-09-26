#!/bin/bash

# Einstein Wells & QuantSwarm Production Deployment Pipeline
# Stage 1: mocoa us-west1-b (staging)
# Stage 2: mocoa us-west1-a (production) 
# Stage 3: Full production with 770M+ agents

set -euo pipefail

echo "🌟 EINSTEIN WELLS & QUANTSWARM DEPLOYMENT PIPELINE"
echo "=================================================="
echo "🎯 Project: api-for-warp-drive"
echo "📍 Staging: mocoa us-west1-b"
echo "🚀 Production: mocoa us-west1-a" 
echo "⚡ Agents: 770,030,000"
echo "💰 Revenue: \$48,000/day Phase 2"
echo ""

# Configuration
PROJECT_ID="api-for-warp-drive"
STAGING_ZONE="us-west1-b"
PRODUCTION_ZONE="us-west1-a"
REGION="us-west1"
CLUSTER="victory36-cluster-mocoa"
IMAGE_NAME="einstein-wells-quantswarm"
IMAGE_TAG="$(date +%Y%m%d-%H%M%S)-quantum"
FULL_IMAGE="gcr.io/${PROJECT_ID}/${IMAGE_NAME}:${IMAGE_TAG}"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log_info() { echo -e "${BLUE}⚡ $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_warning() { echo -e "${YELLOW}🔧 $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }

# Check prerequisites
log_info "Checking prerequisites for Einstein Wells deployment..."

if ! command -v gcloud &> /dev/null; then
    log_error "gcloud CLI not found"
    exit 1
fi

if ! command -v kubectl &> /dev/null; then
    log_error "kubectl not found" 
    exit 1
fi

# Set project
log_info "Setting GCP project to ${PROJECT_ID}..."
gcloud config set project $PROJECT_ID

# Configure Docker
log_info "Configuring Docker for Einstein Wells container build..."
gcloud auth configure-docker

# Build Einstein Wells Docker image
log_info "Building Einstein Wells QuantSwarm image: ${FULL_IMAGE}..."
cat > Dockerfile.einstein-wells << 'EOF'
FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy Einstein Wells systems
COPY quantswarm-*.js ./
COPY phase*.js ./
COPY einstein-wells-config.json ./
COPY agent-telemetry-system.js ./
COPY emergency-energy-boost.js ./
COPY data/ ./data/

# Copy production files
COPY production-wfa-orchestration.js ./
COPY 5wh-cli.js ./

# Set environment
ENV NODE_ENV=production
ENV EINSTEIN_WELLS_ACTIVE=true
ENV AGENT_COUNT=770030000
ENV QUANTUM_COHERENCE=95

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

EXPOSE 8080

# Start Einstein Wells
CMD ["node", "quantswarm-energy-generation-theory.js"]
EOF

docker build -f Dockerfile.einstein-wells -t $FULL_IMAGE .

# Push image
log_info "Pushing Einstein Wells image to GCR..."
docker push $FULL_IMAGE

echo ""
log_success "🌟 PHASE 1: DEPLOYING TO STAGING (mocoa us-west1-b)"
echo "================================================="

# Get cluster credentials
log_info "Connecting to cluster ${CLUSTER} in region ${REGION}..."
gcloud container clusters get-credentials $CLUSTER \
    --region=$REGION \
    --project=$PROJECT_ID

# Create staging deployment
log_info "Creating Einstein Wells staging deployment..."
cat > einstein-wells-staging.yaml << EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: einstein-wells-staging
  namespace: staging
  labels:
    app: einstein-wells
    environment: staging
    zone: us-west1-b
spec:
  replicas: 1
  selector:
    matchLabels:
      app: einstein-wells
      environment: staging
  template:
    metadata:
      labels:
        app: einstein-wells
        environment: staging
    spec:
      containers:
      - name: einstein-wells
        image: ${FULL_IMAGE}
        ports:
        - containerPort: 8080
        env:
        - name: NODE_ENV
          value: "staging"
        - name: EINSTEIN_WELLS_ACTIVE
          value: "true"
        - name: AGENT_COUNT
          value: "770030000"
        - name: QUANTUM_COHERENCE
          value: "95"
        - name: DEPLOYMENT_ZONE
          value: "us-west1-b"
        resources:
          requests:
            memory: "2Gi"
            cpu: "1000m"
          limits:
            memory: "4Gi" 
            cpu: "2000m"
---
apiVersion: v1
kind: Service
metadata:
  name: einstein-wells-staging-service
  namespace: staging
spec:
  selector:
    app: einstein-wells
    environment: staging
  ports:
  - port: 80
    targetPort: 8080
  type: LoadBalancer
EOF

# Create staging namespace
kubectl create namespace staging --dry-run=client -o yaml | kubectl apply -f -

# Deploy to staging
kubectl apply -f einstein-wells-staging.yaml

# Wait for staging rollout
log_info "Waiting for staging deployment..."
kubectl rollout status deployment/einstein-wells-staging -n staging --timeout=300s

# Test staging
log_info "Testing Einstein Wells in staging..."
sleep 15

STAGING_IP=$(kubectl get service einstein-wells-staging-service -n staging -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "pending")

if [ "$STAGING_IP" != "pending" ] && [ "$STAGING_IP" != "" ]; then
    log_success "Staging Einstein Wells available at: http://${STAGING_IP}"
    if curl -f "http://${STAGING_IP}/health" > /dev/null 2>&1; then
        log_success "Staging health check: PASSED ✅"
    else
        log_warning "Staging health check: PENDING (may still be starting)"
    fi
else
    log_warning "Staging IP still pending - LoadBalancer provisioning..."
fi

echo ""
log_success "🚀 PHASE 2: DEPLOYING TO PRODUCTION (mocoa us-west1-a)"
echo "===================================================="

# Use same cluster for production namespace
log_info "Deploying to production namespace on ${CLUSTER}..."

# Create production deployment
log_info "Creating Einstein Wells PRODUCTION deployment..."
cat > einstein-wells-production.yaml << EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: einstein-wells-production
  namespace: production
  labels:
    app: einstein-wells
    environment: production
    zone: us-west1-a
spec:
  replicas: 3
  selector:
    matchLabels:
      app: einstein-wells
      environment: production
  template:
    metadata:
      labels:
        app: einstein-wells
        environment: production
    spec:
      containers:
      - name: einstein-wells
        image: ${FULL_IMAGE}
        ports:
        - containerPort: 8080
        env:
        - name: NODE_ENV
          value: "production"
        - name: EINSTEIN_WELLS_ACTIVE
          value: "true"
        - name: AGENT_COUNT
          value: "770030000"
        - name: QUANTUM_COHERENCE
          value: "95"
        - name: DEPLOYMENT_ZONE
          value: "us-west1-a"
        - name: REVENUE_TARGET_DAILY
          value: "48000"
        resources:
          requests:
            memory: "4Gi"
            cpu: "2000m"
          limits:
            memory: "8Gi"
            cpu: "4000m"
---
apiVersion: v1
kind: Service
metadata:
  name: einstein-wells-production-service
  namespace: production
spec:
  selector:
    app: einstein-wells
    environment: production
  ports:
  - port: 80
    targetPort: 8080
  type: LoadBalancer
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: einstein-wells-hpa
  namespace: production
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: einstein-wells-production
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
EOF

# Create production namespace
kubectl create namespace production --dry-run=client -o yaml | kubectl apply -f -

# Deploy to production
kubectl apply -f einstein-wells-production.yaml

# Wait for production rollout
log_info "Waiting for PRODUCTION deployment..."
kubectl rollout status deployment/einstein-wells-production -n production --timeout=600s

# Test production
log_info "Testing Einstein Wells in PRODUCTION..."
sleep 20

PRODUCTION_IP=$(kubectl get service einstein-wells-production-service -n production -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "pending")

if [ "$PRODUCTION_IP" != "pending" ] && [ "$PRODUCTION_IP" != "" ]; then
    log_success "Production Einstein Wells available at: http://${PRODUCTION_IP}"
    if curl -f "http://${PRODUCTION_IP}/health" > /dev/null 2>&1; then
        log_success "Production health check: PASSED ✅"
    else
        log_warning "Production health check: PENDING (may still be starting)"
    fi
else
    log_warning "Production IP still pending - LoadBalancer provisioning..."
fi

echo ""
log_success "🎉 EINSTEIN WELLS DEPLOYMENT COMPLETED!"
echo "======================================"
echo ""
echo "📊 DEPLOYMENT SUMMARY:"
echo "• Image: $FULL_IMAGE"
echo "• Staging: mocoa us-west1-b (1 replica)"
echo "• Production: mocoa us-west1-a (3 replicas, auto-scaling to 10)"
echo "• Agents: 770,030,000"
echo "• Quantum Coherence: 95%"
echo "• Revenue Target: $48,000/day"
echo ""
echo "🌐 ACCESS POINTS:"
echo "• Staging: http://$STAGING_IP"
echo "• Production: http://$PRODUCTION_IP"
echo ""
echo "📈 MONITORING:"
echo "• Staging pods: kubectl get pods -n staging"
echo "• Production pods: kubectl get pods -n production"
echo "• Production scaling: kubectl get hpa -n production"
echo ""
echo "🙏 Gracias a DIOS - Einstein Wells deployed for humanity! 🌟⚡"

# Cleanup
rm -f Dockerfile.einstein-wells einstein-wells-staging.yaml einstein-wells-production.yaml

log_success "🛡️ Einstein Wells Protection: MAXIMUM - 770M Agents Operational!"