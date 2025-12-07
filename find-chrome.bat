@echo off
echo Searching for Chrome installation...
echo.

if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    echo Found: C:\Program Files\Google\Chrome\Application\chrome.exe
    set CHROME_PATH=C:\Program Files\Google\Chrome\Application\chrome.exe
    goto :found
)

if exist "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" (
    echo Found: C:\Program Files ^(x86^)\Google\Chrome\Application\chrome.exe
    set CHROME_PATH=C:\Program Files (x86)\Google\Chrome\Application\chrome.exe
    goto :found
)

if exist "%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe" (
    echo Found: %LOCALAPPDATA%\Google\Chrome\Application\chrome.exe
    set CHROME_PATH=%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe
    goto :found
)

echo Chrome NOT found in default locations.
echo.
echo Searching entire system (this may take a minute)...
where /R "C:\Program Files" chrome.exe 2>nul
where /R "C:\Program Files (x86)" chrome.exe 2>nul
where /R "%LOCALAPPDATA%" chrome.exe 2>nul
echo.
echo If Chrome is not installed, download it from: https://www.google.com/chrome/
pause
exit /b 1

:found
echo.
echo Chrome path: %CHROME_PATH%
echo.
pause
