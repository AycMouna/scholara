# Individual Service Deployment

This directory contains separate Render blueprints for deploying each service individually. This approach allows for easier troubleshooting and incremental deployment.

## Deployment Order

1. [01-database.yaml](01-database.yaml) - Deploy the shared database first
2. [02-auth-service.yaml](02-auth-service.yaml) - Deploy Auth Service
3. [03-student-service.yaml](03-student-service.yaml) - Deploy Student Service
4. [04-course-service.yaml](04-course-service.yaml) - Deploy Course Service
5. [05-ai-service.yaml](05-ai-service.yaml) - Deploy AI Service
6. [06-api-gateway.yaml](06-api-gateway.yaml) - Deploy API Gateway
7. [07-frontend.yaml](07-frontend.yaml) - Deploy Frontend

## Deployment Instructions

1. Go to your Render Dashboard
2. Navigate to the Blueprint section
3. Select the appropriate YAML file for the service you want to deploy
4. Deploy one service at a time
5. Verify each service is working before proceeding to the next

## Benefits of This Approach

- Easier to identify and fix deployment issues
- Reduced complexity during troubleshooting
- Ability to test each service independently
- More controlled rollout process