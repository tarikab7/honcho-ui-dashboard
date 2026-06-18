# Honcho UI Dashboard

A dark-themed, read-only web dashboard for viewing data from a **self-hosted Honcho** instance.

## Features

- **Dashboard** — summary cards (conclusions, sessions, observations, last activity)
- **Conclusions** — browse all saved facts with search & sort
- **Sessions** — view conversation metadata
- **Observations** — timeline view grouped by date
- **Dark theme** — GitHub-dark style (`#0d1117`)
- **Read-only** — no edit, delete, or write operations
- **No authentication required** — designed for internal network use
- **Auto-detects API URL** — no hardcoded IPs or configuration needed

## Quick Start

```bash
# Serve with any HTTP server
python3 -m http.server 8080
```

Make sure your Honcho API is accessible at the same host (the dashboard auto-detects via `window.location.origin`).

## Deployment

Place `index.html` behind a reverse proxy that forwards `/v3/*` to your Honcho API (default port 8000).

Example nginx config:
```nginx
server {
    listen 8080;
    
    location / {
        root /path/to/dashboard;
        index index.html;
    }
    
    location /v3/ {
        proxy_pass http://127.0.0.1:8000;
    }
}
```

## Tech Stack

- **Single HTML file** — embedded CSS + vanilla JavaScript
- **No build step** — download and serve immediately
- **No dependencies** — no npm, no frameworks

## Security

This dashboard is **read-only** and contains no hardcoded credentials, API keys, or IP addresses. It uses `window.location.origin` to auto-detect the API host.

## License

MIT
