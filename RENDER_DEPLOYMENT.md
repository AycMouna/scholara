# 🚀 Deploy AI Service to Render - Step by Step Guide

## Prerequisites

1. **GitHub Account** - Render connects via GitHub
2. **Render Account** - Sign up at https://render.com (free tier available)
3. **Your AI Service Code** - Should be in a GitHub repository

## Step 1: Prepare Your Code

✅ Your code is already prepared! The following files are ready:
- `requirements.txt` - Includes gunicorn for production
- `render.yaml` - Render configuration
- `build.sh` - Build script
- `ai_service/settings.py` - Configured for Render

## Step 2: Push to GitHub

If your code isn't already on GitHub:

```bash
cd backend/ai-service
git init
git add .
git commit -m "Initial commit: AI Service ready for Render"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

**Note:** Make sure to push the `backend/ai-service` folder to GitHub, or create a separate repository just for the AI service.

## Step 3: Deploy on Render

### Option A: Using render.yaml (Recommended)

1. **Go to Render Dashboard:**
   - Visit https://dashboard.render.com
   - Click "New +" → "Blueprint"

2. **Connect Repository:**
   - Connect your GitHub account
   - Select the repository containing your AI service
   - Render will detect `render.yaml` automatically

3. **Configure:**
   - Render will read settings from `render.yaml`
   - Review the configuration
   - Click "Apply"

4. **Deploy:**
   - Render will automatically build and deploy
   - Wait for deployment to complete (2-5 minutes)

### Option B: Manual Setup

1. **Create New Web Service:**
   - Go to https://dashboard.render.com
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

2. **Configure Service:**
   - **Name:** `scholara-ai-service`
   - **Environment:** `Python 3`
   - **Region:** Choose closest to you
   - **Branch:** `main` (or your default branch)
   - **Root Directory:** `backend/ai-service` (if repo root is project root)
   
3. **Build & Start Commands:**
   - **Build Command:**
     ```bash
     pip install -r requirements.txt && python manage.py collectstatic --noinput
     ```
   - **Start Command:**
     ```bash
     gunicorn ai_service.wsgi:application --bind 0.0.0.0:$PORT
     ```

4. **Environment Variables:**
   Add these in Render dashboard:
   ```
   PYTHON_VERSION=3.11.0
   DJANGO_SETTINGS_MODULE=ai_service.settings
   DEBUG=False
   SECRET_KEY=<generate a random secret key>
   CORS_ALLOW_ALL_ORIGINS=False
   CORS_ALLOWED_ORIGINS=https://your-frontend.onrender.com,http://localhost:5173
   ```

5. **Deploy:**
   - Click "Create Web Service"
   - Wait for deployment (2-5 minutes)

## Step 4: Get Your Service URL

After deployment:
- Render will provide a URL like: `https://scholara-ai-service.onrender.com`
- Copy this URL - you'll need it for the frontend

## Step 5: Update Frontend

Update your frontend to use the Render URL:

1. **Update `frontend/src/services/apiService.js`:**

```javascript
// Replace localhost URL with Render URL
const AI_SERVICE_URL = process.env.VITE_AI_SERVICE_URL || 'https://scholara-ai-service.onrender.com/api';
```

Or create a `.env` file in frontend:
```env
VITE_AI_SERVICE_URL=https://scholara-ai-service.onrender.com/api
```

2. **Update CORS in AI Service:**
   - Go to Render dashboard → Your service → Environment
   - Update `CORS_ALLOWED_ORIGINS` with your frontend URL
   - Redeploy if needed

## Step 6: Test Your Deployment

1. **Test Health Endpoint:**
   ```
   https://your-service.onrender.com/api/health/
   ```

2. **Test Translation:**
   ```bash
   curl -X POST https://your-service.onrender.com/api/translate/ \
     -H "Content-Type: application/json" \
     -d '{"text": "Hello", "target_language": "fr"}'
   ```

3. **Test Summarization:**
   ```bash
   curl -X POST https://your-service.onrender.com/api/summarize/ \
     -H "Content-Type: application/json" \
     -d '{"text": "Your long text here...", "max_length": 150}'
   ```

## Step 7: (Optional) Integrate Real Translation API

For production translation, you can integrate:

### Azure Translator (Recommended)
1. Get Azure Translator API key from Azure Portal
2. Add to Render environment variables:
   ```
   AZURE_TRANSLATOR_KEY=your_key
   AZURE_TRANSLATOR_ENDPOINT=https://your-endpoint.cognitiveservices.azure.com/
   AZURE_TRANSLATOR_REGION=your_region
   ```
3. Update `ai_tools/services.py` with Azure SDK code (see DEPLOYMENT.md)

### Google Cloud Translation
1. Get Google Cloud credentials
2. Add to Render environment variables
3. Update service code

## Troubleshooting

### Build Fails
- Check build logs in Render dashboard
- Ensure `requirements.txt` has all dependencies
- Verify Python version matches (3.11)

### Service Won't Start
- Check start command is correct
- Verify `gunicorn` is in requirements.txt
- Check logs for error messages

### CORS Errors
- Update `CORS_ALLOWED_ORIGINS` with your frontend URL
- Ensure `CORS_ALLOW_ALL_ORIGINS=False` in production

### Static Files Not Loading
- Run `python manage.py collectstatic` during build
- Verify `whitenoise` is in requirements.txt and middleware

## Render Free Tier Limits

- **Sleep:** Services sleep after 15 minutes of inactivity
- **First Request:** May take 30-60 seconds to wake up
- **Bandwidth:** 100GB/month
- **For Production:** Consider upgrading to paid plan

## Next Steps

1. ✅ Deploy AI Service to Render
2. ✅ Update frontend with Render URL
3. ✅ Test all endpoints
4. ⏭️ (Optional) Integrate Azure Translator API
5. ⏭️ Deploy other services (Student, Course) to Render

## Support

- Render Docs: https://render.com/docs
- Render Status: https://status.render.com
- Django on Render: https://render.com/docs/deploy-django


