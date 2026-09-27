import { describe, expect, test } from 'vitest';

import { cleanPullRequestBody, cleanReleaseBody, pullRequestNumbers } from './clean-release-body.mts';

const fence = '```';

describe('cleanPullRequestBody', () => {
    test.each`
        name                                                 | body                                                                                                                                | expected
        ${'keeps a plain body'}                              | ${'Fixes the cache.\n\n- one\n- two'}                                                                                               | ${'Fixes the cache.\n\n- one\n- two'}
        ${'removes a comment'}                               | ${'Before <!-- hidden --> after.'}                                                                                                  | ${'Before  after.'}
        ${'removes a multi-line comment'}                    | ${'Before\n<!--\nhidden\nlines\n-->\nAfter'}                                                                                        | ${'Before\n\nAfter'}
        ${'makes an unclosed comment visible'}               | ${'Before\n<!-- never closed\nAfter'}                                                                                               | ${'Before\n&lt;!-- never closed\nAfter'}
        ${'keeps a comment in inline code'}                  | ${'Use `<!-- cspell:ignore -->` to ignore.'}                                                                                        | ${'Use `<!-- cspell:ignore -->` to ignore.'}
        ${'keeps a comment in a code block'}                 | ${`Example:\n\n${fence}md\n<!-- cspell:ignore word -->\n${fence}\n`}                                                                | ${`Example:\n\n${fence}md\n<!-- cspell:ignore word -->\n${fence}\n`}
        ${'removes a maintainer block in the middle'}        | ${'User text.\n\n<details>\n<summary>For maintainers</summary>\n\n- why\n\n</details>\n\nMore user text.'}                          | ${'User text.\n\n\n\nMore user text.'}
        ${'matches the summary in any case and spacing'}     | ${'Text.\n<details><summary> for MAINTAINERS </summary>\n\n- why\n</details>'}                                                      | ${'Text.\n'}
        ${'removes blocks nested in a maintainer block'}     | ${'A\n<details>\n<summary>For maintainers</summary>\n\n<details>\n<summary>Log</summary>\n\nx\n</details>\n\n- why\n</details>\nB'} | ${'A\n\nB'}
        ${'keeps other details blocks'}                      | ${'<details>\n<summary>Usage</summary>\n\nRun it.\n</details>'}                                                                     | ${'<details>\n<summary>Usage</summary>\n\nRun it.\n</details>'}
        ${'keeps a maintainer block shown in a code block'}  | ${`${fence}md\n<details>\n<summary>For maintainers</summary>\n</details>\n${fence}`}                                                | ${`${fence}md\n<details>\n<summary>For maintainers</summary>\n</details>\n${fence}`}
        ${'removes an unclosed maintainer block to the end'} | ${'Text.\n<details>\n<summary>For maintainers</summary>\n\n- why'}                                                                  | ${'Text.\n'}
        ${'keeps CRLF line endings'}                         | ${'Line one\r\n<!-- x -->\r\nLine two'}                                                                                             | ${'Line one\r\n\r\nLine two'}
    `('$name', ({ body, expected }) => {
        expect(cleanPullRequestBody(body)).toBe(expected);
    });
});

describe('cleanReleaseBody', () => {
    function entry(title: string, body: string): string {
        return `<details>\n<summary>${title}</summary>\n\n### ${title}\n${body}\n\n---\n\n</details>\n`;
    }

    const first = 'First.\n<!-- unclosed\n\n<details>\n<summary>For maintainers</summary>\n\n- why\n</details>';
    const second = 'Second, with text that looks like the end of a comment: -->.';
    const bodies = new Map([
        [101, first],
        [102, second],
        [103, ''],
    ]);
    const release = [
        '## Fixes',
        '',
        entry('fix: First (#101)', first),
        entry('fix: Second (#102)', second),
        entry('fix: Third (#103)', ''),
    ].join('\n');

    test('finds the PR numbers', () => {
        expect(pullRequestNumbers(release)).toEqual([101, 102, 103]);
    });

    test('cleans each PR body on its own, leaving the others intact', async () => {
        const result = await cleanReleaseBody(release, async (n) => bodies.get(n) ?? '');
        expect(result.cleaned).toEqual([101]);
        expect(result.body).toBe(
            [
                '## Fixes',
                '',
                entry('fix: First (#101)', 'First.\n&lt;!-- unclosed\n\n'),
                entry('fix: Second (#102)', second),
                entry('fix: Third (#103)', ''),
            ].join('\n'),
        );
    });

    test('fails when a body that needs cleaning is not in the release notes', async () => {
        const getBody = async (n: number) => (n === 101 ? 'Edited after the draft. <!-- x -->' : '');
        await expect(cleanReleaseBody(release, getBody)).rejects.toThrow('#101');
    });
});
