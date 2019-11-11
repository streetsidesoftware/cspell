import * as aff from './affReader';
import { testing } from './affReader';
import { expect } from 'chai';
import * as util from 'util';

const showLog = false;

describe('parse an aff file', () => {
    const filename = __dirname + '/../dictionaries/nl.aff';

    it('reads an aff file', () => {
        return aff.parseAffFile(filename)
            .then(result => {
                if (showLog) console.log(util.inspect(result, { showHidden: true, depth: 5, colors: true }));
            },
            error => {
                expect(error, 'Error').to.be.empty;
            });
    });

    it('tests parseAffixRule', () => {
        // cspell:ignore Ăśztetett
        const rule1 = testing.parseAffixRule({ option: 'SFX', value: 'í 0 Ăśztetett/1115 [^aĂĄeĂŠiĂ­oĂłĂśĹuĂşĂźĹą] 20983'});
        expect(rule1).to.not.be.undefined;
        expect(rule1!.type).to.be.equal('SFX');
        expect(rule1!.stripping).to.be.equal('0');
        expect(rule1!.affix).to.be.equal('Ăśztetett/1115');
        expect(rule1!.flag).to.be.equal('í');
        expect(rule1!.replace.source).to.be.equal('$');
        expect(rule1!.condition.source).to.be.equal('[^aĂĄeĂŠiĂ­oĂłĂśĹuĂşĂźĹą]$');

        expect(testing.parseAffixRule({ option: 'SFX', value: ''})).to.be.undefined;
        expect(testing.parseAffixRule({ option: 'SFX', value: 'í'})).to.be.undefined;
        expect(testing.parseAffixRule({ option: 'SFX', value: 'í 0'})).to.be.undefined;

        const rule2 = testing.parseAffixRule({ option: 'SFX', value: 'í 0 Ăśztetett/1115'});
        expect(rule2!.type).to.be.equal('SFX');
        expect(rule2!.stripping).to.be.equal('0');
        expect(rule2!.affix).to.be.equal('Ăśztetett/1115');
        expect(rule2!.flag).to.be.equal('í');
        expect(rule2!.replace.source).to.be.equal('$');
        expect(rule2!.condition.source).to.be.equal('.$');
    });

    it('tests tablePfxOrSfx with bad rule', () => {
        const x = testing.tablePfxOrSfx(undefined, testing.parseLine('SFX í Y 267'));
        const n = x.size;
        const y = testing.tablePfxOrSfx(x, testing.parseLine('SFX í'));
        expect(x.size).to.be.equal(n);
        expect(y).to.be.equal(x);
        const z = testing.tablePfxOrSfx(y, testing.parseLine('SFX í Ăś Ĺz/1109 Ăś 20974'));
        expect(z.size).to.be.equal(1);
    });
});
