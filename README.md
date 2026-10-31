# Smart Traffic Control & Surveillance System

A production-quality frontend prototype for a university smart-city traffic management project.

## Overview

Real-time monitoring and control dashboard for a miniature smart city with **4 interconnected traffic intersections**. Each intersection has AI-powered cameras (ESP32-S3) that detect vehicles, identify emergency vehicles, monitor density, and detect incidents.

Built with **HTML5, CSS3, and Vanilla JavaScript only**

## Features

- **Login** — Professional auth screen with form validation (demo: `admin` / `admin123`)
- **Dashboard** — Live stats cards, interactive smart city map with animated vehicles
- **Intersections** — Per-direction traffic lights, vehicle counts, density, timers
- **AI Cameras** — Simulated YOLO-style detection with bounding boxes & confidence
- **Analytics** — Chart.js line, bar, doughnut charts (vehicles over time, density, types, speed)
- **Incidents** — Alert table with priority badges, filter, search, resolve
- **System Control** — Auto/manual mode, force red, emergency priority, camera controls
- **Settings** — Preferences stored in localStorage
- **Live simulation** — Data updates every 3 seconds; ready to swap for real API

## Project Structure

```
Smart-Traffic-System/
├── index.html              # Login
├── dashboard.html          # Main command center
├── monitoring.html         # Map + cameras overview
├── intersections.html      # Per-intersection control
├── analytics.html          # Charts
├── incidents.html          # Alerts
├── cameras.html            # AI camera feeds
├── control.html            # Manual system control
├── settings.html           # Preferences
├── css/
│   ├── global.css          # Design system, components
│   ├── dashboard.css       # Layout & page styles
│   └── responsive.css      # Mobile / tablet
├── js/
│   ├── api-service.js      # Mock API (swap for real endpoints)
│   ├── traffic-simulation.js
│   ├── app.js              # Auth, toasts, modals, layout
│   ├── dashboard.js        # Page controllers
│   └── charts.js           # Chart.js wrappers
└── assets/
```

## How to Run

Open `index.html` in a modern browser, or serve locally:

```bash
cd Smart-Traffic-System
python -m http.server 8080
# → http://localhost:8080
```

**Login:** `admin` / `admin123`

## Connecting a Real Backend

In `js/api-service.js`, set `USE_MOCK = false` and point `BASE_URL` to your Flask/FastAPI server.

Planned endpoints:

| Method | Endpoint                      |
| ------ | ----------------------------- |
| GET    | `/api/intersections`          |
| GET    | `/api/cameras`                |
| GET    | `/api/incidents`              |
| GET    | `/api/system-status`          |
| GET    | `/api/analytics`              |
| POST   | `/api/control/traffic-lights` |
| POST   | `/api/control/cameras`        |

## Tech Notes

- Dark futuristic command-center UI (glassmorphism, cyan accents)
- Fully responsive (desktop / tablet / mobile)
- localStorage for auth state and settings
- Simulation engine can be replaced by WebSocket or polling
- Chart.js loaded via CDN on analytics page only

## Future Integration

- ESP32-S3 camera modules → vehicle detection stream
- Flask backend + Supabase database
- Real YOLO / edge AI inference overlays
- WebSocket for true real-time updates
