# Local Testing Guide for Scholara Services

This guide will help you test your Scholara services locally using Docker Compose.

## Prerequisites

1. Docker Desktop installed and running
2. Git Bash or PowerShell

## Quick Start

1. Open a terminal in the project root directory
2. Run the test script:
   ```bash
   ./test-services.bat
   ```
   Or on Git Bash:
   ```bash
   ./test-services.bat
   ```

## Manual Testing with Docker Compose

### 1. Start All Services

```bash
docker-compose up -d
```

This will build and start all services in the background.

### 2. Check Service Status

```bash
docker-compose ps
```

### 3. View Logs for a Specific Service

```bash
docker-compose logs [service-name]
```

For example:
```bash
docker-compose logs student-service
```

### 4. Test Individual Services

#### Auth Service
- URL: http://localhost:8085
- Health Check: http://localhost:8085/actuator/health

#### Student Service
- URL: http://localhost:8081
- Health Check: http://localhost:8081/actuator/health

#### Course Service
- URL: http://localhost:8082
- Health Check: http://localhost:8082/health/

#### AI Service
- URL: http://localhost:8083
- Health Check: http://localhost:8083/api/health/
- Translation: http://localhost:8083/api/translate/
- Summarization: http://localhost:8083/api/summarize/

#### GraphQL Service
- URL: http://localhost:8086
- GraphQL Endpoint: http://localhost:8086/graphql
- Health Check: http://localhost:8086/actuator/health

#### API Gateway
- URL: http://localhost:8084
- Health Check: http://localhost:8084/actuator/health
- GraphQL Proxy: http://localhost:8084/graphql

#### Frontend
- URL: http://localhost:3000

### 5. Stop All Services

```bash
docker-compose down
```

To stop and remove volumes (including databases):
```bash
docker-compose down -v
```

## Testing API Endpoints

### Auth Service

Register a new user:
```bash
curl -X POST http://localhost:8085/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }'
```

Login:
```bash
curl -X POST http://localhost:8085/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Student Service

Get all students:
```bash
curl http://localhost:8081/api/students
```

### Course Service

Get all courses:
```bash
curl http://localhost:8082/api/courses
```

### AI Service

Translate text:
```bash
curl -X POST http://localhost:8083/api/translate/ \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello, how are you?",
    "target_language": "fr"
  }'
```

Summarize text:
```bash
curl -X POST http://localhost:8083/api/summarize/ \
  -H "Content-Type: application/json" \
  -d '{
    "text": "This is a long text that needs to be summarized into a shorter version.",
    "max_length": 50
  }'
```

## Troubleshooting

### Services Not Starting

1. Check if Docker is running
2. Check logs: `docker-compose logs [service-name]`
3. Ensure ports are not being used by other applications

### Database Issues

If you're having database connection issues:
1. Stop services: `docker-compose down -v`
2. Start services again: `docker-compose up -d`

### AI Service Memory Issues

The AI service uses large models that may require significant memory. If you're experiencing issues:
1. The service may take a few minutes to start as it loads models
2. Check logs: `docker-compose logs ai-service`
3. Consider using smaller models in the environment variables

## Service Ports Summary

| Service       | Port  | URL                   |
|---------------|-------|-----------------------|
| Auth Service  | 8085  | http://localhost:8085 |
| Student       | 8081  | http://localhost:8081 |
| Course        | 8082  | http://localhost:8082 |
| AI Service    | 8083  | http://localhost:8083 |
| API Gateway   | 8084  | http://localhost:8084 |
| GraphQL       | 8086  | http://localhost:8086 |
| Frontend      | 3000  | http://localhost:3000 |

## Clean Up

To completely remove all services and data:
```bash
docker-compose down -v --remove-orphans
```