# ProPresenter Lyrics Lower Third

Displays ProPresenter lyrics as lower third overlay with black background and white Montserrat text.

## Quick Start

```bash
docker-compose up -d
```

Open `http://localhost:8000`

## Configuration

Edit `docker-compose.yml`:
```yaml
environment:
  - PROPRESENTER_HOST=192.168.3.232
  - PROPRESENTER_PORT=50001
```

## Requirements

- ProPresenter REST API enabled (Preferences > Network)
- Same network connectivity
- Port 50001 accessible

## Files

- `index.html` - Frontend
- `server.py` - Proxy server
- `Dockerfile` - Container image
- `docker-compose.yml` - Deployment config
