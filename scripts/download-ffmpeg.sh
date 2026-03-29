#!/bin/bash
# Downloads FFmpeg binaries for packaging into the Electron app
# Run this before building: bash scripts/download-ffmpeg.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
FFMPEG_DIR="$PROJECT_DIR/ffmpeg-bin"

echo "Downloading FFmpeg binaries..."

# Windows (x64)
echo "→ Windows x64..."
mkdir -p "$FFMPEG_DIR/win"
curl -L -o /tmp/ffmpeg-win.zip "https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip"
unzip -o -j /tmp/ffmpeg-win.zip "*/bin/ffmpeg.exe" "*/bin/ffprobe.exe" -d "$FFMPEG_DIR/win/"
rm /tmp/ffmpeg-win.zip
echo "  ✓ ffmpeg.exe + ffprobe.exe"

# macOS (universal — works on Intel + Apple Silicon)
echo "→ macOS..."
mkdir -p "$FFMPEG_DIR/mac"
curl -L -o "$FFMPEG_DIR/mac/ffmpeg" "https://evermeet.cx/ffmpeg/getrelease/ffmpeg/zip" 2>/dev/null || \
curl -L -o /tmp/ffmpeg-mac.zip "https://evermeet.cx/ffmpeg/getrelease/ffmpeg/zip" && \
  unzip -o /tmp/ffmpeg-mac.zip -d "$FFMPEG_DIR/mac/" && rm /tmp/ffmpeg-mac.zip
curl -L -o "$FFMPEG_DIR/mac/ffprobe" "https://evermeet.cx/ffmpeg/getrelease/ffprobe/zip" 2>/dev/null || \
curl -L -o /tmp/ffprobe-mac.zip "https://evermeet.cx/ffmpeg/getrelease/ffprobe/zip" && \
  unzip -o /tmp/ffprobe-mac.zip -d "$FFMPEG_DIR/mac/" && rm /tmp/ffprobe-mac.zip
chmod +x "$FFMPEG_DIR/mac/ffmpeg" "$FFMPEG_DIR/mac/ffprobe" 2>/dev/null || true
echo "  ✓ ffmpeg + ffprobe"

echo ""
echo "Done! FFmpeg binaries are in $FFMPEG_DIR"
echo "You can now run: npm run electron:build:win  or  npm run electron:build:mac"
