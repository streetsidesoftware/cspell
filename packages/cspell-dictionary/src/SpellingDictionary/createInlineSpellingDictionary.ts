import { createAutoResolveWeakCache } from '../util/AutoResolve';
import { isDefined } from '../util/util';
import { createSpellingDictionary } from './createSpellingDictionary';
import { createFlagWordsDictionary } from './FlagWordsDictionary';
import { createIgnoreWordsDictionary } from './IgnoreWordsDictionary';
import type { DictionaryDefinitionInline, SpellingDictionary } from './SpellingDictionary';
import { createCollection } from './SpellingDictionaryCollection';
import { createSuggestDictionary } from './SuggestDictionary';

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

        return createCollection(dictSources, name);
    });
}
