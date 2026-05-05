#!/usr/bin/env bash
# Copy H2 painted-pixel archetype sprites from a freshly delivered bundle into
# public/sprites/h2/, renaming the 3 alias keys so destination filenames match
# the *app* sprite keys (not the bundle's labels). Re-run any time the H2
# bundle is updated.
#
# Usage:
#   ./scripts/copy-h2-sprites.sh <path-to-bundle-dir>
#
# The bundle is expected to contain PNG@4x files (512×512) named after either
# the app key or one of the 3 known aliases.
#
# Background: see commit 5643774 + docs/session-resume-2026-05-03.md gotcha
# "Bundle keys ≠ app keys (3 aliases)".

set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <path-to-bundle-dir>" >&2
  exit 1
fi

SRC_DIR="$1"
DEST_DIR="$(cd "$(dirname "$0")/.." && pwd)/public/sprites/h2"

if [[ ! -d "$SRC_DIR" ]]; then
  echo "Source dir not found: $SRC_DIR" >&2
  exit 1
fi

mkdir -p "$DEST_DIR"

# Bundle key → app key. Anything not listed copies as-is (filename unchanged).
declare -A ALIASES=(
  [speedrunner]=quickDraw
  [cozy-craver]=cozy
  [dino-rider]=dino
)

count=0
for src in "$SRC_DIR"/*.png; do
  [[ -e "$src" ]] || continue
  base="$(basename "$src" .png)"
  app_key="${ALIASES[$base]:-$base}"
  cp "$src" "$DEST_DIR/${app_key}.png"
  echo "  $base.png → ${app_key}.png"
  count=$((count + 1))
done

echo
echo "Copied $count sprites to $DEST_DIR"
