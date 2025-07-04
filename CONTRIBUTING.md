# Contribution Guidelines

Contributions to this project are welcome and appreciated. This document provides guidelines for the contribution process.

## Code of Conduct

This project repository and everyone participating in it is governed by the [**Code of Conduct**](/CODE_OF_CONDUCT.md). All contributors are expected to adhere to this code.

## Your First Contribution

### Setting Up the Project

To contribute, the project must be set up on a local machine.

1.  **Fork** the `gnome-extensions` repository to a personal GitHub account.
2.  **Clone** the forked repository to a local machine:

```bash
git clone https://github.com/padparadscho/gnome-extensions.git
cd gnome-extensions
```

### Development Environment Requirements

To contribute to this project, ensure your development environment is properly configured:

#### Prerequisites

1. **GNOME Shell 49+**
2. **GLib** with `glib-compile-schemas` available in `PATH`
3. **Python 3** for script utilities

#### Compiling and Installing Extensions

Build and install one extension at a time during development.

```bash
# Compile the extension schema
./scripts/compile.sh <extension-directory>

# Install to local extensions directory
./scripts/install.sh <extension-directory>
```

## Reporting Issues and Requesting Features

Bugs are reported and new features are requested by opening an [**Issue**](https://github.com/padparadscho/gnome-extensions/issues) using the appropriate template.

For feature development, the scope of the change should be considered:

- **Major Features**: An issue must be opened to propose and discuss the design before coding begins.

- **Small Features & Bug Fixes**: A [**Pull Request**](https://github.com/padparadscho/gnome-extensions/pulls) can be submitted directly.

## Submission Guidelines

### Submitting an Issue

Before creating an issue, please search existing issues to see if a similar one has already been reported.

### Submitting a Pull Request (PR)

Follow these steps when submitting a Pull Request:

1. Search the project's pull requests to see if a similar one already exists.

2. Ensure an issue exists that documents the problem or feature
   This provides context for the changes.

3. Fork the repository and create a new git branch from `main`
   A descriptive branch name is recommended:

```bash
git checkout -b <branch-name> main
```

4. After making changes, stage and commit with a clear message following the specified [format](#commit-message-format):

```bash
git add .
git commit -m "<type>(<scope>): <subject>"
```

5. Push the branch to the fork on GitHub:

```bash
git push origin <branch-name>
```

6. Open a pull request from the forked repository to the `gnome-extensions:main` branch. The PR must be linked to the relevant issue.

**Note on Collaboration:** Pull requests that do not follow these guidelines may be closed with a request for corrections to ensure a smooth process.

### Test Quality Standards

- Changes should be **deterministic** and **repeatable**.
- Each change should focus on a **single functionality**.
- Manually verify extension behavior after installation.
- Confirm schema compile output is clean before submitting.

### After a PR is Merged

Once a PR is merged, the related branches can be safely cleaned up.

1. Delete the remote branch on GitHub:

```bash
git push origin --delete <branch-name>
```

2. Switch back to the `main` branch:

```bash
git checkout main
```

3. Delete the local branch:

```bash
git branch -d <branch-name>
```

4. Update the local `main` branch with the latest changes from the upstream repository:

```bash
git pull upstream main
```

### Commit Message Format

The [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0) specification is followed to maintain a clear and readable project repository history.

Each commit message consists of a **header**, an optional **body**, and an optional **footer**.

```
<type>(<scope>): <subject>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

- The `header` is required and must follow the format `<type>(<scope>): <subject>`.
- If present, the `body` should be used to explain the _what_ and _why_ of the changes, not the _how_.
- The `footer` should contain any breaking change information or reference issues that this commit closes.

### Reverting Commits

To revert a previous commit, the commit message must start with `revert:`, followed by the header of the commit being reverted. The body should explain the reason for the reversion.
