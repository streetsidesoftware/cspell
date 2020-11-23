import { tableToLines } from './table';

describe('Validate table.ts', () => {
    test('tableToLines', () => {
        const table = [
            ['id', 'name'],
            ['27438', 'Computer'],
            ['273438', 'Desk'],
            ['46438', 'Monitor'],
        ];
        const x = tableToLines(table);
        expect(x).toEqual(['id     | name    ', '27438  | Computer', '273438 | Desk    ', '46438  | Monitor ']);
    });
});
