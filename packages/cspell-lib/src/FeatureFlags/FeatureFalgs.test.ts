import type { FeatureFlag } from './FeatureFlags';
import { FeatureFlags, getSystemFeatureFlags } from './FeatureFlags';

describe('FeatureFlags', () => {
    const flags: FeatureFlag[] = [
        { name: 'test', description: 'Enable Testing' },
        { name: 'perf', description: 'Enable Performance Reporting' },
    ];

    test('reset', () => {
        const ff = new FeatureFlags(flags);
        ff.setFlag('test');
        expect(ff.getFlag('test')).toBe(true);
        expect(ff.getFlags()).toEqual(flags);
        ff.reset();
        expect(ff.getFlag('test')).toBe(undefined);
    });

    test('register', () => {
        const flagWeb = { name: 'web', description: 'Use Web Dictionaries' };
        const ff = new FeatureFlags(flags);
        expect(ff.getFlags()).toEqual(flags);
        ff.register('json', 'Use JSON reporting').register(flagWeb);
        expect(ff.getFlags()).not.toEqual(flags);
        expect(ff.getFlagInfo('json')).toEqual({ name: 'json', description: 'Use JSON reporting' });
        expect(ff.getFlagInfo(flagWeb.name)).toBe(flagWeb);
    });

    test.each`
        flag      | value        | expected
        ${'test'} | ${false}     | ${false}
        ${'test'} | ${undefined} | ${true}
    `('get/set $flag/$value', ({ flag, value, expected }) => {
        const ff = new FeatureFlags(flags);
        ff.setFlag(flag, value);
        expect(ff.getFlag(flag)).toBe(expected);
        expect(ff.getFlagValues()).toEqual(new Map([[flag, expected]]));
    });

    test.each`
        flag       | value
        ${'test1'} | ${false}
        ${'test2'} | ${undefined}
    `('UnknownFeatureFlagError $flag/$value', ({ flag, value }) => {
        const ff = new FeatureFlags(flags);
        expect(() => ff.setFlag(flag, value)).toThrow(`Unknown feature flag: ${flag}`);
    });

    test('getSystemFeatureFlags', () => {
        const ff = getSystemFeatureFlags();
        expect(ff).toBeInstanceOf(FeatureFlags);
        expect(getSystemFeatureFlags()).toBe(ff);
    });
});
