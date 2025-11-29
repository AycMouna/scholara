# 🚀 Scholara Platform - Render Deployment Guide

This guide will help you deploy your complete Scholara microservices platform to Render.com.

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Deployment Options](#deployment-options)
3. [Option 1: Blueprint Deployment (Recommended)](#option-1-blueprint-deployment-recommended)
4. [Option 2: Manual Deployment](#option-2-manual-deployment)
5. [Configuration](#configuration)
6. [Environment Variables](#environment-variables)
7. [Database Setup](#database-setup)
8. [Monitoring & Logs](#monitoring--logs)
9. [Cost Estimation](#cost-estimation)
10. [Troubleshooting](#troubleshooting)

---

## 🔧 Prerequisites

1. **Render Account**: Sign up at [render.com](https://render.com)
2. **Git Repository**: Push your code to GitHub, GitLab, or Bitbucket
3. **Google OAuth** (optional): Client ID and Secret for Google authentication
4. **OpenAI API Key** (optional): For AI chatbot functionality

---

## 🎯 Deployment Options

### Option 1: Blueprint Deployment (Recommended) ⭐
Deploy all services at once using the `render.yaml` blueprint file.

### Option 2: Manual Deployment
Deploy each service individually through the Render dashboard.

---

## 📘 Option 1: Blueprint Deployment (Recommended)

### Step 1: Push Code to Git Repository

```bash
git init
git add .
git commit -m "Initial commit for Render deployment"
git remote add origin YOUR_GIT_REPOSITORY_URL
git push -u origin main
```

### Step 2: Connect to Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New"** → **"Blueprint"**
3. Connect your Git repository
4. Select your repository and branch (usually `main`)

### Step 3: Configure Blueprint

Render will automatically detect the `render.yaml` file. Review and confirm:

- ✅ 2 Databases (MySQL & PostgreSQL)
- ✅ 6 Web Services
  - Auth Service (Java)
  - Student Service (Java)
  - Course Service (Python)
  - AI Service (Python)
  - API Gateway (Java)
  - Frontend (Static Site)

### Step 4: Set Environment Variables

Before deploying, you need to add these secret values in the Render dashboard:

#### Auth Service
- `GOOGLE_CLIENT_ID` - Your Google OAuth Client ID
- `GOOGLE_CLIENT_SECRET` - Your Google OAuth Client Secret

#### AI Service
- `OPENAI_API_KEY` - Your OpenAI API key (if using OpenAI)

### Step 5: Deploy

1. Click **"Apply"** to start the deployment
2. Render will:
   - Create databases
   - Build each service
   - Deploy services in the correct order
   - Configure environment variables

⏱️ **Deployment Time**: 15-30 minutes for all services

---

## 📗 Option 2: Manual Deployment

### Step 1: Create Databases

#### MySQL Database (for Auth & Student Services)
1. Dashboard → **"New"** → **"PostgreSQL"** (Render uses PostgreSQL instead of MySQL)
2. Name: `scholara-mysql`
3. Database: `scholara_students`
4. Plan: Free
5. Click **"Create Database"**

#### PostgreSQL Database (for Course Service)
1. Dashboard → **"New"** → **"PostgreSQL"**
2. Name: `scholara-postgres`
3. Database: `scholara_courses`
4. Plan: Free
5. Click **"Create Database"**

### Step 2: Deploy Backend Services

#### Auth Service (Spring Boot)

1. Dashboard → **"New"** → **"Web Service"**
2. Connect repository → Select `backend/auth-service`
3. Configuration:
   - **Name**: `scholara-auth-service`
   - **Environment**: `Docker`
   - **Region**: Oregon (or closest to you)
   - **Branch**: `main`
   - **Root Directory**: `backend/auth-service`
   - **Plan**: Free

4. **Environment Variables**:
   ```
   SPRING_PROFILES_ACTIVE=prod
   SPRING_DATASOURCE_URL=<MySQL connection string>
   SPRING_DATASOURCE_USERNAME=<MySQL user>
   SPRING_DATASOURCE_PASSWORD=<MySQL password>
   JWT_SECRET=<generate-random-string-64-chars>
   JWT_EXPIRATION=86400000
   GOOGLE_CLIENT_ID=<your-google-client-id>
   GOOGLE_CLIENT_SECRET=<your-google-client-secret>
   ```

5. **Health Check Path**: `/actuator/health`
6. Click **"Create Web Service"**

#### Student Service (Spring Boot + GraphQL)

1. Dashboard → **"New"** → **"Web Service"**
2. Configuration:
   - **Name**: `scholara-student-service`
   - **Environment**: `Docker`
   - **Root Directory**: `backend/student-service`

3. **Environment Variables**:
   ```
   SPRING_PROFILES_ACTIVE=prod
   SPRING_DATASOURCE_URL=<MySQL connection string>
   SPRING_DATASOURCE_USERNAME=<MySQL user>
   SPRING_DATASOURCE_PASSWORD=<MySQL password>
   ```

4. **Health Check Path**: `/actuator/health`

#### Course Service (Django)

1. Dashboard → **"New"** → **"Web Service"**
2. Configuration:
   - **Name**: `scholara-course-service`
   - **Environment**: `Docker`
   - **Root Directory**: `backend/course-service`

3. **Environment Variables**:
   ```
   DEBUG=False
   DB_NAME=scholara_courses
   DB_USER=<PostgreSQL user>
   DB_PASSWORD=<PostgreSQL password>
   DB_HOST=<PostgreSQL host>
   DB_PORT=5432
   SECRET_KEY=<generate-random-string>
   ALLOWED_HOSTS=*
   ```

#### AI Service (Django + ML)

1. Dashboard → **"New"** → **"Web Service"**
2. Configuration:
   - **Name**: `scholara-ai-service`
   - **Environment**: `Docker`
   - **Root Directory**: `backend/ai-service`
   - **Plan**: Starter ($7/month) - AI models need more resources

3. **Environment Variables**:
   ```
   DEBUG=False
   SECRET_KEY=<generate-random-string>
   ALLOWED_HOSTS=*
   OPENAI_API_KEY=<your-openai-key>
   ```

#### API Gateway (Spring Cloud Gateway)

1. Dashboard → **"New"** → **"Web Service"**
2. Configuration:
   - **Name**: `scholara-api-gateway`
   - **Environment**: `Docker`
   - **Root Directory**: `backend/api-gateway`

3. **Environment Variables**:
   ```
   SPRING_PROFILES_ACTIVE=prod
   AUTH_SERVICE_URL=https://scholara-auth-service.onrender.com
   STUDENT_SERVICE_URL=https://scholara-student-service.onrender.com
   COURSE_SERVICE_URL=https://scholara-course-service.onrender.com
   AI_SERVICE_URL=https://scholara-ai-service.onrender.com
   ```

### Step 3: Deploy Frontend

1. Dashboard → **"New"** → **"Static Site"**
2. Configuration:
   - **Name**: `scholara-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

3. **Environment Variables**:
   ```
   NODE_VERSION=18.17.0
   VITE_API_GATEWAY_URL=https://scholara-api-gateway.onrender.com
   ```

4. **Rewrite Rules**:
   - From: `/*`
   - To: `/index.html`

---

## ⚙️ Configuration

### Service URLs

After deployment, your services will be available at:

```
Frontend:        https://scholara-frontend.onrender.com
API Gateway:     https://scholara-api-gateway.onrender.com
Auth Service:    https://scholara-auth-service.onrender.com
Student Service: https://scholara-student-service.onrender.com
Course Service:  https://scholara-course-service.onrender.com
AI Service:      https://scholara-ai-service.onrender.com
```

### Update Frontend Configuration

Update `frontend/.env` or `frontend/src/services/apiService.js` to use the API Gateway URL:

```javascript
const API_BASE_URL = import.meta.env.VITE_API_GATEWAY_URL || 'https://scholara-api-gateway.onrender.com';
```

---

## 🔐 Environment Variables

### Required for All Java Services
- `SPRING_PROFILES_ACTIVE`: `prod`

### Required for All Django Services
- `DEBUG`: `False`
- `SECRET_KEY`: Generate using `python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'`
- `ALLOWED_HOSTS`: `*` (or your specific domain)

### Optional but Recommended
- `GOOGLE_CLIENT_ID`: For Google OAuth login
- `GOOGLE_CLIENT_SECRET`: For Google OAuth login
- `OPENAI_API_KEY`: For AI chatbot features

---

## 🗄️ Database Setup

### PostgreSQL Databases (Render Free Tier)

Render provides PostgreSQL databases with:
- ✅ 90 days of data retention
- ✅ Automatic backups
- ✅ 1GB storage
- ✅ SSL connections

**Note**: Render doesn't offer MySQL on free tier. Options:
1. **Use PostgreSQL for all services** (recommended)
2. **Use external MySQL** (PlanetScale, Railway, etc.)

### Migrating from MySQL to PostgreSQL

If needed, update your Spring Boot services:

```xml
<!-- Replace MySQL connector -->
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <scope>runtime</scope>
</dependency>
```

Update `application.yml`:
```yaml
spring:
  datasource:
    url: jdbc:postgresql://${DB_HOST}:${DB_PORT}/${DB_NAME}
    driver-class-name: org.postgresql.Driver
  jpa:
    database-platform: org.hibernate.dialect.PostgreSQLDialect
```

---

## 📊 Monitoring & Logs

### View Logs
1. Dashboard → Select your service
2. Click **"Logs"** tab
3. Real-time streaming logs available

### Health Checks
All services have health check endpoints:
- Spring Boot: `/actuator/health`
- Django: `/api/<service>/health` (add if needed)

### Metrics
- CPU usage
- Memory usage
- Request rates
- Response times

---

## 💰 Cost Estimation

### Free Tier (Ideal for Development/Testing)
- ✅ 2 PostgreSQL databases (Free)
- ✅ 5 Web services (Free - 750h/month each)
- ✅ 1 Static site (Free)
- ⚠️ Services sleep after 15 min of inactivity
- ⚠️ Slow cold starts (30-60 seconds)

**Monthly Cost**: **$0**

### Production Setup (Recommended)
- 💾 2 PostgreSQL databases (Starter): $7/month each
- 🚀 6 Web services (Starter): $7/month each
- 🌐 Static site: Free

**Monthly Cost**: ~**$56/month**

### Enterprise Setup
- 💾 2 PostgreSQL databases (Standard): $20/month each
- 🚀 6 Web services (Standard): $20/month each
- 🌐 Static site: Free

**Monthly Cost**: ~**$160/month**

---

## 🔧 Troubleshooting

### Build Failures

#### Java Services
```bash
# Clear Maven cache and rebuild
mvn clean package -U -DskipTests
```

#### Python Services
```bash
# Check dependencies
pip install -r requirements.txt --no-cache-dir
```

### Database Connection Issues

1. Verify environment variables
2. Check database is running
3. Confirm firewall rules allow connections
4. Use internal Render URLs (faster, no egress costs)

### Service Timeout Issues

For AI service with heavy models:
- Increase plan to Starter or higher
- Set higher timeout in gunicorn: `--timeout 120`
- Consider using worker processes

### Cold Start Issues (Free Tier)

Services sleep after 15 minutes of inactivity:
- **Solution 1**: Upgrade to paid plan (services stay always on)
- **Solution 2**: Use a cron job to ping services every 10 minutes
- **Solution 3**: Use [UptimeRobot](https://uptimerobot.com) for free monitoring

### CORS Issues

Update API Gateway CORS configuration to allow your frontend domain:

```java
@Configuration
public class CorsConfig {
    @Bean
    public CorsWebFilter corsWebFilter() {
        CorsConfiguration config = new CorsConfiguration();
        config.addAllowedOrigin("https://scholara-frontend.onrender.com");
        config.addAllowedMethod("*");
        config.addAllowedHeader("*");
        // ... rest of configuration
    }
}
```

---

## 🎓 Best Practices

1. **Use Environment Variables**: Never hardcode secrets
2. **Enable Health Checks**: Monitor service health
3. **Set Up Alerts**: Get notified of issues
4. **Review Logs Regularly**: Catch issues early
5. **Use Internal URLs**: Services communicate faster via internal network
6. **Database Backups**: Render provides automatic backups
7. **SSL Certificates**: Automatically provided for all services
8. **Custom Domains**: Add your own domain in service settings

---

## 🔄 Continuous Deployment

Render automatically deploys when you push to your Git repository:

1. Push code changes:
   ```bash
   git add .
   git commit -m "Update feature"
   git push origin main
   ```

2. Render automatically:
   - Detects changes
   - Runs build
   - Deploys new version
   - Zero-downtime deployment

### Disable Auto-Deploy

If you want manual control:
1. Service Settings → **"Auto-Deploy"**
2. Toggle off
3. Use **"Manual Deploy"** button when ready

---

## 📞 Support & Resources

- 📚 [Render Documentation](https://render.com/docs)
- 💬 [Render Community](https://community.render.com)
- 🎫 [Render Support](https://render.com/support)
- 📧 Email: support@render.com

---

## ✅ Post-Deployment Checklist

- [ ] All services deployed and running
- [ ] Databases created and connected
- [ ] Environment variables configured
- [ ] Health checks passing
- [ ] Frontend can access API Gateway
- [ ] API Gateway routes to all services
- [ ] Database migrations completed
- [ ] Google OAuth configured (if using)
- [ ] Custom domain configured (optional)
- [ ] Monitoring/alerts set up
- [ ] Test all endpoints
- [ ] Check logs for errors

---

## 🎉 Success!

Your Scholara platform is now live on Render! 

**Frontend URL**: https://scholara-frontend.onrender.com

Test your application and monitor the logs for any issues.

---

*Need help? Feel free to reach out or check the troubleshooting section above.*
