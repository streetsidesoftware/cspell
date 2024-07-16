export const specialCharacters = [
    'arrow <',
    'escape \\',
    '\\\\\\',
    'eol \n',
    'eow $',
    'ref #',
    'Numbers 0123456789',
    'Braces: {}[]()',
];

export const smallSample = ['lift', 'talk', 'walk', 'turn', 'burn', 'chalk', 'churn'].flatMap(applyEndings);

// cspell:disable
export const mixedLanguageWords = [
    'Here are a few words to use as a dictionary. They just need to be split. ',
    'walk walked walking walker ',
    'talk talked talking talker ',
    'play played playing player ',
    'red green blue yellow orange ',
    'on the first day of ',
    'on a dark and ',
    'ted red bed reed bees',
    'fëé',
    'café',
    'cat béat',
    'féé',
    'téé',
    'ትኛ',
    'አኛ',
    'ትግርኛ',
    'አማርኛ',
    'ພາສາລາວ',
    'ꦧꦱꦗꦮ',
    'ᐃᓄᒃᑎᑐᑦ',
    'ᐊᓂᔑᓈᐯᒧᐎᓐ',
    'ᓀᐦᐃᔭᐍᐏᐣ',
    '😀😃😄😁😆🥹😅😂🤣🥲☺️😊😇🙂🙃😉',
    '😌😍🥰😘😗😙😚😋😛😝😜🤪🤨🧐🤓😎',
    '🥸🤩🥳😏😒😞😔😟😕🙁☹️😣😖😫😩🥺',
    '😢😭😤😠😡🤬🤯😳🥵🥶😶‍🌫️😱😨😰😥😓',
    '🤗🤔🫣🤭🫢🫡🤫🫠🤥😶🫥😐🫤😑🫨😬',
    '🙄😯😦😧😮😲🥱😴🤤😪😮‍💨😵😵‍💫🤐🥴🤢',
    '🤮🤧😷🤒🤕🤑🤠😈 ',
] // cspell:enable
    .flatMap((a) => a.split(' '))
    .map((a) => a.normalize('NFC'))
    .filter((a) => !!a);
// cspell:enable

export const sampleWords = [
    'journal',
    'journalism',
    'journalist',
    'journalistic',
    'journals',
    'journey',
    'journeyer',
    'journeyman',
    'journeymen',
    'joust',
    'jouster',
    'jousting',
    'jovial',
    'joviality',
    'jowl',
    'jowly',
    'joy',
    'joyful',
    'joyfuller',
    'joyfullest',
    'joyfulness',
    'joyless',
    'joylessness',
    'joyous',
    'joyousness',
    'joyridden',
    'joyride',
    'joyrider',
    'joyriding',
    'joyrode',
    'joystick',
    'Big Apple',
    'New York',
    'apple',
    'big apple',
    'fun journey',
    'long walk',
    'fun walk',
    ...specialCharacters,
    ...smallSample,
    // cspell:disable
    'ᐊᓂᔑᓈᐯᒧᐎᓐ',
    'ᓀᐦᐃᔭᐍᐏᐣ',
    '😀😃😄😁😆🥹😅😂🤣🥲☺️😊😇🙂🙃😉',
    // cspell:enable
];

export const sampleWordsExt = [...sampleWords, ...mixedLanguageWords].filter(filterUnique());

function applyEndings(s: string): string[] {
    const endings = ['', 'ed', 'er', 'ing', 's'];
    return endings.map((e) => s + e);
}

export function filterUnique<T>(): (v: T) => boolean {
    const seen = new Set<T>();

    return (v) => {
        const s = seen.size;
        seen.add(v);
        return seen.size !== s;
    };
}
