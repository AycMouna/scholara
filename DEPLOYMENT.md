# 🚀 Deployment Guide

## Quick Setup on Render

### 1. Environment Variables

Add these on Render Dashboard → Your Service → Environment:

**For RapidAPI (Recommended):**
```
RAPIDAPI_KEY = your-rapidapi-key
RAPIDAPI_HOST = microsoft-translator-text-api3.p.rapidapi.com
CORS_ALLOW_ALL_ORIGINS = True  # Allow all origins (for localhost development)
```
*(Get key from https://rapidapi.com - subscribe to Microsoft Translator Text API)*

**Note:** Set `CORS_ALLOW_ALL_ORIGINS=True` on Render to allow requests from your local frontend (`http://localhost:5173`).

**Note:** The code supports both `microsoft-translator-text.p.rapidapi.com` and `microsoft-translator-text-api3.p.rapidapi.com`. Use the one that matches your RapidAPI subscription.

**For Azure Translator (Alternative):**
```
AZURE_TRANSLATOR_KEY = your-azure-key
AZURE_TRANSLATOR_ENDPOINT = https://api.cognitive.microsofttranslator.com/
AZURE_TRANSLATOR_REGION = westeurope
```

### 2. Render Settings

- **Root Directory:** `backend/ai-service`
- **Build Command:** `pip install -r requirements.txt && python manage.py collectstatic --noinput`
- **Start Command:** `gunicorn ai_service.wsgi:application --bind 0.0.0.0:$PORT`

### 3. Test

After deployment, test at: `https://your-service.onrender.com/api/health/`

## Local Development

1. Install dependencies: `pip install -r requirements.txt`
2. Run migrations: `python manage.py migrate`
3. Start server: `python manage.py runserver 8083`

## API Endpoints

- `GET/POST /api/translate/` - Translate text
- `GET/POST /api/summarize/` - Summarize text
- `GET /api/health/` - Health check
- `GET /api/languages/` - Supported languages

