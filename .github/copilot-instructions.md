# CSpell Monorepo - Copilot Coding Agent Instructions

Welcome to the CSpell monorepo! This document provides essential information for efficiently working with this codebase.

## Repository Overview

CSpell is a spell checker for code that supports multiple programming languages and is available as a command-line tool, library, and ESLint plugin. This is a monorepo containing ~30+ packages managed with **pnpm workspaces** and **Lerna Lite**.

### Key Packages

- **cspell** - Main CLI application
- **cspell-lib** - Core spelling engine and API
- **cspell-types** - TypeScript types and JSON schema
- **cspell-tools** - Dictionary compilation tools
- **cspell-trie-lib** - Trie data structure for word storage
- **cspell-eslint-plugin** - ESLint integration
- **cspell-bundled-dicts** - Collection of bundled dictionaries

## Development Environment Setup

### Prerequisites

- **Node.js:** 20.0.0+ (CI tests on 20.x & 24.x)
- **Package Manager:** pnpm 10.27.0+ (enforced via `packageManager` field)
- **Corepack:** Enable with `corepack enable` (required for correct pnpm version)

### Initial Setup

```bash
# Enable corepack (ensures correct pnpm version)
corepack enable

# Install dependencies
pnpm install

# Build all packages
pnpm run build

# Run tests
pnpm test

# Or do all at once
pnpm ibt  # Install → Build → Test
```

## Build System

### Build Tools

- **TypeScript 5.9.3** - Primary language
- **tsdown** - Fast TypeScript bundler (used by most packages)
- **rollup** - Module bundler (for some packages)
- **vitest** - Test runner (primary)
- **jest** - Test runner (legacy, being phased out)

### Build Commands

```bash
# Build all packages (includes test-packages)
pnpm run build:all

# Build only production packages (excludes test-packages)
pnpm run build:prod

# Build specific package
cd packages/cspell && pnpm build

# Clean build artifacts
pnpm run clean

# Clean and rebuild everything
pnpm run clean-build
```

### Build Configuration

- **tsconfig.json** - Root TypeScript config (extends `@tsconfig/node20`)
- **tsdown.config.ts** - Package-level bundler config (ESM + CJS outputs)
- **vitest.config.mjs** - Test configuration
- **eslint.config.mjs** - ESLint configuration

### Important Build Notes

- **Workspace concurrency:** Build uses `--workspace-concurrency=2` to prevent race conditions
- **Dual format output:** Most packages output both ESM (dist/esm) and CJS (dist/cjs)
- **Declaration files:** Generated with `isolatedDeclarations: true`
- **Source maps:** Enabled for all builds
- **Build validation:** CI runs `git diff --exit-code` after builds to ensure clean state

## Testing

### Test Commands

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm run test-watch

# Run specific package tests
cd packages/cspell && pnpm test

# Update test snapshots
pnpm run test:update-snapshots

# Run performance tests
pnpm run test:perf

# Run integration tests
pnpm run test-integrations

# Generate coverage
pnpm run coverage
# Open coverage/index.html to view report
```

### Test Frameworks

- **vitest** - Primary test runner (modern, fast)
- **jest** - Legacy test runner (some packages still use it)

### Test Patterns

- Test files: `*.test.ts`, `*.spec.ts`, `*.perf.ts`
- Snapshots: `__snapshots__/` directories
- Fixtures: `fixtures/` directories in packages
- Integration tests: `integration-tests/` directory (tests against real repos)

## Linting and Code Quality

### Linting Commands

```bash
# Run ESLint and Prettier
pnpm run lint

# Lint without cache (slower but comprehensive)
pnpm run eslint-fix-no-cache

# Check code without fixing
pnpm run lint-ci

# Format markdown in website
pnpm run lint-docs
```

### Code Style

- **ESLint:** Uses flat config (eslint.config.mjs) with TypeScript, Node, and Unicorn plugins
- **Prettier:** 120 character line width, single quotes, trailing commas (except JSON/MD)
- **EditorConfig:** 4 spaces for most files, 2 spaces for YAML/JSON/MD
- **Line endings:** LF (enforced via .editorconfig and TypeScript config)

### Pre-commit Checks

- Spelling: `pnpm run check-spelling` (uses cspell on the codebase itself)
- Git validation: Ensure clean state after builds

## Monorepo Structure

### Workspace Configuration

The repository uses **pnpm workspaces** defined in `pnpm-workspace.yaml`:

```yaml
packages:
  - 'packages/*'
  - 'test-packages/*/*'
  - 'integration-tests'
  - 'website'
  - 'tools/*'
  - 'rfc/*'
  # ... and more
```

### Internal Dependencies

- Use `workspace:*` notation for internal package dependencies
- Example: `"cspell-lib": "workspace:*"`
- pnpm automatically resolves to local packages during development

### Package Structure

```
packages/
├── cspell/              # Main CLI package
├── cspell-lib/          # Core library
├── cspell-types/        # Types and schemas
├── cspell-tools/        # Dictionary tools
└── ...
test-packages/           # Integration/format tests
integration-tests/       # Tests against real repositories
website/                 # Documentation site (Docusaurus)
tools/                   # Build and automation tools
scripts/                 # Helper scripts
```

## Common Workflows

### Adding a New Package

1. Create directory in `packages/`
2. Add `package.json` with `workspace:*` dependencies
3. Add TypeScript config extending root tsconfig
4. Add build configuration (tsdown.config.ts or similar)
5. Build will automatically include it via workspace glob

### Modifying Dictionaries

**Note:** Dictionary words are managed in a separate repository: [cspell-dicts](https://github.com/streetsidesoftware/cspell-dicts)

For workspace-specific words:

- Add to `cspell-dict.txt` (custom words)
- Add to `cspell-ignore-words.txt` (words to ignore)

### Updating Snapshots

```bash
# Update all snapshots
pnpm run update-test-snapshots

# Update specific package snapshots
cd packages/cspell && pnpm run test:update-snapshot
```

### Working with Integration Tests

```bash
# Build integration tests
pnpm run build-integration-tests

# Run integration tests
pnpm run test-integrations

# Update integration snapshots
pnpm run update-integration-snapshots
```

## CI/CD Workflows

### GitHub Actions Workflows

Located in `.github/workflows/`:

- **test.yml** - Unit tests on Node 20.x & 24.x (Ubuntu + Windows)
- **lint.yml** - ESLint and Prettier checks
- **coverage.yml** - Code coverage reporting
- **integration-test.yml** - Integration tests against real repositories
- **smoke-test.yml** - Quick validation tests
- **build-version-release.yml** - Version bumping and releases
- **publish.yml** - NPM package publishing (using Lerna)

### Custom GitHub Actions

Located in `.github/actions/`:

- **install-build** - Standard setup → install → build
- **install-build-cache** - Same with caching
- **setup-node** - Node.js + pnpm setup (handles corepack issues)
- **smoke-test** - Quick smoke tests

### CI Notes

- **Corepack workaround:** Windows CI has special handling for corepack issues (see setup-node action)
- **Build caching:** Uses pnpm cache and custom dist caching
- **Concurrency:** Workflows use `cancel-in-progress: true` to cancel outdated runs

## Common Errors and Workarounds

### 1. Corepack/pnpm Version Issues

**Error:** Wrong pnpm version or corepack not enabled

**Solution:**

```bash
# Enable corepack
corepack enable

# Verify pnpm version
pnpm -v  # Should be 10.27.0+

# If wrong version, reinstall
npm i -g --force corepack
corepack enable
```

### 2. Build Failures After Package Changes

**Error:** Build fails with module resolution errors

**Solution:**

```bash
# Clean and rebuild
pnpm run clean
pnpm install
pnpm run build
```

### 3. Test Failures Due to Outdated Snapshots

**Error:** Snapshot mismatch

**Solution:**

```bash
# Update all snapshots
pnpm run update-test-snapshots

# Or update specific package
cd packages/cspell && pnpm run test:update-snapshot
```

### 4. Git Diff Not Clean After Build

**Error:** CI fails on `git diff --exit-code`

**Cause:** Build generates/modifies files that should be committed

**Solution:**

```bash
# Check what changed
git status
git diff

# If changes are expected, commit them
git add .
git commit -m "Update generated files"
```

### 5. Windows-specific Build Issues

**Error:** Build fails on Windows but works on Unix

**Common causes:**

- Line ending differences (should be LF, configured in .editorconfig)
- Path separator issues (use `path.join()` or `path.posix`)
- Case sensitivity (Windows is case-insensitive)

**Solution:**

- Ensure `.editorconfig` is respected
- Use Node.js path utilities
- Test on Windows if making path-related changes

### 6. TypeScript Declaration File Errors

**Error:** `isolatedDeclarations` errors

**Cause:** TypeScript 5.5+ requires explicit return types for exported functions

**Solution:**

```typescript
// Bad
export function myFunc() {
  return 'hello';
}

// Good
export function myFunc(): string {
  return 'hello';
}
```

### 7. Workspace Dependency Issues

**Error:** Cannot resolve workspace dependency

**Solution:**

```bash
# Ensure all packages are built
pnpm run build

# Re-install if needed
pnpm install
```

### 8. Coverage Report Issues

**Error:** Coverage not generating or incorrect

**Solution:**

```bash
# Clean coverage data
pnpm run clean

# Regenerate coverage
pnpm run coverage

# Open coverage/index.html
```

## Performance Considerations

### Build Performance

- Use `pnpm build:prod` to skip test-packages (faster)
- Parallel builds limited to 2 concurrent jobs to prevent memory issues
- tsdown is faster than tsc for most packages

### Test Performance

- Use `pnpm test` for full test suite
- Use `cd packages/[package] && pnpm test` for targeted testing
- Performance tests: `pnpm run test:perf`

### Caching

CSpell itself uses caching:

```json
{
  "cache": {
    "useCache": true,
    "cacheLocation": "./.cspell/.cspellcache",
    "cacheStrategy": "content"
  }
}
```

## Documentation

### Main Documentation

- **Website:** https://cspell.org/docs/getting-started
- **Source:** `website/docs/` (Docusaurus)
- **Contributing:** `CONTRIBUTING.md`
- **Changelog:** `CHANGELOG.md` (root and per-package)

### Building Documentation

```bash
# Install website dependencies
pnpm run website-install

# Build website
pnpm run test-build-docs

# Lint website
pnpm run website-lint
```

### RFCs (Request for Comments)

Located in `rfc/`:

- **rfc-0001** - Fixing common misspellings (Done)
- **rfc-0002** - Improving dictionary suggestions (Done)
- **rfc-0003** - Plug-ins: Adding file parsers (In Progress)
- **rfc-0004** - Support marking issues as known (Not started)
- **rfc-0005** - Named configurations

## Publishing (Maintainers Only)

### Release Process

```bash
# Prepare for publishing
pnpm run pre-pub

# Publish to NPM (conventional commits)
pnpm run pub

# Publish prerelease
pnpm run pub-next

# Graduate from prerelease
pnpm run pub-grad
```

Uses Lerna Lite with conventional commits for changelog generation.

## Useful Tips

### 1. Use Short Commands

```bash
# Instead of: pnpm install && pnpm build && pnpm test
pnpm ibt

# Instead of: pnpm install:prod && pnpm build:prod
pnpm ibp

# Instead of: pnpm build && pnpm test
pnpm bt
```

### 2. Target Specific Packages

```bash
# Build only specific package and its dependencies
pnpm -r --filter cspell... run build

# Run command in specific package
pnpm --filter cspell test
```

### 3. Check Spelling of Your Changes

```bash
# Spell check specific files
pnpm cspell "**/*.ts"

# Check everything
pnpm run check-spelling
```

### 4. Working with Git

```bash
# Check only changed files
git diff --name-only | npx cspell --file-list stdin

# Use --no-pager for cleaner output in scripts
git --no-pager diff
git --no-pager status
```

### 5. Debugging Build Issues

```bash
# Verbose build output
pnpm run build --stream

# Check TypeScript compilation only
pnpm run build:tsc

# Individual package build
cd packages/cspell && pnpm run clean-build
```

### 6. Using the Monorepo CLI

```bash
# Direct cspell execution from repo
./bin.mjs lint <files>
./cspell-tools.mjs --help
```

## Key Files and Directories

- **package.json** - Root package with scripts and workspace config
- **pnpm-workspace.yaml** - Workspace package globs
- **lerna.json** - Lerna configuration for publishing
- **tsconfig.json** - Root TypeScript configuration
- **eslint.config.mjs** - ESLint configuration
- **vitest.config.mjs** - Vitest test configuration
- **cspell.json** - CSpell configuration for the monorepo itself
- **.github/workflows/** - CI/CD workflows
- **.github/actions/** - Reusable GitHub Actions
- **packages/** - Main package source code
- **test-packages/** - Integration and format test packages
- **integration-tests/** - Tests against real repositories
- **website/** - Documentation website
- **tools/** - Build and automation tools
- **scripts/** - Helper scripts

## Additional Resources

- **GitHub Issues:** https://github.com/streetsidesoftware/cspell/issues
- **Discussions:** https://github.com/streetsidesoftware/cspell/discussions
- **Contributing Guide:** CONTRIBUTING.md
- **Security:** SECURITY.md
- **Code of Conduct:** CODE_OF_CONDUCT.md

## Questions or Issues?

If you encounter issues not covered in this guide:

1. Check existing GitHub issues
2. Search the documentation at https://cspell.org
3. Ask in GitHub Discussions
4. Refer to package-specific READMEs in `packages/*/README.md`

---

**Last Updated:** 2026-02-03
