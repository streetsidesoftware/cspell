/*
 * Check how PR bodies are cleaned for the release notes.
 * Usage: node ./scripts/check-clean-release-body.mts
 */

import { cleanPullRequestBody, cleanReleaseBody, pullRequestNumbers } from './lib/clean-release-body.mts';

const fence = '```';

/** A PR body, and what's left of it in the release notes. */
const bodyCases: [name: string, body: string, expected: string][] = [
    ['keeps a plain body', 'Fixes the cache.\n\n- one\n- two', 'Fixes the cache.\n\n- one\n- two'],
    ['removes a comment', 'Before <!-- hidden --> after.', 'Before  after.'],
    ['removes a multi-line comment', 'Before\n<!--\nhidden\nlines\n-->\nAfter', 'Before\n\nAfter'],
    ['makes an unclosed comment visible', 'Before\n<!-- never closed\nAfter', 'Before\n&lt;!-- never closed\nAfter'],
    [
        'keeps a comment in inline code',
        'Use `<!-- cspell:ignore -->` to ignore.',
        'Use `<!-- cspell:ignore -->` to ignore.',
    ],
    [
        'keeps a comment in a code block',
        `Example:\n\n${fence}md\n<!-- cspell:ignore word -->\n${fence}\n`,
        `Example:\n\n${fence}md\n<!-- cspell:ignore word -->\n${fence}\n`,
    ],
    [
        'removes a maintainer block in the middle',
        'User text.\n\n<details>\n<summary>For maintainers</summary>\n\n- why\n\n</details>\n\nMore user text.',
        'User text.\n\n\n\nMore user text.',
    ],
    [
        'matches the summary in any case and spacing',
        'Text.\n<details><summary> for MAINTAINERS </summary>\n\n- why\n</details>',
        'Text.\n',
    ],
    [
        'removes nested blocks with the maintainer block',
        'A\n<details>\n<summary>For maintainers</summary>\n\n<details>\n<summary>Log</summary>\n\nx\n</details>\n\n- why\n</details>\nB',
        'A\n\nB',
    ],
    [
        'keeps other details blocks',
        '<details>\n<summary>Usage</summary>\n\nRun it.\n</details>',
        '<details>\n<summary>Usage</summary>\n\nRun it.\n</details>',
    ],
    [
        'keeps a maintainer block shown in a code block',
        `${fence}md\n<details>\n<summary>For maintainers</summary>\n</details>\n${fence}`,
        `${fence}md\n<details>\n<summary>For maintainers</summary>\n</details>\n${fence}`,
    ],
    [
        'removes an unclosed maintainer block to the end',
        'Text.\n<details>\n<summary>For maintainers</summary>\n\n- why',
        'Text.\n',
    ],
    ['keeps CRLF line endings', 'Line one\r\n<!-- x -->\r\nLine two', 'Line one\r\n\r\nLine two'],
];

function entry(title: string, body: string): string {
    return `<details>\n<summary>${title}</summary>\n\n### ${title}\n${body}\n\n---\n\n</details>\n`;
}

const prBodies = new Map<number, string>([
    [101, 'First.\n<!-- unclosed\n\n<details>\n<summary>For maintainers</summary>\n\n- why\n</details>'],
    [102, 'Second, with text that looks like the end of a comment: -->.'],
    [103, ''],
]);

const releaseBefore = [
    '## Fixes',
    '',
    entry('fix: First (#101)', prBodies.get(101) ?? ''),
    entry('fix: Second (#102)', prBodies.get(102) ?? ''),
    entry('fix: Third (#103)', ''),
].join('\n');

const releaseAfter = [
    '## Fixes',
    '',
    entry('fix: First (#101)', 'First.\n&lt;!-- unclosed\n\n'),
    entry('fix: Second (#102)', prBodies.get(102) ?? ''),
    entry('fix: Third (#103)', ''),
].join('\n');

async function run() {
    const failures: string[] = [];

    for (const [name, body, expected] of bodyCases) {
        const actual = cleanPullRequestBody(body);
        if (actual !== expected) {
            failures.push(`${name}:\n  got      ${JSON.stringify(actual)}\n  expected ${JSON.stringify(expected)}`);
        }
    }

    const numbers = pullRequestNumbers(releaseBefore).join(',');
    if (numbers !== '101,102,103') failures.push(`pullRequestNumbers: got ${numbers}, expected 101,102,103`);

    const { body, cleaned } = await cleanReleaseBody(releaseBefore, async (n) => prBodies.get(n) ?? '');
    if (body !== releaseAfter) {
        failures.push(`cleanReleaseBody:\n--- got ---\n${body}\n--- expected ---\n${releaseAfter}`);
    }
    if (cleaned.join(',') !== '101') failures.push(`cleanReleaseBody: cleaned ${cleaned.join(',')}, expected 101`);

    const edited = await cleanReleaseBody(releaseBefore, async (n) =>
        n === 101 ? 'Edited after the draft. <!-- x -->' : '',
    )
        .then(() => 'no error')
        .catch((error: Error) => error.message);
    if (!edited.includes('#101'))
        failures.push(`cleanReleaseBody: expected an error for an edited body, got: ${edited}`);

    if (failures.length) {
        console.error(failures.join('\n'));
        process.exitCode = 1;
        return;
    }
    console.log(`${bodyCases.length} bodies and a release body are cleaned as expected.`);
}

await run();
