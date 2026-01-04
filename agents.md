# ProPresenter Lyrics Display

A lightweight web-based application designed to display real-time song lyrics from ProPresenter on a secondary display.

## Purpose

- Fetches current slide/lyrics data from a ProPresenter API endpoint
- Displays lyrics in a clean, full-screen format suitable for projection on secondary monitors
- Designed for church environments where lyrics need to be shown to musicians, worship leaders, or audience members on separate displays

## Key Features

- Real-time lyrics polling (every 200ms)
- Smooth fade transitions when lyrics change
- Shows only the first 2 lines of lyrics at a time
- Auto-starts with Windows boot
- Supports Chrome kiosk mode for distraction-free display

## Technologies Used

| Technology | Purpose |
|------------|---------|
| HTML/CSS/JavaScript | Frontend - Single-page application (no frameworks) |
| Nginx (Alpine) | Web server and reverse proxy |
| Docker | Containerization |
| Docker Compose | Container orchestration |
| ProPresenter API | Data source (external) - REST API at port 50001 |
| Google Fonts (Montserrat) | Typography |

## Architecture

```
Browser → Nginx (port 8000) → ProPresenter API (192.168.3.232:50001)
```

## Directory Structure

```
/lyrics/
├── index.html           # Main application (frontend)
├── nginx.conf           # Nginx configuration (proxy settings)
├── Dockerfile           # Docker image definition
├── docker-compose.yml   # Container orchestration
├── install.bat          # Windows automated installer
├── find-chrome.bat      # Utility to locate Chrome installation
├── INSTALL-WINDOWS.md   # Detailed Windows installation guide
├── WINDOWS-SETUP.md     # Windows auto-start setup documentation
└── agents.md            # This file
```

## Key Components

### Frontend (`index.html`)

**Visual Design:**
- Full-screen black background
- White Montserrat font (semi-bold, 3vw size)
- Text positioned at bottom of screen
- Responsive viewport scaling

**Core JavaScript Functions:**

| Function | Purpose |
|----------|---------|
| `fetchData()` | Polls ProPresenter API for current slide text |
| `update(txt)` | Updates display with fade animation |
| `start()` | Initializes polling interval |
| `stop()` | Cleans up polling on page unload |

### Backend/Infrastructure (`nginx.conf`)

- Listens on port 8000
- Serves static files from `/usr/share/nginx/html`
- Proxies `/api/` requests to ProPresenter at `http://192.168.3.232:50001/v1/`

### Docker Infrastructure

**Dockerfile:**
- Base image: `nginx:alpine` (lightweight)
- Copies `index.html` and `nginx.conf`
- Exposes port 8000

**docker-compose.yml:**
- Service name: `propresenter-lyrics`
- Restart policy: `unless-stopped` (auto-restart)
- Port mapping: 8000:8000

### Windows Automation (`install.bat`)

**Installation Steps:**
1. Pulls latest git updates
2. Checks Docker installation
3. Detects display configuration
4. Starts Docker container
5. Detects Chrome installation (with Edge fallback)
6. Creates `launch-display.bat` launcher script
7. Adds to Windows startup folder
8. Tests connection

## How It Works

### System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     WINDOWS MACHINE                              │
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────┐  │
│  │   Chrome     │───▶│   Nginx      │───▶│  ProPresenter    │  │
│  │ (Kiosk Mode) │    │ (Docker)     │    │  (port 50001)    │  │
│  │  :8000       │◀───│  :8000       │◀───│  192.168.3.232   │  │
│  └──────────────┘    └──────────────┘    └──────────────────┘  │
│        │                    │                                    │
│        ▼                    ▼                                    │
│  ┌──────────────┐    ┌──────────────┐                          │
│  │  Secondary   │    │  index.html  │                          │
│  │   Display    │    │  + JS Logic  │                          │
│  └──────────────┘    └──────────────┘                          │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Startup:**
   - Windows boots → Docker starts → Container starts → Nginx serves `index.html`
   - Chrome opens in kiosk mode on secondary display

2. **Runtime Polling Loop:**
   ```
   Every 200ms:
   1. Browser fetches GET /api/status/slide
   2. Nginx proxies to ProPresenter API (/v1/status/slide)
   3. ProPresenter returns JSON with current slide data
   4. JavaScript extracts data.current.text
   5. If text changed: fade out → update text → fade in
   6. Only first 2 lines displayed
   ```

3. **Display Logic:**
   - If lyrics exist: show with fade-in animation (150ms delay)
   - If lyrics empty/blank: fade out (300ms)

### ProPresenter API Integration

The application expects the ProPresenter API response format:
```json
{
  "current": {
    "text": "Line 1 of lyrics\nLine 2 of lyrics\nLine 3..."
  }
}
```

## Considerations

- Hardcoded ProPresenter IP address (`192.168.3.232`) in `nginx.conf`
- Windows-focused automation (no Linux/macOS scripts)
- Requires ProPresenter to be running and accessible on the network
