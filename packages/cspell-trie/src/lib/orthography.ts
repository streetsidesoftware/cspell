const intl = new Intl.Collator('en', { sensitivity: 'base' });

export const compare = intl.compare;

export const visualLetterGroups = [
    '', // keep empty
    'ǎàåÄÀAãâáǟặắấĀāăąaäæɐɑᾳαа',
    'Bbḃвъь',
    'ċČčcĉçCÇćĊСсς',
    'ḎḋḏḑďđḍDd',
    'ēëÈÊËềéèếệĕeEĒėęěêəɛёЁеʒ',
    'fḟF',
    'ġĠĞǧĝģGgɣ',
    'ħĦĥḥHhḤȟн',
    'IįïİÎÍīiÌìíîıɪɨї',
    'jJĵ',
    'ķKkκкќ',
    'ḷłľļLlĺḶίι',
    'Mṃṁm',
    'nņÑNṇňŇñńŋѝий',
    'ÒOøȭŌōőỏoÖòȱȯóôõöơɔόδо',
    'PṗpрРρ',
    'Qq',
    'řRṛrŕŗѓгя',
    'ṣšȘṢsSŠṡŞŝśșʃ',
    'tțȚťTṭṬṫ',
    'ÜüûŪưůūűúÛŭÙùuųU',
    'Vvν',
    'ŵwWẃẅẁωш',
    'xXх',
    'ÿýYŷyÝỳУўу',
    'ZẓžŽżŻźz',
];

export const visualLetterMap: Map<string, number> = calcVisualLetterMap(visualLetterGroups);

function calcVisualLetterMap(groups: string[]): Map<string, number> {
    // map each letter in a group to the index of the group.
    const map = new Map<string, number>();
    groups
        .map(g => g.split(''))
        .forEach((g, i) => g.forEach(c => map.set(c, i)))
    return map;
}
