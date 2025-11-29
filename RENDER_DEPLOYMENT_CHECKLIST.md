# ✅ Render Deployment Checklist

Use this checklist to ensure a smooth deployment to Render.

## 📋 Pre-Deployment

### Code Preparation
- [ ] Code pushed to Git repository (GitHub, GitLab, or Bitbucket)
- [ ] All services have Dockerfiles
- [ ] `render.yaml` blueprint file is in root directory
- [ ] `.renderignore` file configured
- [ ] Environment variables documented

### Database Preparation
- [ ] Decide: PostgreSQL for all services OR external MySQL
- [ ] If using PostgreSQL: Complete migration (see `POSTGRESQL_MIGRATION.md`)
- [ ] Database schemas ready
- [ ] Migration scripts tested locally

### Environment Variables
- [ ] List all required environment variables
- [ ] Generate secrets (JWT_SECRET, DJANGO_SECRET_KEY)
- [ ] Obtain Google OAuth credentials (if using)
- [ ] Obtain OpenAI API key (if using)
- [ ] Document all environment variables

## 🚀 Deployment Steps

### 1. Render Account Setup
- [ ] Create Render account at [render.com](https://render.com)
- [ ] Verify email address
- [ ] Connect Git repository

### 2. Blueprint Deployment
- [ ] Click "New" → "Blueprint"
- [ ] Select your repository
- [ ] Confirm `render.yaml` is detected
- [ ] Review all services and databases

### 3. Environment Variables Configuration
- [ ] Add `GOOGLE_CLIENT_ID` (Auth Service)
- [ ] Add `GOOGLE_CLIENT_SECRET` (Auth Service)
- [ ] Add `OPENAI_API_KEY` (AI Service)
- [ ] Verify auto-generated secrets (JWT_SECRET, etc.)
- [ ] Add any custom environment variables

### 4. Database Configuration
- [ ] MySQL database created (or PostgreSQL alternative)
- [ ] PostgreSQL database created
- [ ] Connection strings configured
- [ ] Database credentials saved

### 5. Deploy Services
- [ ] Click "Apply" to start deployment
- [ ] Monitor build logs for each service
- [ ] Wait for all services to show "Live" status

## 🔍 Post-Deployment Verification

### Service Health Checks
- [ ] Auth Service: https://scholara-auth-service.onrender.com/actuator/health
- [ ] Student Service: https://scholara-student-service.onrender.com/actuator/health
- [ ] Course Service: https://scholara-course-service.onrender.com/api/courses/
- [ ] AI Service: https://scholara-ai-service.onrender.com/api/ai/
- [ ] API Gateway: https://scholara-api-gateway.onrender.com/actuator/health
- [ ] Frontend: https://scholara-frontend.onrender.com

### Database Verification
- [ ] MySQL database connected
- [ ] PostgreSQL database connected
- [ ] Tables created automatically (check logs)
- [ ] Sample data seeded (if applicable)

### Functional Testing
- [ ] Frontend loads successfully
- [ ] User registration works
- [ ] User login works
- [ ] Google OAuth login works (if configured)
- [ ] Student CRUD operations work
- [ ] Course CRUD operations work
- [ ] Enrollment operations work
- [ ] AI chatbot responds (if configured)
- [ ] GraphQL queries work

### API Gateway Testing
- [ ] Auth routes work: `/api/auth/*`
- [ ] Student routes work: `/api/students/*`
- [ ] Course routes work: `/api/courses/*`
- [ ] AI routes work: `/api/ai/*`
- [ ] CORS configured correctly
- [ ] Error handling works

## 🔧 Configuration

### Custom Domain (Optional)
- [ ] Purchase domain name
- [ ] Add custom domain in Render dashboard
- [ ] Update DNS records
- [ ] Wait for SSL certificate provisioning
- [ ] Update environment variables with new domain

### SSL Certificates
- [ ] Verify SSL certificates auto-generated
- [ ] Test HTTPS endpoints
- [ ] Update frontend to use HTTPS URLs

### Monitoring & Alerts
- [ ] Set up health check alerts
- [ ] Configure error notifications
- [ ] Set up uptime monitoring (UptimeRobot, etc.)
- [ ] Review metrics dashboard

## 📊 Performance Optimization

### Service Plans
- [ ] Evaluate free tier performance
- [ ] Upgrade critical services if needed
- [ ] Consider Starter plan for AI Service
- [ ] Review cold start times

### Database Optimization
- [ ] Add database indexes
- [ ] Configure connection pooling
- [ ] Monitor query performance
- [ ] Set up database backups

### Caching
- [ ] Implement Redis caching (if needed)
- [ ] Configure CDN for static assets
- [ ] Enable browser caching

## 🛡️ Security

### Environment Variables
- [ ] All secrets stored in Render (not in code)
- [ ] No sensitive data in Git repository
- [ ] Environment variables per environment (dev, prod)

### CORS & Headers
- [ ] CORS configured correctly
- [ ] Security headers added (X-Frame-Options, etc.)
- [ ] Rate limiting configured (if needed)

### Authentication
- [ ] JWT token validation working
- [ ] Refresh token flow working
- [ ] Password encryption verified
- [ ] OAuth flow secured

## 📝 Documentation

### For Team
- [ ] Update README with Render URLs
- [ ] Document deployment process
- [ ] Share environment variable list
- [ ] Create troubleshooting guide

### For Users
- [ ] Update API documentation
- [ ] Update frontend URLs
- [ ] Announce new deployment

## 🐛 Troubleshooting

### Common Issues to Check
- [ ] Build failures: Check build logs
- [ ] Database connection errors: Verify connection strings
- [ ] CORS errors: Update CORS configuration
- [ ] Timeout errors: Increase timeout settings
- [ ] Cold starts: Consider upgrading plan

### Logs & Debugging
- [ ] Review deployment logs
- [ ] Check runtime logs for errors
- [ ] Monitor error rates
- [ ] Test error handling

## 💰 Cost Management

### Free Tier
- [ ] Verify all services on free tier (except AI Service)
- [ ] Understand 750h/month limit per service
- [ ] Accept 15-minute sleep timeout
- [ ] Plan for cold start delays

### Paid Plans
- [ ] Review pricing: https://render.com/pricing
- [ ] Upgrade critical services
- [ ] Set spending alerts
- [ ] Monitor usage

## 🔄 Continuous Deployment

### Auto-Deploy
- [ ] Auto-deploy enabled for main branch
- [ ] Test branch deployment strategy
- [ ] Configure deploy hooks (optional)

### Git Workflow
- [ ] Main branch protected
- [ ] Pull request reviews required
- [ ] CI/CD pipeline configured (optional)

## 📞 Support

### Resources
- [ ] Bookmark Render documentation
- [ ] Join Render community
- [ ] Save support contact information

### Emergency Contacts
- [ ] List team members with Render access
- [ ] Document rollback procedures
- [ ] Create incident response plan

---

## 🎉 Deployment Complete!

When all items are checked:

✅ **Your Scholara platform is successfully deployed on Render!**

**Frontend URL**: https://scholara-frontend.onrender.com

**Next Steps**:
1. Share the URL with your team
2. Monitor logs for 24 hours
3. Gather user feedback
4. Plan next features

---

**Deployment Date**: _________________

**Deployed By**: _________________

**Notes**: 
_________________________________________
_________________________________________
_________________________________________
