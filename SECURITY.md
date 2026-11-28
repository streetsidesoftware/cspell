# Security Policy

## Reporting a vulnerability

Please report security vulnerabilities privately. Don't open a public issue, pull request, or discussion.

- **Preferred:** use GitHub's private vulnerability reporting:
  [Report a vulnerability](https://github.com/streetsidesoftware/cspell/security/advisories/new).
- **Without a GitHub account:** email <security@streetsidesoftware.com>.

Please send one vulnerability per report. A useful report includes:

- the affected package and version, for example `cspell@10.5.2`
- your Node.js version and operating system
- the steps or a minimal example that reproduce the issue
- what an attacker can do with it
- a workaround, if you know one

## What happens next

- We acknowledge a report within 7 days.
- If it's a vulnerability, we fix it privately. We publish a security advisory with the release that fixes it, and
  request a CVE when one applies.
- We credit reporters in the advisory, unless you ask us not to.
- If it isn't a vulnerability, we'll ask you to open a public issue instead.

Please keep the details private until the advisory is published.

## Reports made with AI tools

You may use AI tools to find or describe an issue. Before you report it:

- Check it yourself, and confirm that it reproduces with the latest release.
- Say which tools you used, and for what.

Reports that no person has checked are closed without a reply.

## Supported versions

Security fixes are released for the latest major version.

| Version         | Supported          |
| --------------- | ------------------ |
| 10.x            | :white_check_mark: |
| 9.x and earlier | :x:                |

Support dates for each version are on [Security and Maintenance](https://cspell.org/docs/security-and-maintenance).

## Scope

This policy covers the packages published from this repository.

- For the Code Spell Checker extension for VS Code, report in
  [its repository](https://github.com/streetsidesoftware/vscode-spell-checker/security/advisories/new).
- Report a vulnerability in a dependency to that project. If the way cspell uses it makes cspell exploitable, report
  that here too.
