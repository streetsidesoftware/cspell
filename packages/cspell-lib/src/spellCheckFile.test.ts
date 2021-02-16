import { CSpellUserSettings } from '@cspell/cspell-types';
import * as path from 'path';
import { ImportError } from './Settings/ImportError';
import { spellCheckFile, SpellCheckFileOptions, SpellCheckFileResult } from './spellCheckFile';

const samples = path.resolve(__dirname, '../samples');

describe('Validate Spell Check Files', () => {
    interface TestSpellCheckFile {
        filename: string;
        settings: CSpellUserSettings;
        options: SpellCheckFileOptions;
        expected: Partial<SpellCheckFileResult>;
    }

    function oc<T>(t: T): T {
        return expect.objectContaining(t);
    }

    function err(msg: string): Error {
        return new ImportError(msg);
    }

    function eFailed(file: string): Error {
        return err(`Failed to find config file at: "${s(file)}"`);
    }

    function errNoEnt(file: string): Error {
        const message = `ENOENT: no such file or directory, open '${file}'`;
        return expect.objectContaining(new Error(message));
    }

    test.each`
        filename             | settings                    | options                                       | expected
        ${'src/not_found.c'} | ${{}}                       | ${{}}                                         | ${{ checked: false, errors: [errNoEnt('src/not_found.c')] }}
        ${'src/sample.c'}    | ${{}}                       | ${{}}                                         | ${{ checked: true, issues: [], localConfigFilepath: s('.cspell.json'), errors: undefined }}
        ${'src/sample.c'}    | ${{}}                       | ${{ noConfigSearch: true }}                   | ${{ checked: true, localConfigFilepath: undefined, errors: undefined }}
        ${'src/sample.c'}    | ${{ noConfigSearch: true }} | ${{}}                                         | ${{ checked: true, localConfigFilepath: undefined, errors: undefined }}
        ${'src/sample.c'}    | ${{}}                       | ${{ configFile: s('../cspell.config.json') }} | ${{ checked: true, localConfigFilepath: s('../cspell.config.json'), errors: undefined }}
        ${'src/sample.c'}    | ${{ noConfigSearch: true }} | ${{ configFile: s('../cspell.config.json') }} | ${{ checked: true, localConfigFilepath: s('../cspell.config.json'), errors: undefined }}
        ${'src/sample.c'}    | ${{ noConfigSearch: true }} | ${{ noConfigSearch: false }}                  | ${{ checked: true, localConfigFilepath: s('.cspell.json'), errors: undefined }}
        ${'src/sample.c'}    | ${{}}                       | ${{}}                                         | ${{ document: oc({ uri: oc({ fsPath: s('src/sample.c') }) }), errors: undefined }}
        ${'src/sample.c'}    | ${{}}                       | ${{ configFile: s('../cSpell.json') }}        | ${{ checked: false, localConfigFilepath: s('../cSpell.json'), errors: [eFailed(s('../cSpell.json'))] }}
        ${'src/not_found.c'} | ${{}}                       | ${{}}                                         | ${{ checked: false, errors: [errNoEnt('src/not_found.c')] }}
        ${__filename}        | ${{}}                       | ${{}}                                         | ${{ checked: true, localConfigFilepath: s('../cspell.config.json'), errors: undefined }}
    `(
        'spellCheckFile $filename $settings $options',
        async ({ filename, settings, options, expected }: TestSpellCheckFile) => {
            const r = await spellCheckFile(s(filename), options, settings);
            expect(r).toEqual(expect.objectContaining(expected));
        }
    );
});

function s(file: string) {
    return path.resolve(samples, file);
}
