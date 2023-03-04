import { createAutoResolveWeakCache } from '../util/AutoResolve.js';
import { isDefined } from '../util/util.js';
import { createSpellingDictionary } from './createSpellingDictionary.js';
import { createFlagWordsDictionary } from './FlagWordsDictionary.js';
import { createIgnoreWordsDictionary } from './IgnoreWordsDictionary.js';
import type { DictionaryDefinitionInline, SpellingDictionary } from './SpellingDictionary.js';
import { createCollection } from './SpellingDictionaryCollection.js';
import { createSuggestDictionary } from './SuggestDictionary.js';

const cache = createAutoResolveWeakCache<DictionaryDefinitionInline, SpellingDictionary>();

export function createInlineSpellingDictionary(
    inlineDict: DictionaryDefinitionInline,
    source: string
): SpellingDictionary {
    return cache.get(inlineDict, () => {
        const { words, flagWords, ignoreWords, suggestWords, name } = inlineDict;

        const dictSources = [
            words && createSpellingDictionary(words, name + '-words', source, inlineDict),
            flagWords && createFlagWordsDictionary(flagWords, name + '-flag-words', source),
            ignoreWords && createIgnoreWordsDictionary(ignoreWords, name + '-ignore-words', source),
            suggestWords && createSuggestDictionary(suggestWords, name + '-suggest', source),
        ].filter(isDefined);

        return createCollection(dictSources, name, source);
    });
}
