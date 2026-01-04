@echo off
setlocal enabledelayedexpansion

cd /d "%~dp0"

REM Check if this is first run (install mode) or normal startup
set INSTALL_MODE=0
if "%1"=="--install" set INSTALL_MODE=1

REM Also detect first run by checking if startup shortcut exists
set STARTUP=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup
if not exist "%STARTUP%\Lyrics Display.lnk" set INSTALL_MODE=1

if %INSTALL_MODE%==1 (
    echo ========================================
    echo ProPresenter Lyrics Display - Setup
    echo ========================================
) else (
    echo [Lyrics Display] Starting...
)
echo.

REM Check if Docker is installed
where docker >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Docker is not installed or not in PATH
    echo Please install Docker Desktop first: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

REM First-time setup
if %INSTALL_MODE%==1 (
    echo Checking Docker Desktop auto-start...
    echo IMPORTANT: Docker Desktop must start automatically on login
    echo Please open Docker Desktop -^> Settings -^> General
    echo Enable: "Start Docker Desktop when you log in"
    echo.
    echo Press any key after you've enabled this setting...
    pause >nul
    echo.

    echo Detecting display configuration...
    powershell -Command "$monitors = Get-CimInstance -Namespace root\wmi -ClassName WmiMonitorBasicDisplayParams | Measure-Object; Write-Host 'Found' $monitors.Count 'display(s)'"
    echo.
)

REM Pull latest changes and check if rebuild needed
echo Checking for updates...
git fetch origin 2>nul
git diff --quiet HEAD origin/main 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Updates found, pulling and rebuilding...
    git pull
    set NEEDS_BUILD=1
) else (
    echo No updates found.
    set NEEDS_BUILD=0
)
echo.

REM Build/start container
if %INSTALL_MODE%==1 (
    echo Building and starting Docker container...
    docker-compose up -d --build
) else if %NEEDS_BUILD%==1 (
    echo Rebuilding Docker container...
    docker-compose up -d --build
) else (
    echo Starting Docker container...
    docker-compose up -d
)

if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to start Docker container
    pause
    exit /b 1
)
echo.

REM Detect Chrome
set CHROME_PATH=
if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" set CHROME_PATH=C:\Program Files\Google\Chrome\Application\chrome.exe
if exist "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" set CHROME_PATH=C:\Program Files (x86)\Google\Chrome\Application\chrome.exe
if exist "%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe" set CHROME_PATH=%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe

if not defined CHROME_PATH (
    if %INSTALL_MODE%==1 (
        echo WARNING: Chrome not found, using Edge as fallback...
    )
    set CHROME_PATH=msedge
)

REM First-time setup: add to startup
if %INSTALL_MODE%==1 (
    echo Adding to Windows startup...
    powershell -Command "$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%STARTUP%\Lyrics Display.lnk'); $Shortcut.TargetPath = '%~dp0start.bat'; $Shortcut.Save()"
    echo Added to startup folder
    echo.
)

REM Wait for Docker to be ready
echo Waiting for server to start...
:wait_loop
timeout /t 3 /nobreak >nul
curl -s http://localhost:8000 >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Still waiting for Docker...
    goto wait_loop
)
echo Server ready!
echo.

REM Launch browser
echo Launching browser...
start "" "%CHROME_PATH%" --kiosk --window-position=-1920,0 http://localhost:8000

if %INSTALL_MODE%==1 (
    echo.
    echo ========================================
    echo Setup Complete!
    echo ========================================
    echo.
    echo The lyrics display will now:
    echo - Auto-start when Windows boots
    echo - Auto-update from git on each start
    echo - Open Chrome in fullscreen on secondary display
    echo - Hide lyrics when ProPresenter audience is disabled
    echo.
    echo Press Alt+F4 to exit fullscreen Chrome
    echo.
    pause
)
