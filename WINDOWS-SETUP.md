# Windows Auto-Start Setup

## Prerequisites

1. **Install Docker Desktop for Windows**
   - Download: https://www.docker.com/products/docker-desktop
   - Install and restart computer
   - Open Docker Desktop settings → General → Enable "Start Docker Desktop when you log in"

2. **Install Git for Windows** (if not already installed)
   - Download: https://git-scm.com/download/win
   - Or use GitHub Desktop

## Setup Steps

### 1. Clone Repository

Open PowerShell or Command Prompt:
```powershell
cd C:\
git clone https://github.com/stefanmatar/lyrics.git
cd lyrics
```

### 2. Test First Run

```powershell
docker-compose up -d
```

Open browser: http://localhost:8000

Verify lyrics are displaying.

### 3. Enable Auto-Start

**Option A: Docker Desktop (Recommended)**

1. Open Docker Desktop
2. Go to Settings → General
3. Enable "Start Docker Desktop when you log in"
4. Go to Settings → Resources → Advanced
5. Set "Start containers on boot" (if available)

In `docker-compose.yml`, ensure `restart: unless-stopped` is set (already done).

**Option B: Windows Task Scheduler**

1. Open Task Scheduler (Win + R → `taskschd.msc`)
2. Click "Create Basic Task"
3. Name: "ProPresenter Lyrics"
4. Trigger: "When I log on"
5. Action: "Start a program"
6. Program: `C:\Program Files\Docker\Docker\Docker Desktop.exe`
7. Add argument: `--start-container lyrics-propresenter-lyrics-1`
8. Finish

**Option C: Batch Script + Startup Folder**

Create `C:\lyrics\start-lyrics.bat`:
```batch
@echo off
cd C:\lyrics
docker-compose up -d
```

1. Win + R → `shell:startup`
2. Create shortcut to `start-lyrics.bat`
3. Restart to test

### 4. Verify Auto-Start

1. Restart Windows
2. Wait 30 seconds for Docker to start
3. Open http://localhost:8000
4. Lyrics should be displaying

## Troubleshooting

**Docker not starting:**
- Open Docker Desktop manually
- Check Docker Desktop settings → Start on login

**Container not starting:**
```powershell
docker-compose down
docker-compose up -d
docker-compose logs
```

**Port 8000 already in use:**
Edit `docker-compose.yml` and change `"8000:8000"` to `"8001:8000"` (or any free port)

## Updating

```powershell
cd C:\lyrics
git pull
docker-compose down
docker-compose up -d --build
```

## Accessing from Network

To access from other computers on your network:
1. Find Windows IP: `ipconfig` in PowerShell
2. Open in browser: `http://YOUR-WINDOWS-IP:8000`
3. May need to allow port 8000 in Windows Firewall
