/*
 * Check the autolabeler rules, the published labels, and the replacers in `.github/release-drafter.yml`.
 * Usage: node ./scripts/check-release-drafter.mts
 */

import fs from 'node:fs/promises';
import path from 'node:path';

import { parse } from 'yaml';

// eslint-disable-next-line n/no-unsupported-features/node-builtins
const __dirname = import.meta.dirname;

const releaseDrafterConfigFile = path.join(__dirname, '../.github/release-drafter.yml');

interface AutoLabel {
    label: string;
    title?: string[];
}

interface Replacer {
    search: string;
    replace: string;
}

interface ReleaseDrafterConfig {
    'exclude-labels': string[];
    'include-labels': string[];
    autolabeler: AutoLabel[];
    replacers?: Replacer[];
}

/** PR title, the labels it gets from its title, and whether it is in the release notes. */
const titleCases: [title: string, labels: string[], published: boolean][] = [
    ['feat: Add an option', ['feature'], true],
    ['feat(cspell-lib)!: Drop an option', ['feature', 'breaking'], true],
    ['fix: Report errors', ['fix'], true],
    ['fix!: Change a default', ['fix', 'breaking'], true],
    ['fix(cspell)!: Change a default', ['fix', 'breaking'], true],
    ['fix(cspell): Report errors', ['fix'], true],
    ['revert: fix: Report errors', ['fix'], true],
    ['Revert "fix: Report errors"', ['fix'], true],
    ['refactor: Clean up the worker', ['refactor'], false],
    ['dev: Add a debug flag', ['refactor'], false],
    ['docs: Clarify imports', ['documentation'], true],
    ['chore: Update the agent setup', ['chore'], false],
    ['ci: Update a workflow', ['chore'], false],
    ['ci: Workflow Bot -- Update ALL Dependencies (main)', ['dependencies', 'chore'], false],
    ['fix: Workflow Bot -- Update Dictionaries (main)', ['Update Dictionaries', 'fix'], true],
    ['test: Add a case', ['test'], false],
    ['perf: Add a performance test', [], false],
];

const robot = '\u{1F916}';
const sparkles = '\u2728\uFE0F';

const bodyBefore = [
    '## Summary',
    '',
    'The schema is generated with `pnpm run update-schema`.',
    'Generated with [cspell-tools](https://github.com/streetsidesoftware/cspell) and checked by hand.',
    '',
    `${robot} Generated with [Claude Code](https://claude.com/claude-code)`,
    '  Generated with [Some Tool](https://example.com/tool)',
    `${sparkles} generated with [Other Tool](https://example.com/other)`,
    '---',
    `${robot} Generated with [Claude Code](https://claude.com/claude-code)`,
].join('\n');

const bodyAfter = [
    '## Summary',
    '',
    'The schema is generated with `pnpm run update-schema`.',
    'Generated with [cspell-tools](https://github.com/streetsidesoftware/cspell) and checked by hand.',
    '',
    '---',
    '',
].join('\n');

/** Same conversion as release-drafter's `stringToRegex`: `/pattern/flags` is a regular expression, anything else a literal. */
function stringToRegex(search: string): RegExp {
    if (!/^\/.+\/[AJUXgimsux]*$/.test(search)) {
        return new RegExp(search.replaceAll(/[|\\{}()[\]^$+*?.-]/g, '\\$&'), 'g');
    }
    const m = search.match(/(\/?)(.+)\1([a-z]*)/i);
    if (!m) throw new Error(`Bad regular expression: ${search}`);
    const flags = [...new Set(m[3])].filter((f) => 'gimsuy'.includes(f)).join('');
    return new RegExp(m[2], flags);
}

function labelsForTitle(config: ReleaseDrafterConfig, title: string): string[] {
    return config.autolabeler
        .filter((rule) => rule.title?.some((t) => stringToRegex(t).test(title)))
        .map((rule) => rule.label);
}

function isPublished(config: ReleaseDrafterConfig, labels: string[]): boolean {
    return (
        labels.some((l) => config['include-labels'].includes(l)) &&
        !labels.some((l) => config['exclude-labels'].includes(l))
    );
}

function applyReplacers(config: ReleaseDrafterConfig, body: string): string {
    return (config.replacers ?? []).reduce((text, r) => text.replace(stringToRegex(r.search), r.replace), body);
}

async function run() {
    const config = parse(await fs.readFile(releaseDrafterConfigFile, 'utf8')) as ReleaseDrafterConfig;
    const failures: string[] = [];

    for (const [title, expectedLabels, expectedPublished] of titleCases) {
        const labels = labelsForTitle(config, title);
        if (labels.join(',') !== expectedLabels.join(',')) {
            failures.push(`"${title}": labels [${labels}], expected [${expectedLabels}]`);
        }
        if (isPublished(config, labels) !== expectedPublished) {
            failures.push(`"${title}": published is ${!expectedPublished}, expected ${expectedPublished}`);
        }
    }

    const body = applyReplacers(config, bodyBefore);
    if (body !== bodyAfter) {
        failures.push(`replacers:\n--- got ---\n${body}\n--- expected ---\n${bodyAfter}`);
    }

    if (failures.length) {
        console.error(`${path.relative(process.cwd(), releaseDrafterConfigFile)}:\n${failures.join('\n')}`);
        process.exitCode = 1;
        return;
    }
    console.log(`${titleCases.length} titles and the replacers match the expected release notes.`);
}

await run();

// cspell:ignore autolabeler Xgimsux
