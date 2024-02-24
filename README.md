# Tree-sitter parser update

## Options

```yaml
parent-name:
  description: The parent language name (for scanner updates)
language-name:
  description: The current language name (for scanner updates)
commit-message:
  description: The commit message
  default: "build: update & regenerate parser"
base-branch:
  description: The base branch of the PR
  default: ${{github.event.repository.default_branch}}
head-branch:
  description: The head branch of the PR
  default: update-parser-pr
```

## Example configuration

```yaml
name: Update dependencies

on:
  schedule:
    - cron: "0 0 * * 0" # every week
  workflow_dispatch:

permissions:
  contents: write
  pull-requests: write

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          cache: npm
          node-version: 20
      - uses: tree-sitter/parser-update-action@v1.1
        with:
          parent-name: c
          language-name: cpp
```
