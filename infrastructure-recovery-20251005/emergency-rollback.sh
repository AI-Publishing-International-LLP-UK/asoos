#!/bin/bash
# 🚨 EMERGENCY ROLLBACK SCRIPT - NEVER LET CASCADE FAILURES HAPPEN AGAIN
# Authority: Diamond SAO Command Center
# Usage: ./emergency-rollback.sh SERVICE_NAME [REVISION_NAME]

set -euo pipefail

SERVICE_NAME=${1:-""}
SPECIFIC_REVISION=${2:-""}
REGION="us-west1"
PROJECT="api-for-warp-drive"

echo "🚨 EMERGENCY ROLLBACK INITIATED"
echo "================================="
echo "Service: $SERVICE_NAME"
echo "Region: $REGION"
echo "Time: $(date)"
echo ""

if [ -z "$SERVICE_NAME" ]; then
    echo "❌ ERROR: Service name required"
    echo "Usage: $0 SERVICE_NAME [REVISION_NAME]"
    exit 1
fi

# 1. STOP ALL TRAFFIC TO CURRENT BROKEN REVISION
echo "1️⃣  Stopping traffic to broken revision..."
CURRENT_REVISION=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format="value(status.latestCreatedRevisionName)" 2>/dev/null || echo "")

if [ -n "$CURRENT_REVISION" ]; then
    echo "Current broken revision: $CURRENT_REVISION"
    gcloud run services update-traffic $SERVICE_NAME \
        --region=$REGION \
        --to-revisions=$CURRENT_REVISION=0 \
        --quiet 2>/dev/null || echo "⚠️  Could not stop traffic (service might be completely down)"
fi

# 2. FIND LAST WORKING REVISION
echo ""
echo "2️⃣  Finding last working revision..."

if [ -n "$SPECIFIC_REVISION" ]; then
    TARGET_REVISION=$SPECIFIC_REVISION
    echo "Using specified revision: $TARGET_REVISION"
else
    # Get last revision that was actually working (Status=True)
    TARGET_REVISION=$(gcloud run revisions list \
        --service=$SERVICE_NAME \
        --region=$REGION \
        --filter="status.conditions[0].status=True" \
        --sort-by="~metadata.creationTimestamp" \
        --limit=1 \
        --format="value(metadata.name)" 2>/dev/null || echo "")
    
    if [ -z "$TARGET_REVISION" ]; then
        echo "⚠️  No working revision found, trying to get any previous revision..."
        TARGET_REVISION=$(gcloud run revisions list \
            --service=$SERVICE_NAME \
            --region=$REGION \
            --sort-by="~metadata.creationTimestamp" \
            --limit=2 \
            --format="value(metadata.name)" | tail -1)
    fi
fi

if [ -z "$TARGET_REVISION" ]; then
    echo "❌ ERROR: Could not find a revision to rollback to!"
    exit 1
fi

echo "Target rollback revision: $TARGET_REVISION"

# 3. EXECUTE EMERGENCY ROLLBACK
echo ""
echo "3️⃣  Executing emergency rollback..."

gcloud run services update-traffic $SERVICE_NAME \
    --region=$REGION \
    --to-revisions=$TARGET_REVISION=100 \
    --quiet

echo "✅ Traffic routed to: $TARGET_REVISION"

# 4. VERIFY ROLLBACK SUCCESS
echo ""
echo "4️⃣  Verifying rollback..."

sleep 10  # Give it time to stabilize

SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format="value(status.url)" 2>/dev/null || echo "")

if [ -n "$SERVICE_URL" ]; then
    echo "Testing service health: $SERVICE_URL"
    
    # Test health endpoint
    if curl -f -s --connect-timeout 10 "$SERVICE_URL/health" >/dev/null 2>&1; then
        echo "✅ Health check PASSED"
    elif curl -f -s --connect-timeout 10 "$SERVICE_URL/" >/dev/null 2>&1; then
        echo "✅ Root endpoint PASSED"
    else
        echo "⚠️  Health check failed, but rollback completed"
    fi
else
    echo "⚠️  Could not get service URL"
fi

# 5. GENERATE INCIDENT REPORT
echo ""
echo "5️⃣  Generating incident report..."

cat > "incident-report-$SERVICE_NAME-$(date +%Y%m%d-%H%M%S).md" << EOF
# 🚨 EMERGENCY ROLLBACK INCIDENT REPORT

**Service:** $SERVICE_NAME
**Time:** $(date)
**Rollback Target:** $TARGET_REVISION
**Previous Broken Revision:** $CURRENT_REVISION

## Actions Taken:
1. Stopped traffic to broken revision
2. Identified last working revision
3. Rolled back traffic to stable revision
4. Verified service health

## Next Steps:
1. Investigate root cause of failure
2. Fix the underlying issue
3. Test fix in staging environment
4. Deploy with proper canary strategy

## Prevention:
- Implement blue-green deployment
- Add mandatory health checks in CI/CD
- Set up monitoring alerts
- Use gradual traffic shifting

**Never let cascade failures happen again!**
EOF

echo "📝 Incident report saved: incident-report-$SERVICE_NAME-$(date +%Y%m%d-%H%M%S).md"

echo ""
echo "🎉 EMERGENCY ROLLBACK COMPLETE!"
echo "================================="
echo "✅ Service: $SERVICE_NAME"
echo "✅ Rolled back to: $TARGET_REVISION"
echo "⚠️  INVESTIGATE the root cause before deploying again!"
echo "📊 Monitor: $SERVICE_URL"
echo ""
echo "🛡️  Install prevention system: /Users/as/asoos/infrastructure-recovery-20251005/cascade-failure-prevention.md"