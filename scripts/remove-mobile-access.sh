#!/bin/bash

# Remove Cloudflare Access from Mobile Apps
# This script will remove the Access applications blocking your mobile apps

set -e

echo "🚨 REMOVING CLOUDFLARE ACCESS FROM MOBILE APPS"
echo "=============================================="

# Account and domain details
ACCOUNT_ID="aef30d920913c188b9b6048cc7f42951"
MOBILE_IOS_DOMAIN="mobile-ios.asoos.2100.cool"
MOBILE_ANDROID_DOMAIN="mobile-android.asoos.2100.cool"

echo "📧 Getting Cloudflare credentials..."
CF_EMAIL=$(gcloud secrets versions access latest --secret=cloudflare-email)
CF_API_KEY=$(gcloud secrets versions access latest --secret=cloudflare-api-key)

echo "🔍 Finding Access applications for mobile domains..."

# Get all Access applications
ACCESS_APPS=$(curl -s -X GET "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/access/apps" \
  -H "X-Auth-Email: $CF_EMAIL" \
  -H "X-Auth-Key: $CF_API_KEY" \
  -H "Content-Type: application/json")

echo "📋 Access API Response:"
echo "$ACCESS_APPS"

# Check if we can find mobile domain applications
IOS_APP_ID=$(echo "$ACCESS_APPS" | jq -r '.result[]? | select(.domain | contains("mobile-ios")) | .id' 2>/dev/null || echo "")
ANDROID_APP_ID=$(echo "$ACCESS_APPS" | jq -r '.result[]? | select(.domain | contains("mobile-android")) | .id' 2>/dev/null || echo "")

echo "🎯 Found Application IDs:"
echo "iOS App ID: $IOS_APP_ID"
echo "Android App ID: $ANDROID_APP_ID"

# Remove iOS Access application if found
if [ -n "$IOS_APP_ID" ] && [ "$IOS_APP_ID" != "null" ]; then
  echo "🗑️ Removing iOS Access application ($IOS_APP_ID)..."
  DELETE_IOS=$(curl -s -X DELETE "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/access/apps/$IOS_APP_ID" \
    -H "X-Auth-Email: $CF_EMAIL" \
    -H "X-Auth-Key: $CF_API_KEY")
  echo "iOS Deletion Result: $DELETE_IOS"
else
  echo "⚠️ No iOS Access application found"
fi

# Remove Android Access application if found
if [ -n "$ANDROID_APP_ID" ] && [ "$ANDROID_APP_ID" != "null" ]; then
  echo "🗑️ Removing Android Access application ($ANDROID_APP_ID)..."
  DELETE_ANDROID=$(curl -s -X DELETE "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/access/apps/$ANDROID_APP_ID" \
    -H "X-Auth-Email: $CF_EMAIL" \
    -H "X-Auth-Key: $CF_API_KEY")
  echo "Android Deletion Result: $DELETE_ANDROID"
else
  echo "⚠️ No Android Access application found"
fi

echo ""
echo "🧪 TESTING MOBILE APP ACCESSIBILITY"
echo "===================================="

sleep 2

echo "📱 Testing iOS App..."
IOS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://$MOBILE_IOS_DOMAIN")
if [ "$IOS_STATUS" = "200" ]; then
  echo "✅ iOS App: Public Access Confirmed (Status: $IOS_STATUS)"
else
  echo "❌ iOS App: Still Protected (Status: $IOS_STATUS)"
fi

echo "🤖 Testing Android App..."
ANDROID_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://$MOBILE_ANDROID_DOMAIN")
if [ "$ANDROID_STATUS" = "200" ]; then
  echo "✅ Android App: Public Access Confirmed (Status: $ANDROID_STATUS)"
else
  echo "❌ Android App: Still Protected (Status: $ANDROID_STATUS)"
fi

echo ""
if [ "$IOS_STATUS" = "200" ] && [ "$ANDROID_STATUS" = "200" ]; then
  echo "🎉 SUCCESS! Both mobile apps are now publicly accessible!"
  echo ""
  echo "🚀 WHAT YOU CAN NOW SEE:"
  echo "📱 iOS App: https://$MOBILE_IOS_DOMAIN"
  echo "   • World's First Voice-Controlled DevOps CLI"
  echo "   • Dream Commander: 11M decisions/day"
  echo "   • Victory36 Protection Framework"
  echo "   • Biometric Security Ready"
  echo ""
  echo "🤖 Android App: https://$MOBILE_ANDROID_DOMAIN" 
  echo "   • Enterprise Mobile DevOps Platform"
  echo "   • 14 AI Voice Assistants"
  echo "   • Real-time Infrastructure Management"
  echo "   • Background Services & Widgets"
  echo ""
  echo "🏆 READY FOR APP STORE SUBMISSION!"
else
  echo "⚠️ Manual removal may be required via Cloudflare Dashboard:"
  echo "🔗 https://dash.cloudflare.com/$ACCOUNT_ID/access/applications"
fi