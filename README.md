# GNOME Extensions

<div align="center">

[![CI](https://github.com/padparadscho/gnome-extensions/actions/workflows/ci.yml/badge.svg)](https://github.com/padparadscho/gnome-extensions/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/padparadscho/gnome-extensions)](https://github.com/padparadscho/gnome-extensions/releases)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/padparadscho/gnome-extensions/blob/main/LICENSE)

</div>

A collection of personal GNOME Shell extensions built with GJS for **GNOME 49+**.

## Overview

This repository contains custom GNOME Shell extensions designed to enhance productivity and workflow on the GNOME desktop environment. Each extension is self-contained and can be installed independently.

## Extensions

| Extension                                  | Description                                              |
| ------------------------------------------ | -------------------------------------------------------- |
| [Code Tools](./extensions/code-tools/)     | Visual Studio Code workflow tools centered on workspaces |
| [GitHub Tools](./extensions/github-tools/) | GitHub workflow tools centered on repositories           |

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
- GLib (for `glib-compile-schemas`)

## Quick Start

### Install an Extension

```bash
# Compile the extension's GSettings schema
./scripts/compile.sh code-tools

# Install to local extensions directory
./scripts/install.sh code-tools
```

### Manual Installation

```bash
# 1. Navigate to the extension directory
cd extensions/code-tools

# 2. Compile schemas (if the extension uses GSettings)
glib-compile-schemas schemas/

# 3. Copy to GNOME extensions directory
mkdir -p ~/.local/share/gnome-shell/extensions/code-tools
cp -r * ~/.local/share/gnome-shell/extensions/code-tools/

# 4. Restart GNOME Shell
# X11: Press Alt+F2, type 'r', press Enter
# Wayland: Log out and log back in

# 5. Enable the extension
gnome-extensions enable code-tools
```

## Contributing

If you're interested in helping improve the `gnome-extensions` project, please see the [CONTRIBUTING](/CONTRIBUTING.md) file for guidelines on how to get started.

## License

This project is licensed under the [MIT License](/LICENSE).
