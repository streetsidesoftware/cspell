import { CSpellUserSettings } from '@cspell/cspell-types';
import * as path from 'path';
import { spellCheckFile, SpellCheckFileOptions } from './spellCheckFile';

const samples = path.resolve(__dirname, '../samples');

describe('Validate Spell Check Files', () => {
    interface TestSpellCheckFile {
        filename: string;
        settings: CSpellUserSettings;
        options: SpellCheckFileOptions;
    }

    test.each`
        filename             | settings | options
        ${s('src/sample.c')} | ${{}}    | ${{}}
    `('spellCheckFile $file $settings', async ({ filename, settings, options }: TestSpellCheckFile) => {
        const r = await spellCheckFile(filename, options, settings);
        expect(r).toEqual(
            expect.objectContaining({
                issues: [],
            })
        );
    });
});

function s(file: string) {
    return path.resolve(samples, file);
}
