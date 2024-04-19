const regExFirstUpper = /^\p{Lu}\p{M}?\p{Ll}+$/u;
const regExAllUpper = /^(?:\p{Lu}\p{M}?)+$/u;
const regExAllLower = /^(?:\p{Ll}\p{M}?)+$/u;
const regExAccents = /\p{M}/gu;

export function isUpperCase(word: string): boolean {
    return !!regExAllUpper.test(word);
}

export function isLowerCase(word: string): boolean {
    return !!regExAllLower.test(word);
}

export function isFirstCharacterUpper(word: string): boolean {
    return isUpperCase(word.slice(0, 1));
}

export function isFirstCharacterLower(word: string): boolean {
    return isLowerCase(word.slice(0, 1));
}

export function ucFirst(word: string): string {
    return word.slice(0, 1).toUpperCase() + word.slice(1);
}

export function lcFirst(word: string): string {
    return word.slice(0, 1).toLowerCase() + word.slice(1);
}

export function matchCase(example: string, word: string): string {
    if (regExFirstUpper.test(example)) {
        return word.slice(0, 1).toUpperCase() + word.slice(1).toLowerCase();
    }
    if (regExAllLower.test(example)) {
        return word.toLowerCase();
    }
    if (regExAllUpper.test(example)) {
        return word.toUpperCase();
    }

    if (isFirstCharacterUpper(example)) {
        return ucFirst(word);
    }

    if (isFirstCharacterLower(example)) {
        return lcFirst(word);
    }

    return word;
}

export function removeAccents(text: string): string {
    return text.normalize('NFD').replaceAll(regExAccents, '');
}

export function removeUnboundAccents(text: string): string {
    return text.replaceAll(regExAccents, '');
}
