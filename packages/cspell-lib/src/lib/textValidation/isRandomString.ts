const maxRadio = 0.55;

/**
 * Try to detect if a string is a random string of characters or is it camel case / snake case words.
 * @param s - string to check
 * @returns true if the string is considered random;
 */
export function isRandomString(s: string, maxNoiseToLengthRatio = maxRadio): boolean {
    return scoreRandomString(s) >= maxNoiseToLengthRatio;
}

/**
 * Calculate the ratio of noise to the length of the string.
 * @param s - string to check
 * @returns true if the string is considered random;
 */
export function scoreRandomString(s: string): number {
    const n = categorizeString(s);
    return (s.length && n.length / s.length) || 0;
}

export function categorizeString(s: string): string {
    const n = s
        .replaceAll(/\d+/g, '0')
        .replaceAll(/\p{Ll}\p{M}+/gu, 'a')
        .replaceAll(/\p{Lu}\p{M}+/gu, 'A')
        .replaceAll(/\p{Lu}+/gu, '2')
        .replaceAll(/\p{Ll}+/gu, '1')
        .replaceAll(/\p{M}/gu, '4')
        .replaceAll('_', '')
        .replaceAll(/[-_.']+/g, '3');
    return n;
}
