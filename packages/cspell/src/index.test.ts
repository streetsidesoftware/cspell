import * as application from './index';

describe('Validate index.ts', () => {
    test('it exposes application functions', () => {
        expect(typeof application.checkText).toBe('function');
    });
});
