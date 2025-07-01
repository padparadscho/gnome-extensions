#!/usr/bin/env bash
# Install an extension into the local user directory

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
EXT_SRC_DIR="$ROOT/extensions"
SCRIPTS_DIR="$ROOT/scripts"
TARGET_EXT_DIR="$HOME/.local/share/gnome-shell/extensions"

if [ -z "${1-}" ]; then
  echo "Usage: $0 <extension-directory>" >&2
  exit 2
fi

EXTENSION_NAME="$1"
EXTENSION_PATH="$EXT_SRC_DIR/$EXTENSION_NAME"

if [ ! -d "$EXTENSION_PATH" ]; then
  echo "Error: Extension '$EXTENSION_NAME' not found" >&2
  exit 2
fi

if [ ! -f "$EXTENSION_PATH/metadata.json" ]; then
  echo "Error: No metadata.json found in '$EXTENSION_NAME'" >&2
  exit 2
fi

UUID=$(jq -r '.uuid' "$EXTENSION_PATH/metadata.json")
mkdir -p "$TARGET_EXT_DIR/$UUID"
cp -a "$EXTENSION_PATH"/* "$TARGET_EXT_DIR/$UUID/"

if [ -d "$EXTENSION_PATH/schemas" ]; then
  "$SCRIPTS_DIR/compile.sh" "$EXTENSION_NAME"
fi

echo "Installed: $UUID"