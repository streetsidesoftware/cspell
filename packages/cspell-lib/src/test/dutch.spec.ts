import * as cspell from '../index';
import * as path from 'path';
import * as fsp from 'fs-extra';
import * as util from '../util/util';

const sampleFilename = path.join(__dirname, '..', '..', 'samples', 'Dutch.txt');
const text = fsp.readFileSync(sampleFilename, 'utf8').toString();
const dutchConfig = require.resolve('@cspell/dict-nl-nl/cspell-ext.json');

describe('Validate that Dutch text is correctly checked.', () => {
    jest.setTimeout(10000);

    test('Tests the default configuration', async () => {
        expect(Object.keys(text)).not.toHaveLength(0);
        const ext = path.extname(sampleFilename);
        const languageIds = cspell.getLanguagesForExt(ext);
        const dutchSettings = cspell.readSettings(dutchConfig);
        const settings = cspell.mergeSettings(cspell.getDefaultBundledSettings(), dutchSettings, {
            language: 'en,nl',
        });
        const fileSettings = cspell.combineTextAndLanguageSettings(settings, text, languageIds);
        const results = await cspell.validateText(text, fileSettings);
        /* cspell:ignore ANBI RABO RABONL unported */
        expect(
            results
                .map((a) => a.text)
                .filter(util.uniqueFn())
                .sort()
        ).toEqual(['RABO', 'RABONL', 'unported']);
    });
});
