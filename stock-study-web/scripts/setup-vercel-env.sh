#!/bin/bash

# Setup Vercel Environment Variables for Firebase Admin SDK
# This script adds Firebase service account credentials to Vercel

set -e

SERVICE_ACCOUNT_PATH="/Users/juyeon/Documents/02.project/stock-study-15-firebase-adminsdk-fbsvc-c330321e5d.json"

echo "🔧 Setting up Vercel environment variables..."
echo ""

# Extract values from service account JSON
CLIENT_EMAIL=$(cat "$SERVICE_ACCOUNT_PATH" | jq -r '.client_email')
PRIVATE_KEY=$(cat "$SERVICE_ACCOUNT_PATH" | jq -r '.private_key')

echo "📧 Client Email: $CLIENT_EMAIL"
echo ""

# Create temporary files for the values
TEMP_EMAIL_FILE=$(mktemp)
TEMP_KEY_FILE=$(mktemp)

echo -n "$CLIENT_EMAIL" > "$TEMP_EMAIL_FILE"
echo -n "$PRIVATE_KEY" > "$TEMP_KEY_FILE"

echo "⬆️  Adding FIREBASE_CLIENT_EMAIL to Vercel..."
cat "$TEMP_EMAIL_FILE" | vercel env add FIREBASE_CLIENT_EMAIL production
cat "$TEMP_EMAIL_FILE" | vercel env add FIREBASE_CLIENT_EMAIL preview
cat "$TEMP_EMAIL_FILE" | vercel env add FIREBASE_CLIENT_EMAIL development
echo "✅ FIREBASE_CLIENT_EMAIL added"
echo ""

echo "⬆️  Adding FIREBASE_PRIVATE_KEY to Vercel..."
cat "$TEMP_KEY_FILE" | vercel env add FIREBASE_PRIVATE_KEY production
cat "$TEMP_KEY_FILE" | vercel env add FIREBASE_PRIVATE_KEY preview
cat "$TEMP_KEY_FILE" | vercel env add FIREBASE_PRIVATE_KEY development
echo "✅ FIREBASE_PRIVATE_KEY added"
echo ""

# Cleanup
rm -f "$TEMP_EMAIL_FILE" "$TEMP_KEY_FILE"

echo "🎉 All environment variables added to Vercel!"
echo ""
echo "Next steps:"
echo "1. Commit and push your changes: git push"
echo "2. Deploy to production: vercel --prod"
echo "3. Test signup on production"
echo ""
