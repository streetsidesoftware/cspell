import { describe, expect, test } from 'vitest';

import type { ErrorReport, FileReport } from './buildJUnitXml.js';
import { buildJUnitXml } from './buildJUnitXml.js';

describe('buildJUnitXml', () => {
    test('produces a valid empty-ish suite when there are no files', () => {
        const xml = buildJUnitXml([], [], { suiteName: 'cspell' });
        expect(xml).toBe(
            '<?xml version="1.0" encoding="UTF-8"?>\n' +
                '<testsuites name="cspell" tests="0" failures="0" errors="0" time="0.000">\n' +
                '</testsuites>\n',
        );
    });

    test('reports a clean file as a single passing testcase', () => {
        const files: FileReport[] = [{ filename: 'clean.txt', issues: [], elapsedTimeMs: 12.5, processed: true }];
        const xml = buildJUnitXml(files, [], { suiteName: 'cspell' });
        expect(xml).toBe(
            '<?xml version="1.0" encoding="UTF-8"?>\n' +
                '<testsuites name="cspell" tests="1" failures="0" errors="0" time="0.013">\n' +
                '  <testsuite name="clean.txt" tests="1" failures="0" errors="0" time="0.013">\n' +
                '    <testcase name="no issues found" classname="clean.txt"/>\n' +
                '  </testsuite>\n' +
                '</testsuites>\n',
        );
    });

    test('reports one file with one spelling issue as a failing testcase', () => {
        const files: FileReport[] = [
            {
                filename: 'text.txt',
                elapsedTimeMs: 349.058747,
                processed: true,
                issues: [
                    {
                        text: 'errrorrrs',
                        offset: 22,
                        line: { text: 'This text is full of errrorrrs.', offset: 0 },
                        row: 1,
                        col: 23,
                        uri: 'text.txt',
                    },
                ],
            },
        ];
        const xml = buildJUnitXml(files, [], { suiteName: 'cspell' });
        expect(xml).toBe(
            '<?xml version="1.0" encoding="UTF-8"?>\n' +
                '<testsuites name="cspell" tests="1" failures="1" errors="0" time="0.349">\n' +
                '  <testsuite name="text.txt" tests="1" failures="1" errors="0" time="0.349">\n' +
                '    <testcase name="errrorrrs (1:23)" classname="text.txt">\n' +
                '      <failure type="spelling" message="Unknown word: &quot;errrorrrs&quot;">Unknown word: "errrorrrs"</failure>\n' +
                '    </testcase>\n' +
                '  </testsuite>\n' +
                '</testsuites>\n',
        );
    });

    test('uses the issue message when one is provided', () => {
        const files: FileReport[] = [
            {
                filename: 'text.txt',
                issues: [
                    {
                        text: 'zzz',
                        offset: 0,
                        line: { text: 'zzz', offset: 0 },
                        row: 1,
                        col: 1,
                        uri: 'text.txt',
                        message: 'prohibited word',
                    },
                ],
            },
        ];
        const xml = buildJUnitXml(files, [], { suiteName: 'cspell' });
        expect(xml).toContain('<failure type="spelling" message="prohibited word">prohibited word</failure>');
    });

    test('escapes special characters in file paths, words, and messages', () => {
        const files: FileReport[] = [
            {
                filename: 'src/<weird>&"path".ts',
                issues: [
                    {
                        text: `wo&rd<>"'`,
                        offset: 0,
                        line: { text: `wo&rd<>"'`, offset: 0 },
                        row: 3,
                        col: 5,
                        uri: 'src/<weird>&"path".ts',
                        message: `bad & <word> "here" 'quoted'`,
                    },
                ],
            },
        ];
        const xml = buildJUnitXml(files, [], { suiteName: 'cspell' });

        // cspell:dictionaries html-symbol-entities
        // The testsuite/testcase attributes must be attribute-escaped.
        expect(xml).toContain('<testsuite name="src/&lt;weird&gt;&amp;&quot;path&quot;.ts"');
        expect(xml).toContain('classname="src/&lt;weird&gt;&amp;&quot;path&quot;.ts"');
        expect(xml).toContain('name="wo&amp;rd&lt;&gt;&quot;&apos; (3:5)"');
        expect(xml).toContain(
            '<failure type="spelling" message="bad &amp; &lt;word&gt; &quot;here&quot; &apos;quoted&apos;">' +
                'bad &amp; &lt;word&gt; "here" \'quoted\'</failure>',
        );
        // No raw, unescaped angle brackets should appear inside attribute values.
        expect(xml).not.toMatch(/name="[^"]*<[^"]*"/);
    });

    test('reports a skipped file without failing it', () => {
        const files: FileReport[] = [
            { filename: 'binary.png', issues: [], processed: false, skippedReason: 'is binary file' },
        ];
        const xml = buildJUnitXml(files, [], { suiteName: 'cspell' });
        expect(xml).toContain('<testsuite name="binary.png" tests="1" failures="0" errors="0"');
        expect(xml).toContain('<skipped message="is binary file"/>');
    });

    test('ignores collected issues when counting a skipped file', () => {
        const files: FileReport[] = [
            {
                filename: 'skipped.txt',
                processed: false,
                skippedReason: 'excluded',
                issues: [
                    {
                        text: 'errrorrrs', // cspell:ignore errrorrrs
                        offset: 0,
                        line: { text: 'errrorrrs', offset: 0 },
                        row: 1,
                        col: 1,
                        uri: 'skipped.txt',
                    },
                ],
            },
        ];
        const xml = buildJUnitXml(files, [], { suiteName: 'cspell' });

        expect(xml).toContain('<testsuites name="cspell" tests="1" failures="0" errors="0"');
        expect(xml).toContain('<testsuite name="skipped.txt" tests="1" failures="0" errors="0"');
        expect(xml).toContain('<skipped message="excluded"/>');
        expect(xml).not.toContain('<failure');
    });

    test('reports non-issue processing errors in a dedicated error testsuite', () => {
        const errors: ErrorReport[] = [{ message: 'failed to read config', error: new Error('ENOENT: not found') }];
        const xml = buildJUnitXml([], errors, { suiteName: 'cspell' });
        expect(xml).toContain('<testsuites name="cspell" tests="1" failures="0" errors="1"');
        expect(xml).toContain('<testsuite name="cspell-errors" tests="1" failures="0" errors="1"');
        expect(xml).toContain('<error type="error" message="ENOENT: not found">ENOENT: not found</error>');
    });
});
