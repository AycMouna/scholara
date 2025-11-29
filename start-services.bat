@echo off
echo 🦉 Démarrage des services SCHOLARA...
echo.

REM Startup: API Gateway, Student Service, Course Service, AI Service, and Frontend

echo 🌐 Démarrage de l'API Gateway (Spring Cloud Gateway)...
cd backend\api-gateway
if exist mvnw.cmd (
    start "API Gateway" cmd /k "mvnw.cmd spring-boot:run"
) else (
    where mvn >nul 2>nul
    if %ERRORLEVEL%==0 (
        start "API Gateway" cmd /k "mvn spring-boot:run"
    ) else (
        start "API Gateway" cmd /k "echo Maven n'est pas installé. Installez Maven (https://maven.apache.org) pour démarrer l'API Gateway."
    )
)
cd ..\..

echo 🔐 Démarrage du Auth Service (Spring Boot)...
cd backend\auth-service
if exist mvnw.cmd (
    start "Auth Service" cmd /k "mvnw.cmd spring-boot:run"
) else (
    where mvn >nul 2>nul
    if %ERRORLEVEL%==0 (
        start "Auth Service" cmd /k "mvn spring-boot:run"
    ) else (
        start "Auth Service" cmd /k "echo Maven n'est pas installé. Installez Maven (https://maven.apache.org) pour démarrer l'Auth Service."
    )
)
cd ..\..

echo 📊 Démarrage du Student Service (Spring Boot)...
cd backend\student-service
if exist target\*.jar (
    for %%f in (target\*.jar) do (
        start "Student Service" cmd /k "java -jar %%f"
        goto :student_done
    )
)
if exist mvnw.cmd (
    start "Student Service" cmd /k "mvnw.cmd spring-boot:run"
    goto :student_done
)
where mvn >nul 2>nul
if %ERRORLEVEL%==0 (
    start "Student Service" cmd /k "mvn spring-boot:run"
) else (
    start "Student Service" cmd /k "echo Maven n'est pas installé et aucun Maven Wrapper n'est présent. Installez Maven (https://maven.apache.org) ou ajoutez mvnw pour démarrer le service."
)
:student_done
cd ..\..

echo 📚 Démarrage du Course Service (Django)...
cd backend\course-service
start "Course Service" cmd /k "python manage.py runserver 8082"
cd ..\..

echo 🤖 Démarrage du AI Chatbot Service (Django)...
cd backend\ai-service
start "AI Service" cmd /k "python manage.py runserver 8083"
cd ..\..

echo 🌐 Démarrage du Frontend (React)...
cd frontend
start "Frontend" cmd /k "npm run dev"
cd ..

echo.
echo ✅ Tous les services sont en cours de démarrage...
echo.
echo 🔗 URLs des services :
echo    - Frontend: http://localhost:5173
echo    - API Gateway: http://localhost:8084
echo    - Auth Service: http://localhost:8085
echo    - Student Service (REST): http://localhost:8081
echo    - Course Service (REST): http://localhost:8082
echo    - AI Chatbot Service (REST): http://localhost:8083
echo.
echo 📝 Note: Le frontend utilise maintenant l'API Gateway (port 8084) pour accéder aux services
echo.
pause
