/**
 * Bring letters / strings together.
 * - `['a', 'b'] => 'ab'`
 * - `['a', 'bc'] => 'a(bc)'`
 * @param letters - letters to join
 */

export function joinLetters(letters: string[]): string {
    const v = [...letters];
    return v.map((a) => (a.length > 1 || !a.length ? `(${a})` : a)).join('');
}
