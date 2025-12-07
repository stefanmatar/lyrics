# Windows Installation Guide - Chrome Kiosk Mode on Second Display

## Step 1: Install Docker Desktop

1. Download Docker Desktop: https://www.docker.com/products/docker-desktop
2. Run installer, restart when prompted
3. Open Docker Desktop
4. Settings → General → ✅ Enable "Start Docker Desktop when you log in"
5. Wait for Docker to fully start (whale icon in system tray turns steady)

## Step 2: Install Git (if not already installed)

1. Download: https://git-scm.com/download/win
2. Install with default options

## Step 3: Clone and Run the Project

Open PowerShell or Command Prompt:

```powershell
cd C:\
git clone https://github.com/stefanmatar/lyrics.git
cd C:\lyrics
docker-compose up -d
```

Wait 30 seconds, then test: http://localhost:8000

## Step 4: Create Chrome Kiosk Launcher

Create file `C:\lyrics\launch-display.bat`:

```batch
@echo off
REM Wait for Docker to be ready
timeout /t 30 /nobreak

REM Wait for container to be fully up
timeout /t 10 /nobreak

REM Launch Chrome in kiosk mode on second display
start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --kiosk --window-position=1920,0 --new-window http://localhost:8000
```

**Note:** Adjust `--window-position=1920,0` based on your primary display width:
- Primary display 1920px wide → Use `--window-position=1920,0`
- Primary display 1366px wide → Use `--window-position=1366,0`
- Primary display 2560px wide → Use `--window-position=2560,0`

To move window to LEFT of primary display, use negative: `--window-position=-1920,0`

## Step 5: Add to Windows Startup

### Option A: Startup Folder (Recommended)

1. Press **Win + R**
2. Type: `shell:startup` and press Enter
3. Right-click in folder → New → Shortcut
4. Location: `C:\lyrics\launch-display.bat`
5. Name: "Lyrics Display"
6. Click Finish

### Option B: Task Scheduler (More reliable)

1. Press **Win + R** → type `taskschd.msc` → Enter
2. Click "Create Basic Task"
3. Name: "Lyrics Display"
4. Trigger: "When I log on"
5. Action: "Start a program"
6. Program: `C:\lyrics\launch-display.bat`
7. Finish

## Step 6: Test Auto-Start

1. **Restart the computer**
2. Wait 40-60 seconds for everything to start
3. Chrome should automatically open fullscreen on second display
4. Lyrics should be visible

## Exit Kiosk Mode

Press **Alt + F4** to close Chrome kiosk window

## Troubleshooting

### Chrome opens on wrong display
Edit `C:\lyrics\launch-display.bat` and adjust `--window-position` value.

### Container not starting
```powershell
cd C:\lyrics
docker-compose logs
```

### Docker not starting automatically
- Open Docker Desktop → Settings → General → Enable "Start Docker Desktop when you log in"

### Chrome not installed in default location
Find Chrome path and update in `launch-display.bat`:
- 64-bit: `C:\Program Files\Google\Chrome\Application\chrome.exe`
- 32-bit: `C:\Program Files (x86)\Google\Chrome\Application\chrome.exe`

### Want to disable auto-start temporarily
Delete shortcut from startup folder:
```powershell
shell:startup
```

## Additional Chrome Kiosk Options

Add these to the Chrome launch command if needed:

```batch
REM Disable screensaver
--disable-popup-blocking --disable-screensaver

REM Auto-reload every hour
--auto-reload-interval=3600

REM Start maximized instead of fullscreen
--start-maximized
```

## Manual Start/Stop

**Start:**
```powershell
cd C:\lyrics
docker-compose up -d
```

**Stop:**
```powershell
cd C:\lyrics
docker-compose down
```

**View logs:**
```powershell
docker-compose logs -f
```
