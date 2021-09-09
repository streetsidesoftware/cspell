import { CSpellJSONReporterSettings } from "../CSpellJSONReporterSettings";
import { validateSettings } from "./validateSettings";

describe('validateSettings', () => {
    it('passes valid settings', () => {
        const valid: CSpellJSONReporterSettings[] = [
            { outFile: 'foobar' },
            { outFile: 'foobar', verbose: true },
            { outFile: 'foobar', debug: false },
            { outFile: 'foobar', progress: true },
            { outFile: 'foobar', verbose: undefined },
        ];
        valid.forEach((settings) => {
            expect(validateSettings(settings)).toEqual(undefined);
        });
    });

    it('throws for invalid settings', () => {
        const invalid = [
            { },
            { outFile: 1 },
            { outFile: 'foobar', verbose: 123 },
            { outFile: 'foobar', debug: [] },
        ];
        invalid.forEach((settings) => {
            expect(() => validateSettings(settings)).toThrowErrorMatchingSnapshot();
        });
    });
});
