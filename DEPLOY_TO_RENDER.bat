@echo off
echo ========================================
echo   SCHOLARA AI Service - Render Deploy
echo ========================================
echo.

echo [1/4] Checking if Git is installed...
where git >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Git is not installed or not in PATH
    echo Please install Git from https://git-scm.com/downloads
    pause
    exit /b 1
)
echo ✓ Git is installed
echo.

echo [2/4] Initializing Git repository (if needed)...
if not exist .git (
    git init
    echo ✓ Git repository initialized
) else (
    echo ✓ Git repository already exists
)
echo.

echo [3/4] Adding all files...
git add .
echo ✓ Files added
echo.

echo [4/4] Checking if remote exists...
git remote -v >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ⚠️  No GitHub remote configured yet
    echo.
    echo NEXT STEPS:
    echo 1. Create a new repository on GitHub (https://github.com/new)
    echo 2. Name it: scholara-ai-service
    echo 3. Don't initialize with README, .gitignore, or license
    echo 4. Copy the repository URL
    echo 5. Run this command (replace YOUR_USERNAME):
    echo    git remote add origin https://github.com/YOUR_USERNAME/scholara-ai-service.git
    echo 6. Then run: git push -u origin main
    echo.
) else (
    echo ✓ Remote repository found
    echo.
    echo Ready to push! Run:
    echo   git commit -m "Ready for Render deployment"
    echo   git push origin main
    echo.
)

echo ========================================
echo   Files ready for deployment!
echo ========================================
echo.
echo All necessary files are prepared:
echo   ✓ requirements.txt (with gunicorn)
echo   ✓ render.yaml (Render configuration)
echo   ✓ build.sh (build script)
echo   ✓ .gitignore (excludes unnecessary files)
echo   ✓ settings.py (configured for Render)
echo.
echo See RENDER_DEPLOYMENT.md for next steps!
echo.
pause


