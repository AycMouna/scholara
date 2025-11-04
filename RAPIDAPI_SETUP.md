# 🚀 RapidAPI Microsoft Translator Setup

## Quick Setup for RapidAPI

### Step 1: Get RapidAPI Credentials

1. **Go to RapidAPI:** https://rapidapi.com
2. **Sign up/Login**
3. **Subscribe to Microsoft Translator API:**
   - Search for "Microsoft Translator Text"
   - Subscribe to the API (usually has a free tier)
   - Go to "API Details" or "Endpoints"

4. **Get Your Credentials:**
   - **X-RapidAPI-Key:** Your RapidAPI key (found in your account dashboard)
   - **X-RapidAPI-Host:** Usually `microsoft-translator-text.p.rapidapi.com`

### Step 2: Configure on Render

1. **Go to Render Dashboard:**
   - Visit https://dashboard.render.com
   - Click on **scholara-ai-service**
   - Go to **"Environment"** tab

2. **Add Environment Variables:**

   ```
   Key: RAPIDAPI_KEY
   Value: your-rapidapi-key-here
   ```
   *(Your RapidAPI key from RapidAPI dashboard)*

   ```
   Key: RAPIDAPI_HOST
   Value: https://microsoft-translator-text.p.rapidapi.com
   ```
   *(Or the exact host from RapidAPI API documentation)*

3. **Save** - Render will auto-redeploy

### Step 3: Test

After deployment:
1. Go to `/chatbot` page
2. Enter text: "Bonjour"
3. Select: English
4. Click Translate
5. Should return real translation!

## Environment Variables on Render

Add these two variables:

```
RAPIDAPI_KEY = your-rapidapi-key
RAPIDAPI_HOST = https://microsoft-translator-text.p.rapidapi.com
```

## How It Works

The code will:
1. **First check for RapidAPI** credentials (`RAPIDAPI_KEY` and `RAPIDAPI_HOST`)
2. **If RapidAPI is configured:** Use RapidAPI endpoint
3. **If not, check for Azure:** Use Azure Translator if configured
4. **If neither:** Use placeholder

## Priority Order

1. ✅ **RapidAPI** (if `RAPIDAPI_KEY` and `RAPIDAPI_HOST` are set)
2. ✅ **Azure Translator** (if `AZURE_TRANSLATOR_KEY` and `AZURE_TRANSLATOR_ENDPOINT` are set)
3. ⚠️ **Placeholder** (if neither is configured)

## Important Notes

- **RapidAPI Key:** Found in your RapidAPI account dashboard
- **RapidAPI Host:** Check the exact host in RapidAPI API documentation
- **Make sure you're subscribed** to the Microsoft Translator API on RapidAPI
- **Check your RapidAPI quota/limits** to avoid rate limit errors

## Troubleshooting

### Issue: Still getting 401 error

**Solutions:**
- Verify your RapidAPI key is correct
- Make sure you're subscribed to Microsoft Translator API
- Check the host is exactly as shown in RapidAPI docs
- Verify key hasn't expired

### Issue: Rate limit errors

**Solution:**
- Check your RapidAPI subscription tier
- Upgrade if needed
- Check usage limits in RapidAPI dashboard

### Issue: Wrong endpoint

**Solution:**
- Check RapidAPI API documentation for exact endpoint
- Verify `RAPIDAPI_HOST` includes the full URL with `https://`
- Common host: `microsoft-translator-text.p.rapidapi.com`

## Success!

Once you add `RAPIDAPI_KEY` and `RAPIDAPI_HOST` on Render, the translation service will use RapidAPI! 🎉

