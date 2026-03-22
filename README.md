# ProPresenter Lyrics Display

Minimal lyrics display for livestream and in-room screens.

The app serves a fullscreen page with `nginx`, then proxies `/api/` requests to ProPresenter's stage display API. It is intended to run on a dedicated Windows machine with Docker Desktop.

## Repository layout

- `index.html` - fullscreen lyrics page and polling logic
- `docker-compose.yml` - container runtime config
- `nginx.conf.template` - nginx config with environment-based ProPresenter target
- `start-lyrics.ps1` - Windows startup orchestration
- `register-startup-task.ps1` - registers the Scheduled Task for auto-start

## Quick start

```powershell
git clone https://github.com/stefanmatar/lyrics.git
cd lyrics
copy .env.example .env
docker compose up -d --build
```

Then open `http://localhost:8000`.

## Configuration

Set values in `.env`:

```dotenv
PROPRESENTER_HOST=192.168.3.232
PROPRESENTER_PORT=50001
LYRICS_PORT=8000
# Optional for kiosk browser placement
# BROWSER_WINDOW_POSITION=-1920,0
```

## Windows auto-start

Use `install.bat` on the Windows machine. It will:

1. create `.env` from `.env.example` if needed
2. register a Scheduled Task for the current user
3. start the display once for validation

Detailed instructions are in `WINDOWS-SETUP.md`.

## Notes on reliability

- The frontend only updates when the visible two-line output actually changes, which prevents livestream flicker from harmless API formatting differences.
- The nginx proxy target is configurable, so moving ProPresenter to another host no longer requires editing the container image.
- Auto-start is based on Windows logon because Docker Desktop runs in a user session.

## Common commands

```powershell
docker compose up -d --build
docker compose logs -f
docker compose down
start-lyrics.bat
```

## E2E test

```powershell
npm install
npm run setup:e2e
npm run test:e2e
```

The repository includes a Playwright E2E test suite that checks visible lyric stability, empty-slide handling, first render behavior, and audience-screen hiding. After `npm install`, a `pre-push` git hook is installed via `simple-git-hooks` and runs `npm run test:e2e` automatically before every push.
