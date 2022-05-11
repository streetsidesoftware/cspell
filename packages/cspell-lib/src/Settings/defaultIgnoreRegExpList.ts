import type { PredefinedPatterns } from '@cspell/cspell-types';

/**
 * CSpell uses regular expressions to exclude certain kinds of text from all spell-checks.
 *
 * By default, the `ignoreRegExpList` configuration property will inherit all of the following
 * named patterns:
 *
 * - Base64MultiLine
 * - Base64SingleLine
 * - CommitHash
 * - CommitHashLink
 * - CSSHexValue
 * - CStyleHexValue
 * - Email
 * - HashStrings
 * - RsaCert
 * - SHA
 * - SpellCheckerDisable
 * - SpellCheckerIgnoreInDocSetting
 * - SshRsa
 * - UnicodeRef
 * - Urls
 * - UUID
 *
 * CSpell also offers the following named patterns, but they are not enabled by default:
 *
 * - EscapeCharacters
 * - HexValues
 * - href
 * - PublicKey
 */
export const DEFAULT_IGNORE_REG_EXP_LIST: PredefinedPatterns[] = [
    // Alphabetically sorted
    // Keep this array in sync with the above JSDoc comment
    'Base64MultiLine',
    'Base64SingleLine',
    'CommitHash',
    'CommitHashLink',
    'CSSHexValue',
    'CStyleHexValue',
    'Email',
    // EscapeCharacters is not included by default
    'HashStrings',
    // HexValues is not included by default
    // href is not included by default
    // PublicKey is not included by default
    'RsaCert',
    'SHA',
    'SpellCheckerDisable',
    'SpellCheckerIgnoreInDocSetting',
    'SshRsa',
    'UnicodeRef',
    'Urls',
    'UUID',
];
