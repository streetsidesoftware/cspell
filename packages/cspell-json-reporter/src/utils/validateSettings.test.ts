import { validateSettings } from './validateSettings';

describe('validateSettings', () => {
    test.each`
        settings
        ${{ outFile: 'foobar' }}
        ${{ outFile: 'foobar', verbose: true }}
        ${{ outFile: 'foobar', debug: false }}
        ${{ outFile: 'foobar', progress: true }}
        ${{ outFile: 'foobar', verbose: undefined }}
    `('passes valid settings', ({ settings }) => {
        expect(() => validateSettings(settings)).not.toThrow();
    });

    test.each`
        settings
        ${[]}
        ${false}
        ${true}
        ${'hello'}
        ${{ outFile: {} }}
        ${{ outFile: 1 }}
        ${{ outFile: 'foobar', verbose: 123 }}
        ${{ outFile: 'foobar', debug: [] }}
    `('throws for invalid settings $settings', ({ settings }) => {
        expect(() => validateSettings(settings)).toThrowErrorMatchingSnapshot();
    });
});
