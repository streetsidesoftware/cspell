export function toUnicodeCode(s: string): string {
    const start = 0x20;
    const end = 0x7a;
    let val = '';
    for (let i = 0; i < s.length; ++i) {
        const char = s[i];
        const code = char.charCodeAt(0);
        if (code >= start && code <= end) {
            val += char;
            continue;
        }
        val += '\\u' + ('000' + code.toString(16)).slice(-4);
    }
    return val;
}
/**
 * Converts a string of letters in ranges.
 *
 * `abcde` => `a-e`
 *
 * @param letters - sorted letters
 */

export function toRange(letters: string, minLength = 4): string {
    const chars: string[] = [];
    let begin = 0;
    let end = 0;
    let endChar = '';
    const minDiff = Math.max(minLength - 2, 1);

    function fill() {
        if (!(end - begin > 1)) return;
        if (end - begin > minDiff) {
            chars.push('-');
            return;
        }
        for (let code = begin + 1; code < end; code += 1) {
            chars.push(String.fromCharCode(code));
        }
    }

    function pushRange() {
        fill();
        chars.push(endChar);
        endChar = '';
    }

    for (let i = 0; i < letters.length; ++i) {
        const letter = letters[i];
        const code = letter.charCodeAt(0);
        if (code - end === 1) {
            end = code;
            endChar = letter;
            continue;
        }
        pushRange();
        chars.push(letter);
        begin = code;
        end = code;
    }

    pushRange();

    return chars.join('');
}

export function removeAccents(text: string): string {
    return removeLooseAccents(text.normalize('NFD'));
}

export function removeLooseAccents(text: string): string {
    return text.replace(/\p{M}/gu, '');
}
