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

echo [1/5] Detecting display configuration...
powershell -Command "$monitors = Get-CimInstance -Namespace root\wmi -ClassName WmiMonitorBasicDisplayParams | Measure-Object; Write-Host 'Found' $monitors.Count 'display(s)'"
echo.

echo [2/5] Starting Docker container...
docker-compose up -d
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to start Docker container
    pause
    exit /b 1
)
echo Container started successfully!
echo.

echo [3/5] Detecting Chrome installation...
set CHROME_PATH=
if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" set CHROME_PATH=C:\Program Files\Google\Chrome\Application\chrome.exe
if exist "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" set CHROME_PATH=C:\Program Files (x86)\Google\Chrome\Application\chrome.exe
if exist "%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe" set CHROME_PATH=%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe

if not defined CHROME_PATH (
    echo WARNING: Chrome not found in default locations
    echo Please install Chrome: https://www.google.com/chrome/
    echo Or run find-chrome.bat to search for it
    echo.
    echo Using Edge as fallback...
    set CHROME_PATH=msedge
)
echo Chrome path: %CHROME_PATH%
echo.

echo [4/5] Creating Chrome launcher script with auto-display detection...
(
echo @echo off
echo REM Wait for Docker to be ready
echo timeout /t 40 /nobreak ^>nul
echo.
echo REM Detect secondary display and launch Chrome
echo for /f "tokens=*" %%%%a in ^('powershell -Command "$screens = [System.Windows.Forms.Screen]::AllScreens; $secondary = $screens ^| Where-Object {-not $_.Primary} ^| Select-Object -First 1; if ($secondary) { Write-Host $secondary.Bounds.Left,$secondary.Bounds.Top } else { $primary = $screens[0]; Write-Host $primary.Bounds.Width,0 }"'^) do set POS=%%%%a
echo set POS=%%POS: =,%%
echo.
echo start "" "%CHROME_PATH%" --kiosk --window-position=%%POS%% http://localhost:8000
) > launch-display.bat
echo Created: launch-display.bat with auto-display detection
echo.

echo [5/6] Adding to Windows startup...
set STARTUP=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup
powershell -Command "$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%STARTUP%\Lyrics Display.lnk'); $Shortcut.TargetPath = '%CD%\launch-display.bat'; $Shortcut.Save()"
echo Added to startup folder
echo.

echo [6/6] Testing connection...
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
echo - Auto-detect secondary display
echo - Auto-start when Windows boots
echo - Open Chrome in fullscreen on non-primary display
echo - Show lyrics from ProPresenter
echo.
echo NOTES:
echo - The script automatically detects which display is secondary
echo - If only one display, Chrome will open at edge of primary display
echo - Press Alt+F4 to exit fullscreen Chrome
echo.
echo Test now by running: launch-display.bat
echo Or open browser: http://localhost:8000
echo.
pause
