import assert from 'assert';
import * as path from 'path';

import * as aff from './affReader';
import { testing } from './affReader';

const dictionaryPath = path.resolve(__dirname, '../dictionaries');

function dictPath(name: string) {
    return path.resolve(dictionaryPath, name);
}

describe('parse an aff file', () => {
    const filename = dictPath('nl.aff');

    it('reads an aff file', async () => {
        await expect(aff.parseAffFile(filename)).resolves.toBeDefined();
    });

    it('tests parseAffixRule', () => {
        // cspell:ignore Ăśztetett
        const rule1 = testing.parseAffixRule({
            option: 'SFX',
            value: 'í 0 Ăśztetett/1115 [^aĂĄeĂŠiĂ­oĂłĂśĹuĂşĂźĹą] 20983',
        });
        expect(rule1).toBeDefined();
        assert(rule1);
        expect(rule1.type).toBe('SFX');
        expect(rule1.stripping).toBe('0');
        expect(rule1.affix).toBe('Ăśztetett/1115');
        expect(rule1.flag).toBe('í');
        expect(rule1.replace.source).toBe('$');
        expect(rule1.condition.source).toBe('[^aĂĄeĂŠiĂ­oĂłĂśĹuĂşĂźĹą]$');

        expect(testing.parseAffixRule({ option: 'SFX', value: '' })).toBeUndefined();
        expect(testing.parseAffixRule({ option: 'SFX', value: 'í' })).toBeUndefined();
        expect(testing.parseAffixRule({ option: 'SFX', value: 'í 0' })).toBeUndefined();

        const rule2 = testing.parseAffixRule({ option: 'SFX', value: 'í 0 Ăśztetett/1115' });
        assert(rule2);
        expect(rule2.type).toBe('SFX');
        expect(rule2.stripping).toBe('0');
        expect(rule2.affix).toBe('Ăśztetett/1115');
        expect(rule2.flag).toBe('í');
        expect(rule2.replace.source).toBe('$');
        expect(rule2.condition.source).toBe('.$');
    });

    it('tests tablePfxOrSfx with bad rule', () => {
        const x = testing.tablePfxOrSfx(undefined, testing.parseLine('SFX í Y 267'));
        const n = x.size;
        const y = testing.tablePfxOrSfx(x, testing.parseLine('SFX í'));
        expect(x.size).toBe(n);
        expect(y).toBe(x);
        const z = testing.tablePfxOrSfx(y, testing.parseLine('SFX í Ăś Ĺz/1109 Ăś 20974'));
        expect(z.size).toBe(1);
    });
});

describe('Validate parsing aff files', () => {
    test.each`
        affFile
        ${'en_US.aff'}
    `('Read aff $affFile', async ({ affFile }) => {
        const affFileName = dictPath(affFile);
        const affInfo = await aff.parseAffFile(affFileName);
        expect(affInfo).toMatchSnapshot();
    });
});
