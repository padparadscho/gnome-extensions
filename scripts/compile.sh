#!/usr/bin/env bash
# Compile GSettings schemas for one extension under extensions/

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
EXT_SRC_DIR="$ROOT/extensions"

if [ -z "${1-}" ]; then
  echo "Usage: $0 <extension-directory>"
  echo ""
  echo "Compiles GSettings schemas for the specified extension."
  echo ""
  echo "Example: $0 app-tools"
  exit 2
fi

TARGET="$1"

compile_schemas() {
  local ext_dir="$1"
  local schemas_dir="$ext_dir/schemas"

  if [ -d "$schemas_dir" ]; then
    echo "Compiling schemas in $schemas_dir"
    glib-compile-schemas "$schemas_dir"
  else
    echo "No schemas directory found at $schemas_dir"
    exit 0
  fi
}

# Verify extension exists and compile
if [ -d "$EXT_SRC_DIR/$TARGET" ]; then
  compile_schemas "$EXT_SRC_DIR/$TARGET"
  echo "Done."
  exit 0
fi

echo "Error: Extension directory '$TARGET' not found in $EXT_SRC_DIR"
exit 2
