import { xregexp } from '.';

describe('Validate Bundled Libraries', () => {
    test('xregexp', () => {
        // expect(typeof xregexp).toBe('function');

        const x = xregexp('t$');
        expect(x.test('first')).toBe(true);
        expect(x.test('second')).toBe(false);
    });
});
