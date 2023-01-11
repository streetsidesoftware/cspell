import * as index from './index';

// Make sure the types are exported.
import type { CSpellApplicationOptions } from './index';
import { InMemoryReporter } from './util/InMemoryReporter';

describe('Validate index.ts', () => {
    test('index', () => {
        expect(index).toBeDefined();
    });

    test('quick run', async () => {
        const appOptions: CSpellApplicationOptions = {};
        const reporter = new InMemoryReporter();

        const result = await index.lint(['*.md'], appOptions, reporter);

        expect(result).toEqual(
            expect.objectContaining({
                errors: 0,
                issues: 0,
            })
        );
    });
});
