// cspell:ignore ings ning gimuy anrvtbf

export const regExLines = /.*(\r?\n|$)/g;
export const regExUpperSOrIng = /(\p{Lu}+\\?['’]?(?:s|ing|ies|es|ings|ed|ning))(?!\p{Ll})/gu;
export const regExSplitWords = /(\p{Ll}\p{M}?)(\p{Lu})/gu;
export const regExSplitWords2 = /(\p{Lu}\p{M}?)(\p{Lu}\p{M}?\p{Ll})/gu;
export const regExWords = /\p{L}(?:(?:\\?['’])?\p{L})*/gu;
export const regExWordsAndDigits = /(?:\d+)?[\p{L}\p{M}_'’-](?:(?:\\?['’])?[\p{L}\p{M}\w'’-])*/gu;
export const regExIgnoreCharacters = /\p{sc=Hiragana}|\p{sc=Han}|\p{sc=Katakana}|[\u30A0-\u30FF]|[\p{sc=Hangul}]/gu;
export const regExFirstUpper = /^\p{Lu}\p{M}?\p{Ll}+$/u;
export const regExAllUpper = /^(?:\p{Lu}\p{M}?)+$/u;
export const regExAllLower = /^(?:\p{Ll}\p{M}?)+$/u;
export const regExPossibleWordBreaks = /[_-]/g;
export const regExMatchRegExParts = /^\/(.*)\/([gimuy]*)$/;
export const regExAccents = /\p{M}/gu;
export const regExEscapeCharacters = /(?<=\\)[anrvtbf]/gi;
export const regExDanglingQuote = /(?<=\P{L}\p{L}?)[']/gu;
/** Match tailing endings after CAPS words */
export const regExTrailingEndings = /(?<=\p{Lu}{2})['’]?(?:s|d|ing[s]|ies|e[ds]|ning|th|nth)(?!\p{Ll})/gu;
