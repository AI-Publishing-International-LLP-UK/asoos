#!/bin/bash
# Rapid deployment script for 20 FYEO-CEO niche sites
# Auto-generated: 2025-09-23T07:48:15.181Z

echo "🚀 Deploying 20 FYEO-CEO niche sites to GCP Cloud Run..."


# Deploy Technology (tech-ceo)
echo "📦 Deploying tech-ceo..."
gcloud run deploy fyeo-ceo-tech-ceo \
  --source=./web/niche-sites/ \
  --port=8080 \
  --region=us-west1 \
  --allow-unauthenticated \
  --set-env-vars="NICHE_ID=tech-ceo,NICHE_INDUSTRY=Technology" \
  --max-instances=100 \
  --memory=512Mi \
  --cpu=1000m \
  --quiet
echo "✅ tech-ceo deployed"

# Deploy Healthcare (healthcare-ceo)
echo "📦 Deploying healthcare-ceo..."
gcloud run deploy fyeo-ceo-healthcare-ceo \
  --source=./web/niche-sites/ \
  --port=8080 \
  --region=us-west1 \
  --allow-unauthenticated \
  --set-env-vars="NICHE_ID=healthcare-ceo,NICHE_INDUSTRY=Healthcare" \
  --max-instances=100 \
  --memory=512Mi \
  --cpu=1000m \
  --quiet
echo "✅ healthcare-ceo deployed"

# Deploy Financial Services (finance-ceo)
echo "📦 Deploying finance-ceo..."
gcloud run deploy fyeo-ceo-finance-ceo \
  --source=./web/niche-sites/ \
  --port=8080 \
  --region=us-west1 \
  --allow-unauthenticated \
  --set-env-vars="NICHE_ID=finance-ceo,NICHE_INDUSTRY=Financial Services" \
  --max-instances=100 \
  --memory=512Mi \
  --cpu=1000m \
  --quiet
echo "✅ finance-ceo deployed"

# Deploy Manufacturing (manufacturing-ceo)
echo "📦 Deploying manufacturing-ceo..."
gcloud run deploy fyeo-ceo-manufacturing-ceo \
  --source=./web/niche-sites/ \
  --port=8080 \
  --region=us-west1 \
  --allow-unauthenticated \
  --set-env-vars="NICHE_ID=manufacturing-ceo,NICHE_INDUSTRY=Manufacturing" \
  --max-instances=100 \
  --memory=512Mi \
  --cpu=1000m \
  --quiet
echo "✅ manufacturing-ceo deployed"

# Deploy Retail (retail-ceo)
echo "📦 Deploying retail-ceo..."
gcloud run deploy fyeo-ceo-retail-ceo \
  --source=./web/niche-sites/ \
  --port=8080 \
  --region=us-west1 \
  --allow-unauthenticated \
  --set-env-vars="NICHE_ID=retail-ceo,NICHE_INDUSTRY=Retail" \
  --max-instances=100 \
  --memory=512Mi \
  --cpu=1000m \
  --quiet
echo "✅ retail-ceo deployed"

# Deploy Energy (energy-ceo)
echo "📦 Deploying energy-ceo..."
gcloud run deploy fyeo-ceo-energy-ceo \
  --source=./web/niche-sites/ \
  --port=8080 \
  --region=us-west1 \
  --allow-unauthenticated \
  --set-env-vars="NICHE_ID=energy-ceo,NICHE_INDUSTRY=Energy" \
  --max-instances=100 \
  --memory=512Mi \
  --cpu=1000m \
  --quiet
echo "✅ energy-ceo deployed"

# Deploy Real Estate (real-estate-ceo)
echo "📦 Deploying real-estate-ceo..."
gcloud run deploy fyeo-ceo-real-estate-ceo \
  --source=./web/niche-sites/ \
  --port=8080 \
  --region=us-west1 \
  --allow-unauthenticated \
  --set-env-vars="NICHE_ID=real-estate-ceo,NICHE_INDUSTRY=Real Estate" \
  --max-instances=100 \
  --memory=512Mi \
  --cpu=1000m \
  --quiet
echo "✅ real-estate-ceo deployed"

# Deploy Legal Services (legal-ceo)
echo "📦 Deploying legal-ceo..."
gcloud run deploy fyeo-ceo-legal-ceo \
  --source=./web/niche-sites/ \
  --port=8080 \
  --region=us-west1 \
  --allow-unauthenticated \
  --set-env-vars="NICHE_ID=legal-ceo,NICHE_INDUSTRY=Legal Services" \
  --max-instances=100 \
  --memory=512Mi \
  --cpu=1000m \
  --quiet
echo "✅ legal-ceo deployed"

# Deploy Consulting (consulting-ceo)
echo "📦 Deploying consulting-ceo..."
gcloud run deploy fyeo-ceo-consulting-ceo \
  --source=./web/niche-sites/ \
  --port=8080 \
  --region=us-west1 \
  --allow-unauthenticated \
  --set-env-vars="NICHE_ID=consulting-ceo,NICHE_INDUSTRY=Consulting" \
  --max-instances=100 \
  --memory=512Mi \
  --cpu=1000m \
  --quiet
echo "✅ consulting-ceo deployed"

# Deploy Pharmaceutical (pharma-ceo)
echo "📦 Deploying pharma-ceo..."
gcloud run deploy fyeo-ceo-pharma-ceo \
  --source=./web/niche-sites/ \
  --port=8080 \
  --region=us-west1 \
  --allow-unauthenticated \
  --set-env-vars="NICHE_ID=pharma-ceo,NICHE_INDUSTRY=Pharmaceutical" \
  --max-instances=100 \
  --memory=512Mi \
  --cpu=1000m \
  --quiet
echo "✅ pharma-ceo deployed"

# Deploy Aerospace (aerospace-ceo)
echo "📦 Deploying aerospace-ceo..."
gcloud run deploy fyeo-ceo-aerospace-ceo \
  --source=./web/niche-sites/ \
  --port=8080 \
  --region=us-west1 \
  --allow-unauthenticated \
  --set-env-vars="NICHE_ID=aerospace-ceo,NICHE_INDUSTRY=Aerospace" \
  --max-instances=100 \
  --memory=512Mi \
  --cpu=1000m \
  --quiet
echo "✅ aerospace-ceo deployed"

# Deploy Automotive (automotive-ceo)
echo "📦 Deploying automotive-ceo..."
gcloud run deploy fyeo-ceo-automotive-ceo \
  --source=./web/niche-sites/ \
  --port=8080 \
  --region=us-west1 \
  --allow-unauthenticated \
  --set-env-vars="NICHE_ID=automotive-ceo,NICHE_INDUSTRY=Automotive" \
  --max-instances=100 \
  --memory=512Mi \
  --cpu=1000m \
  --quiet
echo "✅ automotive-ceo deployed"

# Deploy Biotechnology (biotech-ceo)
echo "📦 Deploying biotech-ceo..."
gcloud run deploy fyeo-ceo-biotech-ceo \
  --source=./web/niche-sites/ \
  --port=8080 \
  --region=us-west1 \
  --allow-unauthenticated \
  --set-env-vars="NICHE_ID=biotech-ceo,NICHE_INDUSTRY=Biotechnology" \
  --max-instances=100 \
  --memory=512Mi \
  --cpu=1000m \
  --quiet
echo "✅ biotech-ceo deployed"

# Deploy Media & Entertainment (media-ceo)
echo "📦 Deploying media-ceo..."
gcloud run deploy fyeo-ceo-media-ceo \
  --source=./web/niche-sites/ \
  --port=8080 \
  --region=us-west1 \
  --allow-unauthenticated \
  --set-env-vars="NICHE_ID=media-ceo,NICHE_INDUSTRY=Media & Entertainment" \
  --max-instances=100 \
  --memory=512Mi \
  --cpu=1000m \
  --quiet
echo "✅ media-ceo deployed"

# Deploy Telecommunications (telecom-ceo)
echo "📦 Deploying telecom-ceo..."
gcloud run deploy fyeo-ceo-telecom-ceo \
  --source=./web/niche-sites/ \
  --port=8080 \
  --region=us-west1 \
  --allow-unauthenticated \
  --set-env-vars="NICHE_ID=telecom-ceo,NICHE_INDUSTRY=Telecommunications" \
  --max-instances=100 \
  --memory=512Mi \
  --cpu=1000m \
  --quiet
echo "✅ telecom-ceo deployed"

# Deploy Agriculture (agriculture-ceo)
echo "📦 Deploying agriculture-ceo..."
gcloud run deploy fyeo-ceo-agriculture-ceo \
  --source=./web/niche-sites/ \
  --port=8080 \
  --region=us-west1 \
  --allow-unauthenticated \
  --set-env-vars="NICHE_ID=agriculture-ceo,NICHE_INDUSTRY=Agriculture" \
  --max-instances=100 \
  --memory=512Mi \
  --cpu=1000m \
  --quiet
echo "✅ agriculture-ceo deployed"

# Deploy Education (education-ceo)
echo "📦 Deploying education-ceo..."
gcloud run deploy fyeo-ceo-education-ceo \
  --source=./web/niche-sites/ \
  --port=8080 \
  --region=us-west1 \
  --allow-unauthenticated \
  --set-env-vars="NICHE_ID=education-ceo,NICHE_INDUSTRY=Education" \
  --max-instances=100 \
  --memory=512Mi \
  --cpu=1000m \
  --quiet
echo "✅ education-ceo deployed"

# Deploy Logistics (logistics-ceo)
echo "📦 Deploying logistics-ceo..."
gcloud run deploy fyeo-ceo-logistics-ceo \
  --source=./web/niche-sites/ \
  --port=8080 \
  --region=us-west1 \
  --allow-unauthenticated \
  --set-env-vars="NICHE_ID=logistics-ceo,NICHE_INDUSTRY=Logistics" \
  --max-instances=100 \
  --memory=512Mi \
  --cpu=1000m \
  --quiet
echo "✅ logistics-ceo deployed"

# Deploy Hospitality (hospitality-ceo)
echo "📦 Deploying hospitality-ceo..."
gcloud run deploy fyeo-ceo-hospitality-ceo \
  --source=./web/niche-sites/ \
  --port=8080 \
  --region=us-west1 \
  --allow-unauthenticated \
  --set-env-vars="NICHE_ID=hospitality-ceo,NICHE_INDUSTRY=Hospitality" \
  --max-instances=100 \
  --memory=512Mi \
  --cpu=1000m \
  --quiet
echo "✅ hospitality-ceo deployed"

# Deploy Government (government-ceo)
echo "📦 Deploying government-ceo..."
gcloud run deploy fyeo-ceo-government-ceo \
  --source=./web/niche-sites/ \
  --port=8080 \
  --region=us-west1 \
  --allow-unauthenticated \
  --set-env-vars="NICHE_ID=government-ceo,NICHE_INDUSTRY=Government" \
  --max-instances=100 \
  --memory=512Mi \
  --cpu=1000m \
  --quiet
echo "✅ government-ceo deployed"


echo "🎉 All 20 sites deployed successfully!"
echo "🌐 Sites are live and ready for traffic"
