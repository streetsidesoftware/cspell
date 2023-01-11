import type { Feature, Features } from './features';
import * as features from './features';

describe('features', () => {
    test('exports', () => {
        expect(Object.keys(features)).toEqual([]);
    });

    /**
     * This test is to ensure type, it is not really a unit test
     * It uses the complier to verify the definitions.
     */
    test('assignment', () => {
        const f: Features = {};
        expect(Object.keys(f)).toEqual([]);

        const exp: Features = {
            'weighted-suggestions': true,
        };

        type AllFeatures = {
            [k in keyof Features]: Feature;
        };

        /**
         * All Features must extend FeatureConfig.
         * The following line should compile without errors.
         */
        const all: AllFeatures = exp;
        expect(Object.keys(all)).toEqual(['weighted-suggestions']);
    });
});
