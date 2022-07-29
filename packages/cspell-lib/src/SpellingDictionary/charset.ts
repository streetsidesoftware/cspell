import { CharacterSet } from '@cspell/cspell-types';

export function charsetToRegExp(charset: CharacterSet | undefined): RegExp | undefined {
    if (!charset) return undefined;

    try {
        const reg = `[${charset.replace(/[\][]/g, '\\$&')}]`;
        return new RegExp(reg, 'g');
    } catch (e) {
        return undefined;
    }
}
