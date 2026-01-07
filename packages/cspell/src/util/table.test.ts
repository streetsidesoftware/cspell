import { stripVTControlCharacters } from 'node:util';

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
                ['3', 'Mouse'],
            ],
            columnAlignments: ['R', 'L'],
        };
        const x = tableToLines(table);
        expect(x.map(stripVTControlCharacters)).toEqual([
            '    id | name    ',
            ' 27438 | Computer',
            '273438 | Desk    ',
            ' 46438 | Monitor ',
            '     3 | Mouse   ',
        ]);
    });

    test('tableToLines fields', () => {
        const table: Table = {
            header: [
                ['name', 'Name'],
                ['id', 'Id'],
            ],
            rows: [
                { id: '27438', name: 'Computer' },
                { id: '273438', name: 'Desk' },
                { id: '46438', name: 'Monitor' },
                ['Laptop', '123456'],
            ],
        };
        const x = tableToLines(table);
        expect(x.map(stripVTControlCharacters)).toEqual([
            'Name     | Id    ',
            'Computer | 27438 ',
            'Desk     | 273438',
            'Monitor  | 46438 ',
            'Laptop   | 123456',
        ]);
    });

    test('tableToLines max widths', () => {
        const table: Table = {
            header: [
                ['name', 'Name'],
                ['id', 'Id'],
            ],
            rows: [
                { id: '27438', name: 'Computer' },
                { id: '273438', name: 'Desk' },
                { id: '46438', name: 'Monitor' },
                ['Laptop', '123456'],
            ],
            maxColumnWidths: {
                name: 6,
                id: 6,
            },
        };
        const x = tableToLines(table);
        expect(x.map(stripVTControlCharacters)).toEqual([
            'Name   | Id    ',
            'Compu… | 27438 ', // cspell:disable-line
            'Desk   | 273438',
            'Monit… | 46438 ',
            'Laptop | 123456',
        ]);
    });
});
