import * as Aff from './aff';
import * as AffReader from './affReader';
import { IterableHunspellReader } from './IterableHunspellReader';

describe('HunspellReader DE', function () {
    it('tests transforming `Arbeit/A-`', () => {
        const affInfo = AffReader.parseAff(deAff());
        const aff = new Aff.Aff(affInfo);
        const reader = new IterableHunspellReader({ aff, dic: ['Arbeit/A-'] });
        const words = [...reader.seqWords()];
        expect(words).toEqual(['-Arbeit', '-Arbeits', 'Arbeit', 'Arbeits', 'arbeit', 'arbeits']);
    });

    it('tests transforming some entries', () => {
        const affInfo = AffReader.parseAff(deAff());
        const aff = new Aff.Aff(affInfo);
        const reader = new IterableHunspellReader({ aff, dic: deDic() });
        const words = [...reader];
        expect(words).toEqual(['-Arbeit', 'Arbeit', '-Computer', '-Computern', 'Computer', 'Computern', '-']);
    });

    it('tests transforming a small dictionary', () => {
        const affInfo = AffReader.parseAff(deAff());
        const aff = new Aff.Aff(affInfo);
        const reader = new IterableHunspellReader({ aff, dic: deDic() });
        const words = [...reader.seqAffWords()].map((w) => Aff.debug.signature(w));
        // cspell:ignore CEO BCO BCMO CMO CEMO
        expect(words).toEqual([
            '-Arbeit|C',
            '-Arbeit|CEO',
            '-Arbeits|BCO',
            '-Arbeits|CMO',
            'Arbeit|',
            'Arbeit|EO',
            'Arbeits|BCO',
            'Arbeits|CMO',
            'arbeit|CEO',
            'arbeits|CMO',
            '-Computer|BCO',
            '-Computer|C',
            '-Computer|CEMO',
            '-Computern|CE',
            'Computer|',
            'Computer|BCO',
            'Computer|CEMO',
            'Computern|E',
            '-|E',
            'Arbeitsnehmer|F',
        ]);
    });
});

// cspell:ignore Arbeit Arbeitsnehmer Computern

function deDic() {
    const dic = `
    4
    Arbeit/A-
    Computer/BC-
    -/W
    Arbeitsnehmer/Z
    `;
    return dic
        .split('\n')
        .map((a) => a.trim())
        .filter((a) => !!a)
        .slice(1);
}

function deAff() {
    // cspell:ignore COMPOUNDBEGIN COMPOUNDMIDDLE COMPOUNDEND COMPOUNDMIN WORDCHARS FORBIDDENWORD
    // cspell:ignore fogemorpheme fogemorphemes fuge arbeits circumfix decapitalizing
    // cspell:ignore VPDX VWXDP
    return `
# German compounding

# set language to handle special casing of German sharp s

LANG de_DE

# compound flags

COMPOUNDBEGIN U
COMPOUNDMIDDLE V
COMPOUNDEND W

# Prefixes are allowed at the beginning of compounds,
# suffixes are allowed at the end of compounds by default:
# (prefix)?(root)+(affix)?
# Affixes with COMPOUNDPERMITFLAG may be inside of compounds.
COMPOUNDPERMITFLAG P

# for German fogemorphemes (Fuge-element)
# Hint: ONLYINCOMPOUND is not required everywhere, but the
# checking will be a little faster with it.

ONLYINCOMPOUND X

# forbid uppercase characters at compound word bounds
CHECKCOMPOUNDCASE

# for handling Fuge-elements with dashes (Arbeits-)
# dash will be a special word

COMPOUNDMIN 1
WORDCHARS -

# compound settings and fogemorpheme for 'Arbeit'

SFX A Y 3
SFX A 0 s/UPX .
SFX A 0 s/VPDX .
SFX A 0 0/WXD .

SFX B Y 2
SFX B 0 0/UPX .
SFX B 0 0/VWXDP .

# a suffix for 'Computer'

SFX C Y 1
SFX C 0 n/WD .

# for forbid exceptions (*Arbeitsnehmer)

FORBIDDENWORD Z

# dash prefix for compounds with dash (Arbeits-Computer)

PFX - Y 1
PFX - 0 -/P .

# decapitalizing prefix
# circumfix for positioning in compounds

PFX D Y 4
PFX D A a/PX A
PFX D Ã„ Ã¤/PX Ã„
PFX D Y y/PX Y
PFX D Z z/PX Z
`;
}
