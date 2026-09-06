# RakshaNet Maps & Routes Module

The **Maps & Routes** module is a geospatial routing and tactical visualization sandbox for the RakshaNet platform.

## Features

- **Leaflet & Turf.js Integration**: Dynamic rendering of shelters, incidents, and hazard polygons.
- **Dynamic Polygon Avoidance**: Next.js API route (`src/pages/api/route.ts`) integrating OpenRouteService (ORS) directions API with `avoid_polygons` support.
- **Control Hub**: Tactical overlay showing real-time hazard counts, route metrics (distance, ETA, safety score), and auto-selection of safe relocation paths.
- **Backend Integration**: Connected to the RakshaNet FastAPI PostGIS backend `/api/v1/relocation/route` for authoritative spatial calculations.

## Getting Started

```bash
cd maps-and-routes
npm install
npm run dev
```

Open [http://localhost:3002](http://localhost:3002) with your browser.
