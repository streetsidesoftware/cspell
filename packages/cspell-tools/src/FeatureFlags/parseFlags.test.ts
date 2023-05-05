import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { spyOnConsole } from '../test/console.js';
import type { FeatureFlag } from './FeatureFlags.js';
import { createFeatureFlags } from './FeatureFlags.js';
import { parseFlags } from './parseFlags.js';

const consoleSpy = spyOnConsole();

describe('parseFlags', () => {
    const features: FeatureFlag[] = [mkFeature('flag1'), mkFeature('compress'), mkFeature('advanced')];

    beforeEach(() => {
        consoleSpy.attach();
    });

    afterEach(() => {
        vi.resetAllMocks();
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
        expect(consoleSpy.consoleOutput()).toMatchSnapshot();
    });
});

function mkFeature(name: string, description?: string): FeatureFlag {
    return {
        name,
        description: description ?? name + ' desc',
    };
}
