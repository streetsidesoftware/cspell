import { describe, expect, test } from 'vitest';

import { addPathsToGlobalImportsResultToTable, listGlobalImportsResultToTable } from './link.js';

const esc = expect.stringContaining;

describe('Validate link.ts', () => {
    test('listGlobalImportsResultToTable', () => {
        expect(
            listGlobalImportsResultToTable([
                {
                    filename: 'file1',
                    name: 'CSpell Sample Dictionary',
                    id: undefined,
                    error: undefined,
                    dictionaryDefinitions: [
                        {
                            name: 'sample',
                            path: 'sample.txt.gz',
                        },
                    ],
                    languageSettings: undefined,
                    package: {
                        name: 'cspell-dict-sample',
                        filename: 'package.json',
                    },
                },
                {
                    filename: 'file2',
                    name: undefined,
                    id: undefined,
                    error: 'fail',
                    dictionaryDefinitions: undefined,
                    languageSettings: undefined,
                    package: undefined,
                },
            ])
        ).toEqual({
            header: ['id', 'package', 'name', 'filename', 'dictionaries', 'errors'],
            rows: [
                ['', 'cspell-dict-sample', 'CSpell Sample Dictionary', 'file1', 'sample', ''],
                ['', '', '', esc('file2'), '', esc('Failed to read file.')],
            ],
        });
    });

    test('addPathsToGlobalImportsResultToTable', () => {
        expect(
            addPathsToGlobalImportsResultToTable({
                success: true,
                resolvedSettings: [
                    {
                        filename: 'file1',
                        resolvedToFilename: undefined,
                        error: undefined,
                        settings: {},
                    },
                    {
                        filename: 'file2',
                        resolvedToFilename: undefined,
                        error: 'failed',
                        settings: {},
                    },
                ],
                error: undefined,
            })
        ).toEqual({
            header: ['filename', 'errors'],
            rows: [
                ['file1', ''],
                [expect.stringContaining('file2'), expect.stringContaining('Failed to read file.')],
            ],
        });
    });
});
