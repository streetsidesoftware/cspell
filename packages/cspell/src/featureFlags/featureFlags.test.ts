import { getFeatureFlags, parseFeatureFlags } from './featureFlags';

describe('featureFlags', () => {
    test('Unknown flag', () => {
        const warn = jest.spyOn(console, 'warn').mockImplementation();
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
