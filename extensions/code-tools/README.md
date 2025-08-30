# Code Tools

<div align="center">

[![CI](https://github.com/padparadscho/gnome-extensions/actions/workflows/ci.yml/badge.svg)](https://github.com/padparadscho/gnome-extensions/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/padparadscho/gnome-extensions)](https://github.com/padparadscho/gnome-extensions/releases)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/padparadscho/gnome-extensions/blob/main/LICENSE)

</div>

`code-tools` is a GNOME Shell extension for Visual Studio Code workflow tools centered on workspaces.

## Features

1. Top bar `Workspaces` indicator.
2. Recent local workspaces list from VSCode storage.
3. Configurable menu limit from 1 to 10.
4. Git and folder icon classification per workspace.
5. Open workspace action using `code <path>`.
6. `View All` and `Settings` actions in the menu.
7. Preferences for workspaces folder path and list management.

## Folder Structure

```text
.
├── icons/              # Symbolic icons for workspaces
├── schemas/
│   └── *.gschema.xml   # GSettings schema definition
├── extension.js        # Main extension logic and lifecycle
├── list.js             # Workspace list management
├── menu.js             # Popup menu rendering and actions
├── metadata.json       # Extension metadata
├── prefs.js            # Preferences window logic
├── stylesheet.css      # Extension styles
├── utils.js            # Utility functions
├── CHANGELOG.md        # Changelog of changes and versions
└── README.md           # Extension overview and documentation
```

## How It Works

- The extension reads VSCode storage from `~/.config/Code/User/workspaceStorage`.
- It scans each `workspace.json` and keeps local `file://` workspaces only.
- It sorts results by recency.
- It filters rows in `set-remove-workspaces`.
- It applies `set-workspaces-limit`.
- It refreshes every 60 seconds.

## Usage

```bash
# Compile the extension's GSettings schema
./scripts/compile.sh code-tools

# Install to local extensions directory
./scripts/install.sh code-tools
```

## Current Limits

1. Remote workspace URI types are ignored.
2. Workspace reopen detection depends on VSCode window titles.

---

Read [CHANGELOG.md](./CHANGELOG.md) for detailed changes.
