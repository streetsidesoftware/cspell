import { TrieOptions } from './TrieNode';

export const COMPOUND_FIX = '+';
export const OPTIONAL_COMPOUND_FIX = '*';
export const CASE_INSENSITIVE_PREFIX = '~';
export const FORBID_PREFIX = '!';
export const LINE_COMMENT = '#';


export const defaultTrieOptions: TrieOptions = Object.freeze({
    compoundCharacter: COMPOUND_FIX,
    forbiddenWordPrefix: FORBID_PREFIX,
    stripCaseAndAccentsPrefix: CASE_INSENSITIVE_PREFIX,
});
