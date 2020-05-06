import { expect } from 'chai';
import * as Dictionaries from './Dictionaries';
import { getDefaultSettings } from '../Settings';
import * as path from 'path';
import * as fs from 'fs-extra';

// cspell:ignore café rhône

describe('Validate getDictionary', () => {
    test('tests that userWords are included in the dictionary', () => {
        const settings = {
            ...getDefaultSettings(),
            words: ['one', 'two', 'three', 'café'],
            userWords: ['four', 'five', 'six', 'Rhône'],
        };

        return Dictionaries.getDictionary(settings).then(dict => {
            settings.words.forEach(word => {
                expect(dict.has(word)).to.be.true;
            });
            settings.userWords.forEach(word => {
                expect(dict.has(word)).to.be.true;
            });
            expect(dict.has('zero',     { ignoreCase: false })).to.be.false;
            expect(dict.has('Rhône',    { ignoreCase: false })).to.be.true;
            expect(dict.has('RHÔNE',    { ignoreCase: false })).to.be.true;
            expect(dict.has('Café',     { ignoreCase: false })).to.be.true;
            expect(dict.has('rhône',    { ignoreCase: false })).to.be.true;
            expect(dict.has('rhone',    { ignoreCase: false })).to.be.true;
            expect(dict.has('cafe',     { ignoreCase: false })).to.be.true;
            });
    });

    test('Case sensitive', async () => {
        const settings = {
            ...getDefaultSettings(),
            words: ['one', 'two', 'three', 'café'],
            userWords: ['four', 'five', 'six', 'Rhône'],
            caseSensitive: true,
        };

        const dict = await Dictionaries.getDictionary(settings);
        settings.words.forEach(word => {
            expect(dict.has(word)).to.be.true;
        });
        settings.userWords.forEach(word => {
            expect(dict.has(word)).to.be.true;
        });
        const opts = { ignoreCase: false };
        expect(dict.has('zero')).to.be.false;
        expect(dict.has('Rhône', opts)).to.be.true;
        expect(dict.has('RHÔNE', opts)).to.be.true;
        expect(dict.has('Café', opts)).to.be.true;
        expect(dict.has('rhône', opts)).to.be.false;
        expect(dict.has('rhone', opts)).to.be.false;
        expect(dict.has('café', opts)).to.be.true;
        expect(dict.has('rhône', opts)).to.be.false;
        expect(dict.has('rhone', opts)).to.be.false;
        expect(dict.has('cafe', opts)).to.be.false;
        expect(dict.has('café', { ignoreCase: true })).to.be.true;
        expect(dict.has('rhône', { ignoreCase: true })).to.be.true;
        expect(dict.has('rhone', { ignoreCase: true })).to.be.true;
        expect(dict.has('cafe', { ignoreCase: true })).to.be.true;
    });

    test('Refresh Dictionary Cache', async () => {
        const tempDictPath = path.join(__dirname, '..', '..', 'temp', 'words.txt');
        await fs.mkdirp(path.dirname(tempDictPath));
        await fs.writeFile(tempDictPath, "one\ntwo\nthree\n");

        const settings = getDefaultSettings();
        const defs = (settings.dictionaryDefinitions || []).concat([
            {
                name: 'temp',
                path: tempDictPath
            },
            {
                name: 'not_found',
                path: tempDictPath
            }
        ]);
        const toLoad = ['node', 'html', 'css', 'not_found', 'temp', ];
        const dicts = await Promise.all(Dictionaries.loadDictionaries(toLoad, defs));

        expect(dicts[3].has('one')).to.be.true;
        expect(dicts[3].has('four')).to.be.false;

        await Dictionaries.refreshDictionaryCache(0);
        const dicts2 = await Promise.all(Dictionaries.loadDictionaries(toLoad, defs));

        // Since noting changed, expect them to be the same.
        expect(dicts.length).to.eq(toLoad.length);
        expect(dicts2.length).to.be.eq(dicts.length);
        dicts.forEach((d, i) => expect(dicts2[i]).to.be.equal(d));

        // Update one of the dictionaries to see if it loads.
        await fs.writeFile(tempDictPath, "one\ntwo\nthree\nfour\n");

        const dicts3 = await Promise.all(Dictionaries.loadDictionaries(toLoad, defs));
        // Should be using cache and will not contain the new words.
        expect(dicts3[3].has('one')).to.be.true;
        expect(dicts3[3].has('four')).to.be.false;

        await Dictionaries.refreshDictionaryCache(0);

        const dicts4 = await Promise.all(Dictionaries.loadDictionaries(toLoad, defs));
        // Should be using the latest copy of the words.
        expect(dicts4[3].has('one')).to.be.true;
        expect(dicts4[3].has('four')).to.be.true;
    });
});
