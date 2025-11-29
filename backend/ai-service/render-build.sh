#!/usr/bin/env bash
# Build script for AI Service on Render

set -o errexit

echo "📦 Building AI Service..."

# Navigate to ai-service directory
cd backend/ai-service

# Install dependencies
pip install -r requirements.txt

# Collect static files
python manage.py collectstatic --no-input

echo "✅ AI Service build complete!"
