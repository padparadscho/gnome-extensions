# GNOME Extensions

<div align="center">

[![CI](https://github.com/padparadscho/gnome-extensions/actions/workflows/ci.yml/badge.svg)](https://github.com/padparadscho/gnome-extensions/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/padparadscho/gnome-extensions/blob/main/LICENSE)

</div>

A collection of _personal_ GNOME Shell extensions built with GJS for **GNOME 49+**.

## Overview

This repository contains custom GNOME Shell extensions designed to enhance _my_ productivity and workflow on the GNOME desktop environment. Each extension is self-contained and can be installed independently.

## Extensions

| Extension                              | Description                                              |
| -------------------------------------- | -------------------------------------------------------- |
| [Code Tools](./extensions/code-tools/) | Visual Studio Code workflow tools centered on workspaces |

## Project Structure

```text
.
├── .github/             # GitHub-specific files
├── extensions/          # Individual extension directories
│   └── [*]-tools/
├── scripts/             # Build and installation scripts
│   ├── compile.sh       # Compile GSettings schemas
│   └── install.sh       # Install extensions locally
└── ...                  # Other project files (README, LICENSE, etc.)
```

## Requirements

- GNOME Shell 49 or later
- `GLib` (for `glib-compile-schemas`)
- `jq` (for JSON parsing)

## Quick Start

### Install an Extension

```bash
# Install to local extensions directory
./scripts/install.sh code-tools

# Restart GNOME Shell
# X11: Press Alt+F2, type 'r', press Enter
# Wayland: Log out and log back in

# Enable the extension
gnome-extensions enable code-tools
```

## License

This project is licensed under the [MIT License](/LICENSE).
