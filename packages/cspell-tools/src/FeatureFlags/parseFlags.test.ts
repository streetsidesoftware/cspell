import { parseFlags } from './parseFlags';
import type { FeatureFlag } from './FeatureFlags';
import { createFeatureFlags } from './FeatureFlags';
import { spyOnConsole } from '../test/console';

const { consoleOutput } = spyOnConsole();

describe('parseFlags', () => {
    const features: FeatureFlag[] = [mkFeature('flag1'), mkFeature('compress'), mkFeature('advanced')];

    beforeEach(() => {
        jest.resetAllMocks();
    });

    test.each`
        flags
        ${[]}
        ${['compress', 'advanced:false', '=flag1']}
        ${['compress:level1', 'advanced:yes', 'flag1=no']}
        ${['compress:"yes"']}
    `('parseFlags', ({ flags }) => {
        const ff = createFeatureFlags();
        ff.registerFeatures(features);
        parseFlags(ff, flags);
        expect(ff.getFlagValues()).toMatchSnapshot();
    });

    test('unknown flag', () => {
        const ff = createFeatureFlags();
        ff.registerFeatures(features);
        expect(() => parseFlags(ff, ['mistaken:true'])).toThrow();
        expect(consoleOutput()).toMatchSnapshot();
    });
});

function mkFeature(name: string, description?: string): FeatureFlag {
    return {
        name,
        description: description ?? name + ' desc',
    };
}
