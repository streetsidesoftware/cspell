---
parent: Other Info
---

# Continuous Integration (CI)

Code projects often use tools to run a series of checks after every code commit to a Git repository. This is referred to as continuous integration, or CI for short.

It's relatively easy to add CSpell to your CI pipeline. This lets you catch spelling errors the moment they happen!

## GitHub Actions

Most people who host open-source projects on GitHub use [GitHub Actions](https://github.com/features/actions) for CI. GitHub Actions will run automatically if your repository contains files in the `.github/workflows` directory.

For a typical JavaScript/TypeScript project, assuming that CSpell is installed as a dependency in the "package.json" file, you can use something like the following file:

<!-- markdownlint-disable-next-line -->
#### **`.github/workflows/ci.yml`**

<!-- cspell:ignore endraw -->
```yml
name: CI

on: [push, pull_request]

jobs:
  build_and_lint:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout the repository
        uses: actions/checkout@v2

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '16'

      - name: Retrieve the cached "node_modules" directory (if present)
        uses: actions/cache@v2
        id: node-cache
        with:
          path: node_modules
          key: {% raw %}node-modules-${{ runner.os }}-${{ hashFiles('package-lock.json') }}{% endraw %}

      - name: Install dependencies (if the cached directory was not found)
        if: steps.node-cache.outputs.cache-hit != 'true'
        run: npm ci

      - name: Spell check every file in the repository
        run: npx cspell "**"
        # If you have the files for the project defined in the repository CSpell configuration
        # file, you can use the following line instead:
        # run: npx cspell
```

## Mega-Linter

[Mega-Linter](https://nvuillam.github.io/mega-linter/) is a tool that aggregates many linters, including [cspell](https://nvuillam.github.io/mega-linter/descriptors/spell_cspell/).

It can be run locally, as a GitHub Action, or with other CI tools.
