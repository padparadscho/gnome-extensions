#!/usr/bin/env bash
# Install an extension into the local user directory

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
EXT_SRC_DIR="$ROOT/extensions"
SCRIPTS_DIR="$ROOT/scripts"
TARGET_EXT_DIR="$HOME/.local/share/gnome-shell/extensions"

if [ -z "${1-}" ]; then
  echo "Usage: $0 <extension-directory>"
  exit 2
fi

EXTENSION_NAME="$1"
EXTENSION_PATH="$EXT_SRC_DIR/$EXTENSION_NAME"

if [ ! -d "$EXTENSION_PATH" ]; then
  echo "Error: Extension '$EXTENSION_NAME' not found"
  exit 2
fi

# Nautilus extension path
if [ -f "$EXTENSION_PATH/main.py" ]; then
  TARGET_DIR="$HOME/.local/share/nautilus-python/extensions"
  mkdir -p "$TARGET_DIR"
  cp "$EXTENSION_PATH/main.py" "$TARGET_DIR/"
  nautilus -q 2>/dev/null || true
  echo "Installed: nautilus-tools"
# GNOME Shell extension path
elif [ -f "$EXTENSION_PATH/metadata.json" ]; then
  UUID=$(python3 -c "import json;print(json.load(open('$EXTENSION_PATH/metadata.json'))['uuid'])")
  mkdir -p "$TARGET_EXT_DIR/$UUID"
  cp -a "$EXTENSION_PATH"/* "$TARGET_EXT_DIR/$UUID/"

  # Compile schemas after install when present
  if [ -d "$EXTENSION_PATH/schemas" ]; then
    "$SCRIPTS_DIR/compile.sh" "$EXTENSION_NAME"
  fi
  echo "Installed: $UUID"
else
  echo "Error: No extension found (expected main.py or metadata.json)"
  exit 2
fi
