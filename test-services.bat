@echo off
echo Scholara Services Test Script
echo ===========================

echo.
echo 1. Starting all services with Docker Compose...
echo This may take a few minutes the first time as it builds the images.
docker-compose up -d

echo.
echo 2. Waiting for services to start...
timeout /t 30 /nobreak >nul

echo.
echo 3. Testing services:

echo.
echo Testing Auth Service...
curl -f http://localhost:8085/actuator/health 2>nul && (
    echo ✅ Auth Service is running
) || (
    echo ❌ Auth Service is not responding
)

echo.
echo Testing Student Service...
curl -f http://localhost:8081/actuator/health 2>nul && (
    echo ✅ Student Service is running
) || (
    echo ❌ Student Service is not responding
)

echo.
echo Testing Course Service...
curl -f http://localhost:8082/health/ 2>nul && (
    echo ✅ Course Service is running
) || (
    echo ❌ Course Service is not responding
)

echo.
echo Testing AI Service...
curl -f http://localhost:8083/api/health/ 2>nul && (
    echo ✅ AI Service is running
) || (
    echo ❌ AI Service is not responding
)

echo.
echo Testing API Gateway...
curl -f http://localhost:8084/actuator/health 2>nul && (
    echo ✅ API Gateway is running
) || (
    echo ❌ API Gateway is not responding
)

echo.
echo Testing Frontend...
curl -f http://localhost:3000/ 2>nul && (
    echo ✅ Frontend is running
) || (
    echo ❌ Frontend is not responding
)

echo.
echo 4. To stop all services, run: docker-compose down
echo.
echo 5. To view logs for a specific service, run: docker-compose logs [service-name]
echo    For example: docker-compose logs student-service
echo.
echo Services are now running. You can access the frontend at http://localhost:3000