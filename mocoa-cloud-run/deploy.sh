#!/bin/bash
# Simple mocoa deployment script
# Eliminates confusion and ensures we deploy to the right service

echo "🚀 Starting mocoa deployment..."

# Check if we're in the right directory
if [ ! -f "index.html" ]; then
    echo "❌ Error: Must run from mocoa-source directory"
    exit 1
fi

# Commit any changes
echo "📝 Committing changes..."
git add -A
git commit -m "Update mocoa interface - $(date)"

# Deploy to Cloud Run
echo "☁️ Deploying to Cloud Run..."
gcloud run deploy mocoa \
  --source=. \
  --region=us-west1 \
  --platform=managed \
  --allow-unauthenticated

echo "✅ Deployment complete!"
echo "🌐 Service URL: https://mocoa-yutylytffa-uw.a.run.app"

# Verify deployment
echo "🔍 Testing deployment..."
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" https://mocoa-yutylytffa-uw.a.run.app

echo "🎉 mocoa is live and ready!"
