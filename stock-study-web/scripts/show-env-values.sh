#!/bin/bash

# Display Firebase service account values for manual copy-paste to Vercel Dashboard
# Usage: ./scripts/show-env-values.sh

SERVICE_ACCOUNT_PATH="/Users/juyeon/Documents/02.project/stock-study-15-firebase-adminsdk-fbsvc-c330321e5d.json"

echo ""
echo "========================================="
echo "🔐 Firebase Admin SDK Environment Values"
echo "========================================="
echo ""
echo "Copy these values to Vercel Dashboard:"
echo "Settings → Environment Variables"
echo ""
echo "For each variable, select: Production, Preview, Development"
echo ""
echo "-----------------------------------------"
echo "1️⃣  FIREBASE_CLIENT_EMAIL"
echo "-----------------------------------------"
cat "$SERVICE_ACCOUNT_PATH" | jq -r '.client_email'
echo ""
echo "-----------------------------------------"
echo "2️⃣  FIREBASE_PRIVATE_KEY"
echo "-----------------------------------------"
echo "⚠️  Copy the ENTIRE value below (including quotes and \\n characters):"
echo ""
cat "$SERVICE_ACCOUNT_PATH" | jq -r '.private_key'
echo ""
echo "========================================="
echo ""
echo "📝 Quick Link:"
echo "https://vercel.com/dashboard → Your Project → Settings → Environment Variables"
echo ""
