# 🚀 Deployment Guide - AI Service

## Cloud Deployment Options

Your teacher suggested using **Azure** or **Render** for deployment. Here's how to deploy the AI Service:

## Option 1: Azure App Service

### Prerequisites
- Azure account (free tier available)
- Azure CLI installed

### Steps

1. **Create Azure App Service:**
   ```bash
   az webapp create --resource-group scholara-rg --plan scholara-plan --name scholara-ai-service --runtime "PYTHON:3.11"
   ```

2. **Configure Azure Translator API:**
   - Go to Azure Portal → Create Resource → "Translator"
   - Get your API key and endpoint
   - Update `ai_tools/services.py` to use Azure Translator SDK

3. **Deploy:**
   ```bash
   cd backend/ai-service
   az webapp up --name scholara-ai-service --runtime "PYTHON:3.11"
   ```

4. **Update settings:**
   - Add environment variables in Azure Portal:
     - `AZURE_TRANSLATOR_KEY`
     - `AZURE_TRANSLATOR_ENDPOINT`
     - `AZURE_TRANSLATOR_REGION`

## Option 2: Render

### Steps

1. **Create a new Web Service:**
   - Go to https://render.com
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

2. **Configure:**
   - **Name:** scholara-ai-service
   - **Environment:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn ai_service.wsgi:application --bind 0.0.0.0:$PORT`

3. **Add Environment Variables:**
   - `DJANGO_SETTINGS_MODULE=ai_service.settings`
   - `DEBUG=False`
   - `ALLOWED_HOSTS=your-service.onrender.com`

4. **Deploy:**
   - Render will automatically deploy on git push

## Integrating Real Translation APIs

### Azure Translator Integration

Update `ai_tools/services.py`:

```python
from azure.ai.translation.text import TextTranslationClient, TranslatorCredential
from azure.core.credentials import AzureKeyCredential
import os

def translate_text(text, target_language='en'):
    key = os.getenv('AZURE_TRANSLATOR_KEY')
    endpoint = os.getenv('AZURE_TRANSLATOR_ENDPOINT')
    region = os.getenv('AZURE_TRANSLATOR_REGION', 'global')
    
    credential = TranslatorCredential(key, region)
    client = TextTranslationClient(credential=credential, endpoint=endpoint)
    
    result = client.translate(content=[text], to=[target_language])
    translated = result[0].translations[0].text
    
    return {
        'translated_text': translated,
        'target_language': target_language,
        'original_text': text
    }
```

### Google Cloud Translation Integration

```python
from google.cloud import translate_v2 as translate

def translate_text(text, target_language='en'):
    client = translate.Client()
    result = client.translate(text, target_language=target_language)
    
    return {
        'translated_text': result['translatedText'],
        'source_language': result['detectedSourceLanguage'],
        'target_language': target_language,
        'original_text': text
    }
```

## Current Status

The AI Service currently uses placeholder implementations. To enable real translation and summarization:

1. **For Translation:** Integrate with Azure Translator API or Google Cloud Translation
2. **For Summarization:** Integrate with Azure Text Analytics or use libraries like `transformers` or `sumy`

## Notes

- The current implementation is a **placeholder** to demonstrate the API structure
- For production, you must integrate with cloud translation/summarization services
- Both Azure and Render offer free tiers for development
- Update `requirements.txt` when adding new dependencies

