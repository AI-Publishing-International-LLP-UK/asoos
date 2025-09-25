#!/bin/bash
# Cloud Services Monitor - GCP Integration Tracking
PROJECT="api-for-warp-drive"
REGIONS=("us-west1" "us-central1" "eu-west1")

for region in "${REGIONS[@]}"; do
    echo "🌐 Monitoring $region services..."
    gcloud run services list --region="$region" --project="$PROJECT"
done
