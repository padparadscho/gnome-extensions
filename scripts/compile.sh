#!/usr/bin/env bash
# Compile GSettings schemas for one extension under extensions/

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
EXT_SRC_DIR="$ROOT/extensions"

if [ -z "${1-}" ]; then
  echo "Usage: $0 <extension-directory>" >&2
  echo ""
  echo "Compiles GSettings schemas for the specified extension."
  echo ""
  echo "Example: $0 code-tools"
  exit 2
fi

TARGET="$1"
EXTENSION_PATH="$EXT_SRC_DIR/$TARGET"

if [ ! -d "$EXTENSION_PATH" ]; then
  echo "Error: Extension directory '$TARGET' not found in $EXT_SRC_DIR" >&2
  exit 2
fi

SCHEMAS_DIR="$EXTENSION_PATH/schemas"

if [ ! -d "$SCHEMAS_DIR" ]; then
  echo "No schemas directory found at $SCHEMAS_DIR"
  exit 0
fi

echo "Compiling schemas in $SCHEMAS_DIR"
glib-compile-schemas "$SCHEMAS_DIR"
echo "Done."