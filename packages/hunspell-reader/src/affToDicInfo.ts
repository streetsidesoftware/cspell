import { opConcatMap, opMap, pipe } from '@cspell/cspell-pipe/sync';
import type { DictionaryInformation, SuggestionCostMapDef } from '@cspell/cspell-types';

import type { AffInfo, Fx, Substitution } from './affDef.js';
import { removeAccents, toRange } from './textUtils.js';

export function affToDicInfo(aff: AffInfo, locale: string): DictionaryInformation {
    const alphabetInfo = extractAlphabet(aff, locale);

    return {
        ...alphabetInfo,
        ...extractSuggestionEditCosts(aff, alphabetInfo),
        locale,
        alphabet: toRange(alphabetInfo.alphabet, 5),
        accents: toRange([...alphabetInfo.accents].sort().join('')),
    };
}

interface AlphabetInfo {
    locale: string;
    alphabet: string;
    accents: Set<string>;
}

function extractAlphabet(aff: AffInfo, locale: string): AlphabetInfo {
    const sources: (string[] | string | undefined)[] = [
        aff.MAP,
        aff.TRY,
        aff.KEY,
        aff.REP?.flatMap((rep) => [rep.match, rep.replaceWith]),
        aff.ICONV?.flatMap((cov) => [cov.from, cov.to]),
        aff.OCONV?.flatMap((cov) => [cov.from, cov.to]),
        extractFxLetters(aff.PFX),
        extractFxLetters(aff.SFX),
    ];

    const setOfLetters = new Set(
        sources
            .filter(isDefined)
            .flatMap((a) => a)
            .map((a) => a.normalize())
            .flatMap((a) => [...a, ...a.toLocaleLowerCase(locale), ...a.toLocaleUpperCase(locale)])
            .map((a) => a.trim())
            .filter((a) => !!a)
    );

    const alphabet = [...setOfLetters].sort().join('').replace(/\P{L}/gu, '');
    const accents = new Set(alphabet.normalize('NFD').replace(/\P{M}/gu, ''));

    return { locale, alphabet, accents };
}

function isDefined<T>(a: T | undefined): a is T {
    return a !== undefined;
}

type ExtractSuggestionEditCostsResult = Required<Pick<DictionaryInformation, 'suggestionEditCosts'>>;

function extractSuggestionEditCosts(aff: AffInfo, alphaInfo: AlphabetInfo): ExtractSuggestionEditCostsResult {
    const suggestionEditCosts: ExtractSuggestionEditCostsResult['suggestionEditCosts'] = [];

    suggestionEditCosts.push(
        ...calcCapsAndAccentReplacements(alphaInfo),
        ...calcAffMapReplacements(aff),
        ...calcAffRepReplacements(aff)
    );

    return {
        suggestionEditCosts,
    };
}

function calcAffMapReplacements(aff: AffInfo): SuggestionCostMapDef[] {
    if (!aff.MAP) return [];

    const map = aff.MAP.sort().join('|');

    return [{ map, replace: 1, description: 'Hunspell Aff Map' }];
}

function calcAffRepReplacements(aff: AffInfo): SuggestionCostMapDef[] {
    if (!aff.REP) return [];

    return createCostMaps(
        aff.REP.map((rep) => [rep.match, rep.replaceWith]),
        { map: '', replace: 75, description: 'Hunspell Replace Map' }
    );
}

function calcCapsAndAccentReplacements(alphaInfo: AlphabetInfo): SuggestionCostMapDef[] {
    const { locale, alphabet } = alphaInfo;
    const letters = [...alphabet];
    const capForms = letters.map((letter) => calcCapitalizationForms(letter, locale));
    const accentForms = calcAccentForms(letters);
    const mapCrossAccent = calcCrossAccentCapsMap(accentForms, locale);

    return [
        ...createCostMaps(capForms, { map: '', replace: 1, description: 'Capitalization change.' }),
        ...createCostMaps(accentForms, { map: '', replace: 1, description: 'Replace Accents' }),
        ...createCostMaps(mapCrossAccent, { map: '', replace: 2, description: 'Capitalization and Accent change.' }),
    ];
}

function createCostMaps(formMaps: Iterable<string>[], base: SuggestionCostMapDef): SuggestionCostMapDef[] {
    const forms = formMaps.map((forms) => joinCharMap(forms));
    const mapValues = [...new Set(forms)].sort().filter((a) => !!a);

    return [...groupsOfN(mapValues, 6)].map((mapValues) => ({ ...base, map: mapValues.join('|') }));
}

function calcCapitalizationForms(letter: string, locale: string): Set<string> {
    const forms = new Set<string>();
    forms.add(letter);
    forms.add(letter.toUpperCase());
    forms.add(letter.toLowerCase());
    forms.add(letter.toLocaleUpperCase(locale));
    forms.add(letter.toLocaleLowerCase(locale));
    forms.add(letter.toLocaleUpperCase(locale).toLocaleLowerCase(locale));
    forms.add(letter.toLocaleLowerCase(locale).toLocaleUpperCase(locale));
    return forms;
}

function calcAccentForms(letters: string[]): Set<string>[] {
    const forms = new Map<string, Set<string>>();

    function getForm(letter: string): Set<string> {
        const f = forms.get(letter);
        if (f) return f;
        const s = new Set<string>();
        forms.set(letter, s);
        return s;
    }

    for (const letter of letters) {
        const base = removeAccents(letter);
        const formCollection = getForm(base);
        formCollection.add(base);
        formCollection.add(letter);
        // addAccents(base, accents, formCollection);
    }

    return [...forms.values()].filter((s) => s.size > 1);
}

function joinCharMap(values: Iterable<string>): string {
    return [...values]
        .sort()
        .map((a) => (a.length > 1 ? '(' + a + ')' : a))
        .join('');
}

function calcCrossAccentCapsMap(accentForms: Set<string>[], locale: string): Set<string>[] {
    function calc(form: Set<string>): Set<string> {
        return new Set(
            pipe(
                form,
                opConcatMap((letter) => calcCapitalizationForms(letter, locale))
            )
        );
    }

    const values = pipe(accentForms, opMap(calc));
    return [...values];
}

// function addAccents(cleanLetter: string, accents: Iterable<string>, collection: Set<string>) {
//     for (const accent of accents) {
//         collection.add(applyAccent(cleanLetter, accent));
//     }
// }

// function applyAccent(letter: string, accent: string): string {
//     const withAccent = (letter + accent).normalize('NFC');
//     return removeLooseAccents(withAccent);
// }

function extractFxLetters(fxm: Map<string, Fx> | undefined): string[] | undefined {
    if (!fxm) return undefined;

    const substations: Iterable<Substitution> = pipe(
        fxm.values(),
        opConcatMap((f) => f.substitutionSets.values()),
        opConcatMap((s) => s.substitutions)
    );

    const partials = pipe(
        substations,
        opConcatMap((sub) => [sub.remove, sub.attach])
    );

    return [...partials];
}

function* groupsOfN<T>(values: Iterable<T>, n: number): Iterable<T[]> {
    let buffer: T[] = [];

    for (const item of values) {
        buffer.push(item);
        if (buffer.length >= n) {
            yield buffer;
            buffer = [];
        }
    }

    if (buffer.length) {
        yield buffer;
    }
}
