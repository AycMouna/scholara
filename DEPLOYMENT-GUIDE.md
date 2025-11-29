# Scholara Deployment Guide

This guide explains how to deploy the Scholara platform services one at a time.

## Deployment Files

We've created separate deployment files for each stage:

1. `render.yaml` - Database only (initial deployment)
2. `render-01-database.yaml` - Database only
3. `render-02-auth.yaml` - Database + Auth Service
4. `render-03-student.yaml` - Database + Student Service
5. `render-04-course.yaml` - Database + Course Service
6. `render-05-ai.yaml` - AI Service only
7. `render-06-gateway.yaml` - API Gateway only
8. `render-07-frontend.yaml` - Frontend only
9. `render-full.yaml` - All services (final deployment)

## Deployment Process

### Step 1: Deploy Database
1. Use the default `render.yaml` file (database only)
2. This creates the shared PostgreSQL database

### Step 2: Deploy Services One by One
After the database is successfully created, deploy each service:

1. **Auth Service**: Replace `render.yaml` content with `render-02-auth.yaml` content
2. **Student Service**: Replace `render.yaml` content with `render-03-student.yaml` content
3. **Course Service**: Replace `render.yaml` content with `render-04-course.yaml` content
4. **AI Service**: Replace `render.yaml` content with `render-05-ai.yaml` content
5. **API Gateway**: Replace `render.yaml` content with `render-06-gateway.yaml` content
6. **Frontend**: Replace `render.yaml` content with `render-07-frontend.yaml` content

### Step 3: Final Deployment (Optional)
To deploy everything at once, replace `render.yaml` content with `render-full.yaml` content.

## How to Update render.yaml

To deploy each stage:

1. Copy the content of the desired file (e.g., `render-02-auth.yaml`)
2. Replace the entire content of `render.yaml` with that content
3. Commit and push to GitHub
4. Render will automatically deploy the new configuration

## Verification

After each deployment:
1. Check the Render dashboard for deployment status
2. Verify the service is running and healthy
3. Check logs for any errors
4. Proceed to the next service only after successful deployment

This approach ensures that each service is properly configured and working before adding the next one.