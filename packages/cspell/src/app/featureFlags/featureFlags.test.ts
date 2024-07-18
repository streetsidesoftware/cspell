import { describe, expect, test, vi } from 'vitest';

import { console } from '../console.js';
import { getFeatureFlags, parseFeatureFlags } from './featureFlags.js';

describe('featureFlags', () => {
    test('Unknown flag', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        parseFeatureFlags(['unknown-flag']);
        expect(warn).toHaveBeenCalledWith('Unknown flag: "unknown-flag"');
    });

    test.each`
        flag      | value           | expected
        ${'test'} | ${'test'}       | ${true}
        ${'test'} | ${'test:value'} | ${'value'}
    `('set flags $value', ({ flag, value, expected }) => {
        const ff = getFeatureFlags();
        ff.register(flag, flag);
        parseFeatureFlags([value]);
        expect(ff.getFlag(flag)).toBe(expected);
    });
});
