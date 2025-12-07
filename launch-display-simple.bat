@echo off
echo [Lyrics Display Launcher] Starting...
echo Waiting for Docker... (15 seconds)
timeout /t 15 /nobreak >nul

echo Launching browser...
start "" msedge --kiosk --window-position=-1920,0 http://localhost:8000

echo Done! Browser should open in 5 seconds.
echo Press any key to close this window...
timeout /t 5 /nobreak >nul
exit
