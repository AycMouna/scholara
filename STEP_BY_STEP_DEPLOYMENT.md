# 🚀 Step-by-Step Render Deployment Guide

This guide walks you through deploying each service individually to Render.com.

---

## Prerequisites Checklist

Before starting, ensure you have:
- [ ] Render account created at [render.com](https://render.com)
- [ ] GitHub/GitLab/Bitbucket account
- [ ] Google OAuth credentials (optional, for auth)
- [ ] OpenAI API key (optional, for AI features)

---

## Phase 1: Repository Setup (15 minutes)

### Step 1.1: Initialize Git Repository

Open PowerShell in your project directory and run:

```powershell
cd c:\Users\hw\ntic-app

# Initialize Git
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit for Render deployment"
```

### Step 1.2: Create GitHub Repository

1. Go to [GitHub](https://github.com)
2. Click **"New repository"** (green button)
3. Repository name: `ntic-app` or `scholara-platform`
4. **Do NOT** initialize with README (we already have code)
5. Click **"Create repository"**

### Step 1.3: Push Code to GitHub

GitHub will show you commands. Run these:

```powershell
# Add GitHub as remote
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Push code
git branch -M main
git push -u origin main
```

**Checkpoint:** Your code should now be visible on GitHub.

---

## Phase 2: Database Setup (10 minutes)

We'll create databases first since services depend on them.

### Step 2.1: Create PostgreSQL Database #1 (Auth + Students)

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"PostgreSQL"**
3. Fill in details:
   - **Name**: `scholara-auth-students-db`
   - **Database**: `scholara_auth`
   - **User**: `scholara_user` (auto-filled)
   - **Region**: Oregon (Free)
   - **Plan**: Free
4. Click **"Create Database"**
5. **Wait ~2 minutes** for database to be ready

**Save these values** (click "Info" tab):
```
Internal Database URL: postgres://...
External Database URL: postgres://...
Host: ...
Port: 5432
Database: scholara_auth
Username: scholara_user
Password: ... (copy this!)
```

### Step 2.2: Create PostgreSQL Database #2 (Courses)

1. Click **"New +"** → **"PostgreSQL"**
2. Fill in details:
   - **Name**: `scholara-courses-db`
   - **Database**: `scholara_courses`
   - **User**: `scholara_user` (auto-filled)
   - **Region**: Oregon (Free)
   - **Plan**: Free
3. Click **"Create Database"**
4. **Save the connection details** as above

**Checkpoint:** You should see 2 databases in your dashboard, both showing "Available" status.

---

## Phase 3: Backend Services (45 minutes)

We'll deploy backend services in dependency order.

---

### SERVICE 1: Auth Service (Spring Boot)

This is the authentication service - deploy it first as other services may depend on it.

#### Step 3.1: Create Web Service

1. Dashboard → **"New +"** → **"Web Service"**
2. Click **"Build and deploy from a Git repository"** → **"Next"**
3. Select your repository: `YOUR_USERNAME/ntic-app`
4. Click **"Connect"**

#### Step 3.2: Configure Service

Fill in the configuration form:

**Basic Settings:**
- **Name**: `scholara-auth-service`
- **Region**: Oregon (Free)
- **Branch**: `main`
- **Root Directory**: `backend/auth-service`
- **Environment**: `Docker`
- **Plan**: Free

**Build & Deploy:**
- **Dockerfile Path**: `backend/auth-service/Dockerfile` (auto-detected)

#### Step 3.3: Add Environment Variables

Scroll down to **Environment Variables** and add these (click "Add Environment Variable"):

```
SPRING_PROFILES_ACTIVE = prod
SPRING_DATASOURCE_URL = [Copy Internal Database URL from Step 2.1]
SPRING_DATASOURCE_USERNAME = scholara_user
SPRING_DATASOURCE_PASSWORD = [Copy password from Step 2.1]
SPRING_DATASOURCE_DRIVER_CLASS_NAME = org.postgresql.Driver
SPRING_JPA_DATABASE_PLATFORM = org.hibernate.dialect.PostgreSQLDialect
JWT_SECRET = [Generate: 64 random characters - use password generator]
JWT_EXPIRATION = 86400000
GOOGLE_CLIENT_ID = [Your Google OAuth Client ID or leave empty]
GOOGLE_CLIENT_SECRET = [Your Google OAuth Secret or leave empty]
SERVER_PORT = 8080
```

**To generate JWT_SECRET**, you can use this PowerShell command:
```powershell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | ForEach-Object {[char]$_})
```

#### Step 3.4: Advanced Settings

Expand **Advanced**:
- **Health Check Path**: `/actuator/health`
- **Auto-Deploy**: Yes (checked)

#### Step 3.5: Deploy

1. Click **"Create Web Service"**
2. **Wait 5-10 minutes** for build and deployment
3. Watch the logs - you should see:
   - Maven downloading dependencies
   - Compilation
   - Docker image creation
   - Deployment
   - Health check passed

**Checkpoint:** Service shows "Live" with green dot. URL: `https://scholara-auth-service.onrender.com`

Test it: Visit `https://scholara-auth-service.onrender.com/actuator/health`
Should return: `{"status":"UP"}`

---

### SERVICE 2: Student Service (Spring Boot + GraphQL)

#### Step 3.6: Create Web Service

1. Dashboard → **"New +"** → **"Web Service"**
2. Connect repository (same as before)
3. Configure:

**Basic Settings:**
- **Name**: `scholara-student-service`
- **Region**: Oregon (Free)
- **Branch**: `main`
- **Root Directory**: `backend/student-service`
- **Environment**: `Docker`
- **Plan**: Free

#### Step 3.7: Environment Variables

```
SPRING_PROFILES_ACTIVE = prod
SPRING_DATASOURCE_URL = [Same Internal Database URL from Step 2.1]
SPRING_DATASOURCE_USERNAME = scholara_user
SPRING_DATASOURCE_PASSWORD = [Same password from Step 2.1]
SPRING_DATASOURCE_DRIVER_CLASS_NAME = org.postgresql.Driver
SPRING_JPA_DATABASE_PLATFORM = org.hibernate.dialect.PostgreSQLDialect
SERVER_PORT = 8081
```

#### Step 3.8: Advanced Settings

- **Health Check Path**: `/actuator/health`
- **Auto-Deploy**: Yes

#### Step 3.9: Deploy

Click **"Create Web Service"** and wait ~5-10 minutes.

**Checkpoint:** Service shows "Live". Test: `https://scholara-student-service.onrender.com/actuator/health`

---

### SERVICE 3: Course Service (Django)

#### Step 3.10: Create Web Service

1. Dashboard → **"New +"** → **"Web Service"**
2. Connect repository
3. Configure:

**Basic Settings:**
- **Name**: `scholara-course-service`
- **Region**: Oregon (Free)
- **Branch**: `main`
- **Root Directory**: `backend/course-service`
- **Environment**: `Docker`
- **Plan**: Free

#### Step 3.11: Environment Variables

```
PYTHON_VERSION = 3.11.0
DEBUG = False
SECRET_KEY = [Generate 50 random characters]
ALLOWED_HOSTS = .onrender.com
DB_NAME = scholara_courses
DB_USER = scholara_user
DB_PASSWORD = [Copy password from Step 2.2]
DB_HOST = [Copy host from Step 2.2 - internal host]
DB_PORT = 5432
```

**To generate Django SECRET_KEY** (PowerShell):
```powershell
-join ((65..90) + (97..122) + (48..57) + 33,35,36,37,38,42,43,45,61,63,64,94 | Get-Random -Count 50 | ForEach-Object {[char]$_})
```

#### Step 3.12: Deploy

Click **"Create Web Service"** and wait ~5-8 minutes.

**Checkpoint:** Service shows "Live". Test: `https://scholara-course-service.onrender.com/api/courses/`

---

### SERVICE 4: AI Service (Django + ML)

⚠️ **Note:** This service needs more resources. Use **Starter plan ($7/month)** or it may fail due to memory limits.

#### Step 3.13: Create Web Service

1. Dashboard → **"New +"** → **"Web Service"**
2. Connect repository
3. Configure:

**Basic Settings:**
- **Name**: `scholara-ai-service`
- **Region**: Oregon (Free)
- **Branch**: `main`
- **Root Directory**: `backend/ai-service`
- **Environment**: `Docker`
- **Plan**: **Starter** ($7/month) - ML models need RAM

#### Step 3.14: Environment Variables

```
PYTHON_VERSION = 3.11.0
DEBUG = False
SECRET_KEY = [Generate 50 random characters]
ALLOWED_HOSTS = .onrender.com
OPENAI_API_KEY = [Your OpenAI API key or leave empty]
```

#### Step 3.15: Deploy

Click **"Create Web Service"** and wait ~8-12 minutes (ML dependencies take time).

**Checkpoint:** Service shows "Live". Test: `https://scholara-ai-service.onrender.com/api/ai/`

---

### SERVICE 5: API Gateway (Spring Cloud Gateway)

#### Step 3.16: Create Web Service

1. Dashboard → **"New +"** → **"Web Service"**
2. Connect repository
3. Configure:

**Basic Settings:**
- **Name**: `scholara-api-gateway`
- **Region**: Oregon (Free)
- **Branch**: `main`
- **Root Directory**: `backend/api-gateway`
- **Environment**: `Docker`
- **Plan**: Free

#### Step 3.17: Environment Variables

Now we connect all services together:

```
SPRING_PROFILES_ACTIVE = prod
AUTH_SERVICE_URL = https://scholara-auth-service.onrender.com
STUDENT_SERVICE_URL = https://scholara-student-service.onrender.com
COURSE_SERVICE_URL = https://scholara-course-service.onrender.com
AI_SERVICE_URL = https://scholara-ai-service.onrender.com
SERVER_PORT = 8080
```

#### Step 3.18: Advanced Settings

- **Health Check Path**: `/actuator/health`
- **Auto-Deploy**: Yes

#### Step 3.19: Deploy

Click **"Create Web Service"** and wait ~5-8 minutes.

**Checkpoint:** Service shows "Live". Test: `https://scholara-api-gateway.onrender.com/actuator/health`

---

## Phase 4: Frontend (15 minutes)

### SERVICE 6: React Frontend

#### Step 4.1: Create Static Site

1. Dashboard → **"New +"** → **"Static Site"**
2. Connect repository
3. Configure:

**Basic Settings:**
- **Name**: `scholara-frontend`
- **Region**: Oregon (Free)
- **Branch**: `main`
- **Root Directory**: `frontend`

**Build Settings:**
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`

#### Step 4.2: Environment Variables

```
NODE_VERSION = 18.17.0
VITE_API_GATEWAY_URL = https://scholara-api-gateway.onrender.com
```

#### Step 4.3: Rewrite Rules

Important for React Router!

Click **"Redirects/Rewrites"** → **"Add Rule"**:
- **Source**: `/*`
- **Destination**: `/index.html`
- **Action**: Rewrite

#### Step 4.4: Deploy

Click **"Create Static Site"** and wait ~3-5 minutes.

**Checkpoint:** Site shows "Live". Visit: `https://scholara-frontend.onrender.com`

---

## Phase 5: Verification & Testing (15 minutes)

### Step 5.1: Check All Services

Go to your Render dashboard. You should see:

✅ 6 Services:
- `scholara-auth-service` - Live
- `scholara-student-service` - Live
- `scholara-course-service` - Live
- `scholara-ai-service` - Live
- `scholara-api-gateway` - Live
- `scholara-frontend` - Live

✅ 2 Databases:
- `scholara-auth-students-db` - Available
- `scholara-courses-db` - Available

### Step 5.2: Test Each Service

Open each URL in browser:

**Health Checks:**
```
https://scholara-auth-service.onrender.com/actuator/health
https://scholara-student-service.onrender.com/actuator/health
https://scholara-api-gateway.onrender.com/actuator/health
```

**API Endpoints:**
```
https://scholara-course-service.onrender.com/api/courses/
https://scholara-ai-service.onrender.com/api/ai/
```

**Frontend:**
```
https://scholara-frontend.onrender.com
```

### Step 5.3: Test API Gateway Routing

```
https://scholara-api-gateway.onrender.com/api/auth/health
https://scholara-api-gateway.onrender.com/api/students/
https://scholara-api-gateway.onrender.com/api/courses/
```

### Step 5.4: Test Frontend → Backend

1. Open frontend URL
2. Try to register a new user
3. Try to login
4. Check browser console for errors

---

## Phase 6: Post-Deployment Configuration

### Step 6.1: Update CORS Settings

If you get CORS errors, update your backend services to allow the frontend domain.

In `CorsGlobalFilter.java` or similar CORS config, add:
```
https://scholara-frontend.onrender.com
```

### Step 6.2: Database Migrations

Check logs to ensure database tables were created:

1. Click on Auth Service → **"Logs"** tab
2. Look for Hibernate creating tables
3. Should see: `create table users`, `create table roles`, etc.

If not, you may need to manually run migrations.

### Step 6.3: Seed Data (Optional)

If you have seed data scripts, run them via Render Shell:

1. Service → **"Shell"** tab
2. Connect to shell
3. Run migration commands

---

## Troubleshooting Common Issues

### Issue 1: Service Won't Start

**Symptoms:** Service stuck on "Deploying" or shows "Failed"

**Solutions:**
1. Check logs: Service → Logs tab
2. Look for errors in build or startup
3. Common fixes:
   - Verify Dockerfile path
   - Check environment variables
   - Ensure database is running
   - Verify dependencies in pom.xml/requirements.txt

### Issue 2: Database Connection Failed

**Symptoms:** Logs show "Connection refused" or "Authentication failed"

**Solutions:**
1. Verify database URL is the **Internal Database URL**
2. Check username/password are correct
3. Ensure database is "Available" status
4. Use PostgreSQL dialect, not MySQL

### Issue 3: Build Timeout

**Symptoms:** Build takes >15 minutes and times out

**Solutions:**
1. Use Docker instead of native buildpack
2. Optimize Dockerfile (multi-stage builds)
3. Reduce dependencies
4. For AI service: upgrade to Starter plan

### Issue 4: CORS Errors

**Symptoms:** Frontend can't access API

**Solutions:**
1. Update CORS configuration in API Gateway
2. Add frontend domain to allowed origins
3. Ensure credentials are included in requests

### Issue 5: Frontend Shows Blank Page

**Symptoms:** Frontend loads but shows nothing

**Solutions:**
1. Check browser console for errors
2. Verify rewrite rules are set (/* → /index.html)
3. Check environment variables
4. Verify API_GATEWAY_URL is correct

### Issue 6: Free Tier Sleep

**Symptoms:** Services take 30-60 seconds to respond after inactivity

**Solutions:**
1. This is normal for free tier (sleep after 15 min)
2. Upgrade to paid plan for always-on services
3. Use UptimeRobot to ping services every 10 min
4. Accept the delay for development

---

## Next Steps

### Production Optimization

1. **Custom Domain**
   - Purchase domain
   - Add to Render service
   - Update DNS records

2. **SSL Certificates**
   - Automatically provided by Render
   - No action needed

3. **Monitoring**
   - Set up health check alerts
   - Configure error notifications
   - Use external monitoring (UptimeRobot, Pingdom)

4. **Scaling**
   - Monitor resource usage
   - Upgrade plans as needed
   - Consider database scaling

5. **Backups**
   - Enable automatic backups (included)
   - Test restore procedures
   - Export important data regularly

---

## Cost Summary

**Current Setup:**
- 5 Web Services (Free): $0
- 1 AI Service (Starter): $7/month
- 2 Databases (Free): $0

**Monthly Cost: $7**

**To Upgrade to Production:**
- Starter plan for all services: ~$56/month
- No sleep time, better performance

---

## Congratulations! 🎉

Your Scholara platform is now live on Render!

**URLs:**
- **Frontend**: https://scholara-frontend.onrender.com
- **API Gateway**: https://scholara-api-gateway.onrender.com

Share these with your team and start testing!

---

**Need Help?**
- Check Render docs: https://render.com/docs
- Join community: https://community.render.com
- Contact support: support@render.com

**Good luck with your deployment! 🚀**
