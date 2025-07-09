# GitHub Tools

`github-tools` is a GNOME Shell extension for GitHub workflow tools centered on repositories.

## Features

1. Top bar `GitHub` indicator.
2. Recent repositories list from GitHub.
3. Configurable menu limit from 1 to 10.
4. Owner, collaborator, and fork icon classification per repository.
5. Open repository action using default browser.
6. `View Profile` and `Settings` actions in the menu.
7. Preferences for GitHub PAT and repositories limit.

## Folder Structure

```text
.
├── icons/              # Symbolic icons for repositories
├── schemas/
│   └── *.gschema.xml   # GSettings schema definition
├── api.js              # GitHub REST API client
├── extension.js        # Main extension logic and lifecycle
├── menu.js             # Popup menu rendering and actions
├── metadata.json       # Extension metadata
├── prefs.js            # Preferences window logic
├── state.js            # Observable state container
├── stylesheet.css      # Extension styles
├── utils.js            # Utility functions
├── CHANGELOG.md        # Changelog of changes and versions
└── README.md           # Extension overview and documentation
```

## How It Works

- The extension uses [GitHub REST API v2022-11-28](https://docs.github.com/en/rest?apiVersion=2022-11-28) with `/user` and `/user/repos` endpoints.
- It authenticates using a GitHub Personal Access Token (PAT) from preferences.
- It sorts repositories by recency using `sort=updated`.
- It applies `set-repositories-limit`.
- It refreshes every 60 seconds.
- It displays ownership icons: Fork > Owner > Collaborator.

## Usage

```bash
# Compile the extension's GSettings schema
./scripts/compile.sh github-tools

# Install to local extensions directory
./scripts/install.sh github-tools
```

## Current Limits

1. Maximum 10 repositories can be displayed.
2. Polling interval is fixed at 60 seconds.
