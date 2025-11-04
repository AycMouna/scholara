# 🔧 Azure Translator API Setup Guide

## Overview

This guide will help you set up Azure Translator API for real translation functionality in the AI Chatbot Service.

## Step 1: Create Azure Translator Resource

1. **Go to Azure Portal:**
   - Visit https://portal.azure.com
   - Sign in with your Azure account (or create a free account)

2. **Create Translator Resource:**
   - Click **"+ Create a resource"**
   - Search for **"Translator"**
   - Click **"Translator"** → **"Create"**

3. **Configure the Resource:**
   - **Subscription:** Choose your subscription
   - **Resource Group:** Create new or use existing
   - **Region:** Choose closest to you (e.g., `eastus`, `westeurope`)
   - **Name:** e.g., `scholara-translator`
   - **Pricing Tier:** 
     - **Free (F0):** 2 million characters/month free
     - **S1:** Pay-as-you-go (for production)
   - Click **"Review + Create"** → **"Create"**

4. **Wait for Deployment:**
   - Wait 1-2 minutes for resource to be created
   - Click **"Go to resource"** when done

## Step 2: Get API Credentials

1. **Navigate to Keys and Endpoint:**
   - In your Translator resource, go to **"Keys and Endpoint"** (left sidebar)
   - Or go to **"Resource Management"** → **"Keys and Endpoint"**

2. **Copy Credentials:**
   - **Key 1** or **Key 2:** Copy one of these (both work)
   - **Location/Region:** Copy the region (e.g., `eastus`, `westeurope`)
   - **Endpoint:** Copy the endpoint URL (e.g., `https://api.cognitive.microsofttranslator.com`)

## Step 3: Configure Environment Variables

### For Local Development:

1. **Create/Update `.env` file** in `backend/ai-service/`:
   ```env
   AZURE_TRANSLATOR_KEY=your_key_here
   AZURE_TRANSLATOR_ENDPOINT=https://api.cognitive.microsofttranslator.com
   AZURE_TRANSLATOR_REGION=your_region_here
   ```

2. **Replace values:**
   - `your_key_here` → Your Azure Translator Key
   - `your_region_here` → Your Azure region (e.g., `eastus`)

### For Render Deployment:

1. **Go to Render Dashboard:**
   - Visit https://dashboard.render.com
   - Click on your service: **scholara-ai-service**

2. **Add Environment Variables:**
   - Go to **"Environment"** tab
   - Click **"Add Environment Variable"** for each:
   
   ```
   Key: AZURE_TRANSLATOR_KEY
   Value: your_azure_translator_key
   
   Key: AZURE_TRANSLATOR_ENDPOINT
   Value: https://api.cognitive.microsofttranslator.com
   
   Key: AZURE_TRANSLATOR_REGION
   Value: your_azure_region (e.g., eastus)
   ```

3. **Save and Redeploy:**
   - Render will automatically redeploy after adding environment variables
   - Wait 2-3 minutes for redeployment

## Step 4: Test the Integration

### Test Locally:

1. **Start the service:**
   ```bash
   cd backend/ai-service
   python manage.py runserver 8083
   ```

2. **Test with curl:**
   ```bash
   curl -X POST http://localhost:8083/api/translate/ \
     -H "Content-Type: application/json" \
     -d '{"text": "Bonjour, comment ça va ?", "target_language": "en"}'
   ```

3. **Expected Response:**
   ```json
   {
     "translated_text": "Hello, how are you?",
     "source_language": "fr",
     "target_language": "en",
     "original_text": "Bonjour, comment ça va ?"
   }
   ```

### Test on Render:

1. **Visit your Render service:**
   ```
   https://scholara-ai-service.onrender.com/api/translate/
   ```

2. **Test from frontend:**
   - Go to `/chatbot` page
   - Enter text in French: "Bonjour, comment ça va ?"
   - Select target language: "English"
   - Click "Translate"
   - Should show: "Hello, how are you?"

## Step 5: Verify It's Working

### Check Logs:

1. **Local:**
   - Check console output for: `✅ Translation successful: fr → en`

2. **Render:**
   - Go to Render Dashboard → Your Service → **Logs**
   - Look for successful translation messages

### Expected Behavior:

- ✅ **With Azure credentials:** Returns real translation
- ⚠️ **Without Azure credentials:** Returns placeholder with note

## Troubleshooting

### Issue: "Azure Translator API credentials not configured"

**Solution:**
- Make sure environment variables are set correctly
- Check `.env` file exists and has correct values
- For Render, verify environment variables in dashboard

### Issue: "Translation API error"

**Possible causes:**
- Invalid API key
- Wrong endpoint URL
- Wrong region
- Network issues

**Solution:**
- Verify credentials are correct
- Check Azure Portal for correct endpoint and region
- Test with curl to see specific error message

### Issue: "No translation result returned"

**Solution:**
- Check Azure service is active
- Verify you haven't exceeded free tier limits (2M chars/month)
- Check API key is valid

## Azure Translator Pricing

### Free Tier (F0):
- **2 million characters/month** for free
- Perfect for development and testing

### Standard Tier (S1):
- Pay per character translated
- ~$10 per 1 million characters
- Good for production

## Supported Languages

Azure Translator supports **100+ languages**. Some common ones:
- `en` - English
- `fr` - French
- `ar` - Arabic
- `es` - Spanish
- `de` - German
- `it` - Italian
- `pt` - Portuguese
- `zh` - Chinese
- `ja` - Japanese
- `ko` - Korean
- And many more!

## Next Steps

1. ✅ Set up Azure Translator resource
2. ✅ Get API credentials
3. ✅ Configure environment variables
4. ✅ Test translation
5. ✅ Deploy to Render with environment variables

## Resources

- **Azure Portal:** https://portal.azure.com
- **Azure Translator Documentation:** https://docs.microsoft.com/azure/cognitive-services/translator/
- **Supported Languages:** https://docs.microsoft.com/azure/cognitive-services/translator/language-support

## Success!

Once configured, your translation service will use real Azure Translator API for accurate translations in 100+ languages! 🎉

