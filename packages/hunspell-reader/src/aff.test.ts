import {expect} from 'chai';
import {AffWord} from './aff';
import {affWordToColoredString} from './aff';
import {parseAffFileToAff} from './affReader';
import * as AffReader from './affReader';
import {from} from 'rxjs';

const isLoggerOn = false;

describe('Basic Aff Validation', () => {
    const pAff = AffReader.parseAff(getSimpleAffAsStream());
    it('Reads Simple Aff', async () => {
        const aff = await pAff;
        expect(aff.SET).to.be.equal('UTF-8');
        expect(aff.PFX).to.be.instanceof(Map);
        expect(aff.SFX).to.be.instanceof(Map);
    });
    it('Checks the PFX values', async () => {
        const aff = await pAff;
        expect(aff.PFX).to.be.instanceof(Map);
        expect(aff.PFX!.has('X')).to.be.true;
        const fx = aff.PFX!.get('X');
        expect(fx).to.not.be.empty;
    });
    it('Checks the SFX values', async () => {
        const aff = await pAff;
        expect(aff.SFX).to.be.instanceof(Map);
        expect(aff.SFX!.has('J')).to.be.true;
        const fxJ = aff.SFX!.get('J');
        expect(fxJ).to.not.be.empty;
    });
});

describe('Test Aff', () => {
    const nlAff = __dirname + '/../dictionaries/nl.aff';
    const enAff = __dirname + '/../dictionaries/en_US.aff';
    const esAff = __dirname + '/../dictionaries/es_ANY.aff';
    const frAff = __dirname + '/../dictionaries/fr-moderne.aff';

    it('tests applying rules for fr', async () => {
        const aff = await parseAffFileToAff(frAff);
        const r =  aff.applyRulesToDicEntry('badger/10');
        const w = r.map(affWord => affWord.word);
        expect(w).to.contain('badger');
        expect(w).to.contain('badgeant');
        logApplyRulesResults(r);
    });

    it('tests applying rules for fr', async () => {
        const aff = await parseAffFileToAff(frAff);
        const r =  aff.applyRulesToDicEntry('avoir/180');
        const w = r.map(affWord => affWord.word);
        expect(w).to.contain('avoir');
        expect(w).to.contain('n’avoir'); // cspell:ignore n’avoir
        logApplyRulesResults(r);
    });

    it('test breaking up rules for nl', async () => {
        const aff = await parseAffFileToAff(nlAff);
        expect(aff.separateRules('ZbCcChC1')).to.be.deep.equal(['Zb', 'Cc', 'Ch', 'C1']);
        expect(aff.separateRules('ZbCcChC199')).to.be.deep.equal(['Zb', 'Cc', 'Ch', 'C1', '99']);
    });


    it('test breaking up rules for en', async () => {
        const aff = await parseAffFileToAff(enAff);
        expect(aff.separateRules('ZbCcChC1')).to.not.be.deep.equal(['Zb', 'Cc', 'Ch', 'C1']);
        expect(aff.separateRules('ZbCcChC1')).to.be.deep.equal('ZbCcChC1'.split(''));
    });

    it('test getting rules for nl', async () => {
        const aff = await parseAffFileToAff(nlAff);
        // console.log(aff.getMatchingRules('ZbCcChC1'));
        expect(aff.getMatchingRules('ZbCcChC1').filter(a => !!a).map(({id}) => id))
            .to.be.deep.equal(['Zb', 'Cc', 'Ch']);
        expect(aff.getMatchingRules('ZbCcChC199').filter(a => !!a).map(({id}) => id))
            .to.be.deep.equal(['Zb', 'Cc', 'Ch']);
        expect(aff.getMatchingRules('AaAbAcAdAeAi').filter(a => !!a).map(({id}) => id))
            .to.be.deep.equal(['Aa', 'Ab', 'Ac', 'Ad', 'Ae', 'Ai']);
        expect(aff.getMatchingRules('AaAbAcAdAeAi').filter(a => !!a).map(({type}) => type))
            .to.be.deep.equal(['sfx', 'sfx', 'sfx', 'sfx', 'sfx', 'sfx']);
        expect(aff.getMatchingRules('PaPbPc').filter(a => !!a).map(({type}) => type))
            .to.be.deep.equal(['pfx', 'pfx', 'pfx', ]);
    });

    it('tests applying rules for nl', async () => {
        const aff = await parseAffFileToAff(nlAff);
        const lines = [
            'dc/ClCwKc',
            'aak/Zf',
            'huis/CACcYbCQZhC0',
            'pannenkoek/ZbCACcC0',
        ];
        lines.forEach(line => {
            const r = aff.applyRulesToDicEntry(line);
            logApplyRulesResults(r);
        });
    });

    it('tests applying rules for es', async () => {
        const aff = await parseAffFileToAff(esAff);
        const lines = [
            'ababillar/RED',
        ];
        lines.forEach(line => {
            const r = aff.applyRulesToDicEntry(line);
            logApplyRulesResults(r);
        });
    });

    it('tests applying rules for en', async () => {
        const aff = await parseAffFileToAff(enAff);
        const r =  aff.applyRulesToDicEntry('motivate/CDSG');
        const w = r.map(affWord => affWord.word);
        expect(w.sort()).to.be.deep.equal([
            'demotivate', 'demotivated', 'demotivates', 'demotivating',
            'motivate', 'motivated', 'motivates', 'motivating'
        ]);
    });

});

function logApplyRulesResults(affWords: AffWord[]) {
    affWords.forEach(logApplyRulesResult);
}

function logApplyRulesResult(affWord: AffWord) {
    if (isLoggerOn) console.log(affWordToColoredString(affWord));
}

function getSimpleAff() {
    return  `
    SET UTF-8
    TRY esianrtolcdugmphbyfvkwzESIANRTOLCDUGMPHBYFVKWZ'
    ICONV 1
    ICONV ’ '
    NOSUGGEST !

    # ordinal numbers
    COMPOUNDMIN 1
    # only in compounds: 1th, 2th, 3th
    ONLYINCOMPOUND c
    # compound rules:
    # 1. [0-9]*1[0-9]th (10th, 11th, 12th, 56714th, etc.)
    # 2. [0-9]*[02-9](1st|2nd|3rd|[4-9]th) (21st, 22nd, 123rd, 1234th, etc.)
    COMPOUNDRULE 2
    COMPOUNDRULE n*1t
    COMPOUNDRULE n*mp
    WORDCHARS 0123456789

    PFX A Y 1
    PFX A   0     re         .

    PFX I Y 1
    PFX I   0     in         .

    PFX U Y 1
    PFX U   0     un         .

    PFX X Y 1
    PFX X   0     un         .
    PFX X   0     re         .
    PFX X   0     in         .
    PFX X   0     a          .

    SFX Y Y 2
    SFX Y   0     ly         [^y]
    SFX Y   y     ily        [y]

    SFX G Y 2
    SFX G   e     ing        e
    SFX G   0     ing        [^e]

    SFX J Y 2
    SFX J   e     ings       e
    SFX J   0     ings       [^e]
    `;
}

function getSimpleAffAsStream() {
    return from(getSimpleAff().split('\n').map(a => a.trim()));
}


// cspell:ignore moderne avoir huis pannenkoek ababillar CDSG ings
// cspell:enableCompoundWords