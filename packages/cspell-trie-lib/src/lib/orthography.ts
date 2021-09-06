const intl = new Intl.Collator('en', { sensitivity: 'base' });

export const compare = intl.compare;

/**
 * This a set of letters that look like each other.
 * There can be a maximum of 30 groups.
 * It is possible for a letter to appear in more than 1 group, but not encouraged.
 */
export const visualLetterGroups = [
    // cspell:disable
    forms('ǎàåÄÀAãâáǟặắấĀāăąaäæɐɑαаᾳ') + 'ᾳ',
    forms('Bbḃвъь'),
    forms('ċČčcĉçCÇćĊСсς'),
    forms('ḎḋḏḑďđḍDd'),
    forms('ēëÈÊËềéèếệĕeEĒėęěêəɛёЁеʒ'),
    forms('fḟF'),
    forms('ġĠĞǧĝģGgɣ'),
    forms('ħĦĥḥHhḤȟн'),
    forms('IįïİÎÍīiÌìíîıɪɨїΊΙ'),
    forms('jJĵ'),
    forms('ķKkκкќ'),
    forms('ḷłľļLlĺḶίι'),
    forms('Mṃṁm'),
    forms('nņÑNṇňŇñńŋѝий'),
    forms('ÒOøȭŌōőỏoÖòȱȯóôõöơɔόδо'),
    forms('PṗpрРρ'),
    forms('Qq'),
    forms('řRṛrŕŗѓгя'),
    forms('ṣšȘṢsSŠṡŞŝśșʃΣ'),
    forms('tțȚťTṭṬṫ'),
    forms('ÜüûŪưůūűúÛŭÙùuųU'),
    forms('Vvν'),
    forms('ŵwWẃẅẁωш'),
    forms('xXх'),
    forms('ÿýYŷyÝỳУўу'),
    forms('ZẓžŽżŻźz'),
    // cspell:enable
];

function forms(letters: string): string {
    const n = letters.normalize('NFC').replace(/\p{M}/gu, '');
    const na = n.normalize('NFD').replace(/\p{M}/gu, '');
    const s = new Set(n + n.toLowerCase() + n.toUpperCase() + na + na.toLowerCase() + na.toUpperCase());
    return [...s].join('');
}

/**
 * This is a map of letters to groups mask values.
 * If two letters are part of the same group then `visualLetterMaskMap[a] & visualLetterMaskMap[b] !== 0`
 */
export const visualLetterMaskMap: Record<string, number | undefined> = calcVisualLetterMasks(visualLetterGroups);

/**
 *
 * @param groups
 * @returns
 */
function calcVisualLetterMasks(groups: string[]): Record<string, number | undefined> {
    // map each letter in a group to the index of the group.
    const map: Record<string, number> = Object.create(null);
    for (let i = 0; i < groups.length; ++i) {
        const m = 1 << i;
        const g = groups[i];
        for (const c of g) {
            map[c] = (map[c] || 0) | m;
        }
    }
    return map;
}
