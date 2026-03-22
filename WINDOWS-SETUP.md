# Windows Setup

This project is designed to run on a Windows machine that already has Docker Desktop and access to the ProPresenter API.

## What auto-start means here

- Docker Desktop must start in the logged-in Windows session.
- A Scheduled Task launches `start-lyrics.ps1` 30 seconds after logon.
- That script waits for Docker, starts the container, waits for `http://localhost:8000`, then opens Chrome or Edge in kiosk mode.

If you need the machine to recover completely unattended after a power outage, enable Windows auto-logon for the kiosk account. Docker Desktop is user-session based, so a plain machine boot without sign-in is not enough.

## Prerequisites

1. Install Docker Desktop and enable "Start Docker Desktop when you log in".
2. Install Git for Windows.
3. Make sure the Windows machine can reach ProPresenter on the network.

## Setup

```powershell
cd C:\
git clone https://github.com/stefanmatar/lyrics.git
cd C:\lyrics
copy .env.example .env
notepad .env
install.bat
```

Update `.env` as needed:

```dotenv
PROPRESENTER_HOST=192.168.3.232
PROPRESENTER_PORT=50001
LYRICS_PORT=8000
# Optional if the browser should open on another screen position
# BROWSER_WINDOW_POSITION=-1920,0
```

## Manual start

- Run `start-lyrics.bat`
- Or run `powershell -ExecutionPolicy Bypass -File .\start-lyrics.ps1`

## Monitor placement

- Right-hand second monitor: `BROWSER_WINDOW_POSITION=1920,0`
- Left-hand second monitor: `BROWSER_WINDOW_POSITION=-1920,0`
- Ultra-wide main display: use your main display width as the X offset

## Verify the setup

1. Restart the machine and sign in.
2. Wait around 30-60 seconds.
3. Confirm the browser opens in kiosk mode.
4. Open `http://localhost:8000` manually if you want to verify the page without kiosk mode.

## Troubleshooting

### Docker never becomes ready

- Open Docker Desktop manually once and let it finish starting.
- Confirm `docker info` works in PowerShell.

### Browser opens on the wrong display

- Edit `.env` and set `BROWSER_WINDOW_POSITION`.
- Run `start-lyrics.bat` again.

### ProPresenter is on another machine

- Set `PROPRESENTER_HOST` in `.env` to the ProPresenter machine IP.
- Restart with `docker compose up -d --build`.

### You changed the container port

- Set `LYRICS_PORT` in `.env`.
- Restart with `docker compose up -d`.

### Remove auto-start

```powershell
Unregister-ScheduledTask -TaskName "ProPresenter Lyrics Display" -Confirm:$false
```
