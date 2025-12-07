@echo off
echo ========================================
echo ProPresenter Lyrics Display Installer
echo ========================================
echo.

REM Check if Docker is installed
where docker >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Docker is not installed or not in PATH
    echo Please install Docker Desktop first: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

echo [1/4] Starting Docker container...
docker-compose up -d
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to start Docker container
    pause
    exit /b 1
)
echo Container started successfully!
echo.

echo [2/4] Creating Chrome launcher script...
(
echo @echo off
echo timeout /t 40 /nobreak
echo start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --kiosk --window-position=1920,0 http://localhost:8000
) > launch-display.bat
echo Created: launch-display.bat
echo.

echo [3/4] Adding to Windows startup...
set STARTUP=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup
powershell -Command "$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%STARTUP%\Lyrics Display.lnk'); $Shortcut.TargetPath = '%CD%\launch-display.bat'; $Shortcut.Save()"
echo Added to startup folder
echo.

echo [4/4] Testing connection...
timeout /t 5 /nobreak >nul
curl -s http://localhost:8000 >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo SUCCESS: Server is running at http://localhost:8000
) else (
    echo WARNING: Server may still be starting up
)
echo.

echo ========================================
echo Installation Complete!
echo ========================================
echo.
echo The lyrics display will now:
echo - Auto-start when Windows boots
echo - Open Chrome in fullscreen on second display
echo - Show lyrics from ProPresenter
echo.
echo NOTES:
echo - If Chrome opens on wrong display, edit launch-display.bat
echo - Change '--window-position=1920,0' to match your display setup
echo - Press Alt+F4 to exit fullscreen Chrome
echo.
echo Test now by opening: http://localhost:8000
echo.
pause
