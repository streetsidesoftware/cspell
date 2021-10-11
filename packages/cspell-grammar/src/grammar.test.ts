import { validate } from './grammar';
import { grammar as grammarTs } from './grammars/typescript';

describe('grammar', () => {
    test('validate', () => {
        expect(() => validate(grammarTs)).not.toThrow();
    });
});
