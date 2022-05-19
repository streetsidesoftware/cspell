import * as index from './index';
import { CSpellConfigFileReaderWriter } from './index';

describe('index', () => {
    test('index', () => {
        expect(index).toBeDefined();
    });
    test.each`
        value                                  | expected
        ${typeof CSpellConfigFileReaderWriter} | ${'function'}
    `('exports', ({ value, expected }) => {
        expect(value).toEqual(expected);
    });
});
