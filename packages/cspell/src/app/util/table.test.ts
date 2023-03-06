import strip from 'strip-ansi';
import { describe, expect, test } from 'vitest';

import type { Table } from './table.js';
import { tableToLines } from './table.js';

describe('Validate table.ts', () => {
    test('tableToLines', () => {
        const table: Table = {
            header: ['id', 'name'],
            rows: [
                ['27438', 'Computer'],
                ['273438', 'Desk'],
                ['46438', 'Monitor'],
            ],
        };
        const x = tableToLines(table);
        expect(x.map(strip)).toEqual([
            'id     | name    ',
            '27438  | Computer',
            '273438 | Desk    ',
            '46438  | Monitor ',
        ]);
    });
});
