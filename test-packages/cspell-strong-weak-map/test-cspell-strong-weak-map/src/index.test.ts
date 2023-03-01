import { describe, expect, test } from 'vitest';

import { run } from './index.js';

describe('index', () => {
    test('run', () => {
        expect(typeof run).toBe('function');
        expect(run()).toBe(true);
        expect(() => run('no-found')).toThrowError();
    });
});
