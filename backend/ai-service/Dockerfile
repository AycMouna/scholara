# AI Service Dockerfile
FROM python:3.11-alpine

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    gcc \
    g++ \
    musl-dev \
    linux-headers

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Pre-download AI models to cache them in the image
RUN python download_models.py

# Expose port
EXPOSE 8083

# Run server with increased timeout for AI models
CMD gunicorn ai_service.wsgi:application --bind 0.0.0.0:8083 --workers 1 --timeout 120 --preload
