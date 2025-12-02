#!/usr/bin/env bash
# Build script for Course Service on Render

set -o errexit

echo "📦 Building Course Service..."

# Navigate to course-service directory
cd backend/course-service

# Install dependencies
pip install -r requirements.txt

# Collect static files
python manage.py collectstatic --no-input

# Run migrations
python manage.py migrate

echo "✅ Course Service build complete!"
