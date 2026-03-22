@echo off
setlocal

echo ========================================
echo ProPresenter Lyrics Display Installer
echo ========================================
echo.

where docker >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Docker is not installed or not in PATH.
    echo Install Docker Desktop first: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

where powershell >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Windows PowerShell is required but was not found.
    pause
    exit /b 1
)

if not exist ".env" (
    if exist ".env.example" (
        copy /Y ".env.example" ".env" >nul
        echo Created .env from .env.example
        echo Edit .env if your ProPresenter host or port is different.
        echo.
    )
)

echo Make sure Docker Desktop is configured to start when you log in.
echo.
echo Registering the Windows startup task...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0register-startup-task.ps1"
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to register the startup task.
    pause
    exit /b 1
)

echo.
echo Starting the display once for validation...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0start-lyrics.ps1"

echo.
echo ========================================
echo Installation complete
echo ========================================
echo.
echo Next steps:
echo 1. Edit .env if ProPresenter runs on another host.
echo 2. Restart Windows and sign in.
echo 3. Confirm the browser opens on the correct display.
echo.
pause
