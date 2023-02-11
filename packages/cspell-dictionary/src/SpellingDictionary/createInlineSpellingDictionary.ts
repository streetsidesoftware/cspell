import { isDefined } from '../util/util';
import { createSpellingDictionary } from './createSpellingDictionary';
import { createFlagWordsDictionary } from './FlagWordsDictionary';
import { createIgnoreWordsDictionary } from './IgnoreWordsDictionary';
import type { DictionaryDefinitionInline, SpellingDictionary } from './SpellingDictionary';
import { createCollection } from './SpellingDictionaryCollection';

export function createInlineSpellingDictionary(
    inlineDict: DictionaryDefinitionInline,
    source: string
): SpellingDictionary {
    const { words, flagWords, ignoreWords, name } = inlineDict;

    const dictSources = [
        words && createSpellingDictionary(words, name + '-words', source, inlineDict),
        flagWords && createFlagWordsDictionary(flagWords, name + '-flag-words', source),
        ignoreWords && createIgnoreWordsDictionary(ignoreWords, name + '-ignore-words', source),
    ].filter(isDefined);

    return createCollection(dictSources, name);
}
