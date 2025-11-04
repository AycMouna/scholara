# ✅ Render Deployment Checklist

## Pre-Deployment (I've prepared these for you)

- [x] ✅ Added `gunicorn` and `whitenoise` to `requirements.txt`
- [x] ✅ Updated `settings.py` for Render (dynamic PORT, CORS, static files)
- [x] ✅ Created `render.yaml` configuration file
- [x] ✅ Created `build.sh` build script
- [x] ✅ Created `.gitignore` file
- [x] ✅ Updated frontend to use environment variable for AI service URL
- [x] ✅ Created deployment documentation

## Steps You Need to Do

### Step 1: Initialize Git Repository

**Option A: If you have Git installed:**
```bash
cd backend/ai-service
git init
git add .
git commit -m "Ready for Render deployment"
```

**Option B: Run the batch script:**
```bash
cd backend/ai-service
DEPLOY_TO_RENDER.bat
```

### Step 2: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `scholara-ai-service`
3. Description: "AI Chatbot Service for SCHOLARA - Translation and Summarization"
4. **Important:** Don't check "Add a README file" or any other options
5. Click "Create repository"

### Step 3: Connect Local Repository to GitHub

```bash
cd backend/ai-service
git remote add origin https://github.com/YOUR_USERNAME/scholara-ai-service.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username.

### Step 4: Deploy on Render

1. **Go to Render Dashboard:**
   - Visit https://dashboard.render.com
   - Sign up/Login (free account works)

2. **Create New Web Service:**
   - Click "New +" → "Web Service"
   - Connect your GitHub account (if not already connected)
   - Select the repository: `scholara-ai-service`

3. **Configure Service:**
   - **Name:** `scholara-ai-service`
   - **Region:** Choose closest to you
   - **Branch:** `main`
   - **Root Directory:** Leave empty (if repo is `backend/ai-service`) OR set to `.` if repo root is `ai-service`
   - **Environment:** `Python 3`
   - **Build Command:**
     ```
     pip install -r requirements.txt && python manage.py collectstatic --noinput
     ```
   - **Start Command:**
     ```
     gunicorn ai_service.wsgi:application --bind 0.0.0.0:$PORT
     ```

4. **Environment Variables:**
   Click "Advanced" → "Add Environment Variable" and add:
   ```
   PYTHON_VERSION = 3.11.0
   DJANGO_SETTINGS_MODULE = ai_service.settings
   DEBUG = False
   SECRET_KEY = <Click "Generate" button in Render>
   CORS_ALLOW_ALL_ORIGINS = False
   CORS_ALLOWED_ORIGINS = http://localhost:5173
   ```
   (You'll update CORS_ALLOWED_ORIGINS later with your frontend URL)

5. **Click "Create Web Service"**

6. **Wait for Deployment:**
   - First deployment takes 2-5 minutes
   - Watch the logs to see progress
   - When done, you'll see "Live" status

### Step 5: Get Your Service URL

After deployment, Render will show:
```
https://scholara-ai-service.onrender.com
```

Copy this URL!

### Step 6: Update Frontend

1. **Create `.env` file in `frontend/` folder:**
   ```env
   VITE_AI_SERVICE_URL=https://scholara-ai-service.onrender.com/api
   ```

2. **Restart frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

### Step 7: Test Deployment

1. **Test Health Endpoint:**
   Open in browser:
   ```
   https://scholara-ai-service.onrender.com/api/health/
   ```
   Should return: `{"status": "ok", "service": "ai-service"}`

2. **Test from Frontend:**
   - Go to your frontend `/chatbot` page
   - Try translating some text
   - Try summarizing some text

### Step 8: Update CORS (After Frontend is Deployed)

Once your frontend is also deployed:
1. Go to Render → Your AI Service → Environment
2. Update `CORS_ALLOWED_ORIGINS`:
   ```
   http://localhost:5173,https://your-frontend.onrender.com
   ```
3. Save and redeploy (or it auto-redeploys)

## Troubleshooting

### Build Fails
- Check build logs in Render
- Verify `requirements.txt` is correct
- Make sure Python version matches

### Service Won't Start
- Check start command is exactly: `gunicorn ai_service.wsgi:application --bind 0.0.0.0:$PORT`
- Verify gunicorn is in requirements.txt
- Check logs for error messages

### CORS Errors
- Update `CORS_ALLOWED_ORIGINS` with your frontend URL
- Make sure `CORS_ALLOW_ALL_ORIGINS=False` in production

### Service Sleeps (Free Tier)
- Free tier services sleep after 15 minutes
- First request after sleep takes 30-60 seconds
- This is normal for free tier

## Success! 🎉

Your AI service is now live on Render!

## Next Steps

- Deploy other services (Student, Course) to Render
- Integrate Azure Translator API for real translation
- Upgrade to paid plan for better performance


