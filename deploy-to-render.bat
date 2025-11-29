@echo off
REM Render Deployment Helper Script for Windows
REM This script helps prepare your project for Render deployment

echo ========================================
echo    SCHOLARA - Render Deployment Helper
echo ========================================
echo.

REM Check if Git is installed
where git >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Git is not installed or not in PATH
    echo Please install Git from: https://git-scm.com/download/win
    pause
    exit /b 1
)

echo [1/6] Checking Git repository status...
git status >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [INFO] Initializing Git repository...
    git init
    git add .
    git commit -m "Initial commit for Render deployment"
) else (
    echo [OK] Git repository already initialized
)

echo.
echo [2/6] Checking for render.yaml...
if exist render.yaml (
    echo [OK] render.yaml found
) else (
    echo [ERROR] render.yaml not found!
    echo Please ensure render.yaml is in the root directory
    pause
    exit /b 1
)

echo.
echo [3/6] Checking for Dockerfiles...
set DOCKER_OK=1

if exist backend\auth-service\Dockerfile (
    echo [OK] Auth Service Dockerfile found
) else (
    echo [ERROR] backend\auth-service\Dockerfile not found
    set DOCKER_OK=0
)

if exist backend\student-service\Dockerfile (
    echo [OK] Student Service Dockerfile found
) else (
    echo [ERROR] backend\student-service\Dockerfile not found
    set DOCKER_OK=0
)

if exist backend\course-service\Dockerfile (
    echo [OK] Course Service Dockerfile found
) else (
    echo [ERROR] backend\course-service\Dockerfile not found
    set DOCKER_OK=0
)

if exist backend\ai-service\Dockerfile (
    echo [OK] AI Service Dockerfile found
) else (
    echo [ERROR] backend\ai-service\Dockerfile not found
    set DOCKER_OK=0
)

if exist backend\api-gateway\Dockerfile (
    echo [OK] API Gateway Dockerfile found
) else (
    echo [ERROR] backend\api-gateway\Dockerfile not found
    set DOCKER_OK=0
)

if exist frontend\Dockerfile (
    echo [OK] Frontend Dockerfile found
) else (
    echo [ERROR] frontend\Dockerfile not found
    set DOCKER_OK=0
)

if %DOCKER_OK% EQU 0 (
    echo [ERROR] Some Dockerfiles are missing!
    pause
    exit /b 1
)

echo.
echo [4/6] Checking for deployment guides...
if exist RENDER_DEPLOYMENT_GUIDE.md (
    echo [OK] Deployment guide found
) else (
    echo [WARN] RENDER_DEPLOYMENT_GUIDE.md not found
)

if exist RENDER_DEPLOYMENT_CHECKLIST.md (
    echo [OK] Deployment checklist found
) else (
    echo [WARN] RENDER_DEPLOYMENT_CHECKLIST.md not found
)

echo.
echo [5/6] Checking Git remote...
git remote -v | find "origin" >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Git remote 'origin' is configured
    git remote -v
) else (
    echo [WARN] No Git remote configured
    echo.
    echo You need to add a Git remote:
    echo   git remote add origin YOUR_GITHUB_REPO_URL
    echo.
    echo Example:
    echo   git remote add origin https://github.com/username/ntic-app.git
)

echo.
echo [6/6] Summary and Next Steps
echo ========================================
echo.
echo All checks complete! Here's what to do next:
echo.
echo 1. Add Git remote (if not done):
echo    git remote add origin YOUR_GITHUB_REPO_URL
echo.
echo 2. Push your code:
echo    git add .
echo    git commit -m "Prepare for Render deployment"
echo    git push -u origin main
echo.
echo 3. Go to Render Dashboard:
echo    https://dashboard.render.com
echo.
echo 4. Create New Blueprint:
echo    - Click "New" ^> "Blueprint"
echo    - Connect your Git repository
echo    - Select your repository and branch
echo    - Render will detect render.yaml
echo    - Configure environment variables
echo    - Click "Apply" to deploy
echo.
echo 5. Required Environment Variables:
echo    - GOOGLE_CLIENT_ID (Auth Service)
echo    - GOOGLE_CLIENT_SECRET (Auth Service)
echo    - OPENAI_API_KEY (AI Service)
echo.
echo 6. Read the deployment guide:
echo    RENDER_DEPLOYMENT_GUIDE.md
echo.
echo 7. Use the checklist:
echo    RENDER_DEPLOYMENT_CHECKLIST.md
echo.
echo ========================================
echo.
echo For more information, visit:
echo https://render.com/docs
echo.

pause
