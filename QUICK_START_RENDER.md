# ⚡ Quick Start: Deploy AI Service to Render

## 🎯 5-Minute Setup

### Step 1: Push to GitHub (if not already)
```bash
cd backend/ai-service
git add .
git commit -m "Ready for Render deployment"
git push
```

### Step 2: Deploy on Render

1. **Go to Render:** https://dashboard.render.com
2. **Click:** "New +" → "Web Service"
3. **Connect:** Your GitHub repository
4. **Configure:**
   - **Name:** `scholara-ai-service`
   - **Root Directory:** `backend/ai-service` (if repo is project root)
   - **Environment:** `Python 3`
   - **Build Command:**
     ```bash
     pip install -r requirements.txt && python manage.py collectstatic --noinput
     ```
   - **Start Command:**
     ```bash
     gunicorn ai_service.wsgi:application --bind 0.0.0.0:$PORT
     ```

5. **Environment Variables:**
   ```
   PYTHON_VERSION=3.11.0
   DJANGO_SETTINGS_MODULE=ai_service.settings
   DEBUG=False
   SECRET_KEY=<click "Generate" in Render>
   CORS_ALLOW_ALL_ORIGINS=False
   CORS_ALLOWED_ORIGINS=http://localhost:5173,https://your-frontend.onrender.com
   ```

6. **Click:** "Create Web Service"
7. **Wait:** 2-5 minutes for deployment

### Step 3: Get Your URL

After deployment, Render gives you a URL like:
```
https://scholara-ai-service.onrender.com
```

### Step 4: Update Frontend

1. **Create `.env` file in `frontend/` folder:**
   ```env
   VITE_AI_SERVICE_URL=https://scholara-ai-service.onrender.com/api
   ```

2. **Restart your frontend dev server:**
   ```bash
   cd frontend
   npm run dev
   ```

### Step 5: Test!

1. **Health Check:**
   ```
   https://your-service.onrender.com/api/health/
   ```

2. **Test from frontend:**
   - Go to `/chatbot` page
   - Try translation and summarization

## ✅ Done!

Your AI service is now live on Render!

## 📝 Important Notes

- **Free Tier:** Service sleeps after 15 min inactivity (first request may be slow)
- **Update CORS:** Add your frontend URL to `CORS_ALLOWED_ORIGINS` in Render
- **For Production:** Consider upgrading to paid plan for better performance

## 🔧 Troubleshooting

**Service won't start?**
- Check logs in Render dashboard
- Verify start command is correct

**CORS errors?**
- Update `CORS_ALLOWED_ORIGINS` with your frontend URL
- Redeploy service

**Can't connect from frontend?**
- Check `.env` file has correct URL
- Restart frontend after changing `.env`

## 📚 Full Guide

For detailed instructions, see `RENDER_DEPLOYMENT.md`


