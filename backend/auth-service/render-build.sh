#!/usr/bin/env bash
# Build script for Auth Service on Render

set -o errexit

echo "📦 Building Auth Service..."

# Navigate to auth-service directory
cd backend/auth-service

# Clean and build with Maven
mvn clean package -DskipTests

echo "✅ Auth Service build complete!"
