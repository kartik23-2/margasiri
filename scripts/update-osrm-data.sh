#!/usr/bin/env bash
set -euo pipefail

# Refreshes the India OSM extract and rebuilds OSRM routing data.
# This is meant to run on the OSRM server, not inside Vercel.
# Recommended starter host: a modest VPS such as Hetzner CX22 or similar
# 2 vCPU / 4 GB RAM / 80 GB disk. Increase disk/RAM if preprocessing fails
# or if routing traffic grows. Monthly refresh is a reasonable first schedule.

OSRM_DIR="${OSRM_DIR:-/srv/osrm}"
OSM_URL="${OSM_URL:-https://download.geofabrik.de/asia/india-latest.osm.pbf}"
PROFILE="${PROFILE:-/opt/car.lua}"
OSRM_IMAGE="${OSRM_IMAGE:-osrm/osrm-backend:latest}"
PBF_FILE="$OSRM_DIR/india-latest.osm.pbf"
OSRM_FILE="$OSRM_DIR/india-latest.osrm"

mkdir -p "$OSRM_DIR"
cd "$OSRM_DIR"

echo "Downloading latest India OSM extract..."
curl -L "$OSM_URL" -o "$PBF_FILE"

echo "Running osrm-extract..."
docker run --rm -t -v "$OSRM_DIR:/data" "$OSRM_IMAGE" osrm-extract -p "$PROFILE" "/data/$(basename "$PBF_FILE")"

echo "Running osrm-partition..."
docker run --rm -t -v "$OSRM_DIR:/data" "$OSRM_IMAGE" osrm-partition "/data/$(basename "$OSRM_FILE")"

echo "Running osrm-customize..."
docker run --rm -t -v "$OSRM_DIR:/data" "$OSRM_IMAGE" osrm-customize "/data/$(basename "$OSRM_FILE")"

cat <<EOF
OSRM data refresh complete.

Run the router behind a private network or firewall, then proxy it through
Next.js /api/journey/route:

docker run -d --restart unless-stopped --name osrm-india \\
  -p 127.0.0.1:5000:5000 \\
  -v "$OSRM_DIR:/data" \\
  "$OSRM_IMAGE" osrm-routed --algorithm mld "/data/$(basename "$OSRM_FILE")"

Set OSRM_SERVER_URL to that private base URL, for example http://10.0.0.12:5000.
EOF
