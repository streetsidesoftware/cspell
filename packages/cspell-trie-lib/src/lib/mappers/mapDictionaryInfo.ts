import type { DictionaryInformation } from '../models/DictionaryInformation';
import { Locale, parseLocale } from '../models/locale';
import type { SuggestionCostMapDef } from '../models/suggestionCostsDef';
import { hunspellInformationToSuggestionCostDef } from './mapHunspellInformation';

export function mapDictionaryInformation(dictInfo: DictionaryInformation): SuggestionCostMapDef[] {
    const _locale = dictInfo.locale;
    const locale = _locale ? parseLocale(_locale).filter((loc) => loc.isValid()) : undefined;

    const defsEC = dictInfo.suggestionEditCosts || [];
    const defsHI = dictInfo.hunspellInformation
        ? hunspellInformationToSuggestionCostDef(dictInfo.hunspellInformation, locale)
        : [];
    return [
        ...defsEC,
        ...parseAlphabet(dictInfo.alphabet, locale),
        ...parseAccents(dictInfo.accents, locale),
        ...defsHI,
    ];
}

function parseAlphabet(
    _alphabet: DictionaryInformation['alphabet'],
    _locale: Locale[] | undefined
): SuggestionCostMapDef[] {
    return [];
}

function parseAccents(
    _accents: DictionaryInformation['accents'],
    _locale: Locale[] | undefined
): SuggestionCostMapDef[] {
    return [];
}
