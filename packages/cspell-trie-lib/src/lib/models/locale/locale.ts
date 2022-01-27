import { codes } from './knownLocales';

export interface LocaleInfo {
    locale: string;
    language: string;
    country?: string | undefined;
}

let codesByLocale: Map<string, LocaleInfo> | undefined;

export class Locale {
    readonly _raw: string;
    readonly _locale: string;
    constructor(locale: string) {
        this._raw = locale;
        this._locale = normalizeLocale(locale);
    }

    get locale() {
        return this._locale;
    }

    localInfo(): LocaleInfo | undefined {
        return lookupLocaleInfo(this._locale);
    }

    isValid() {
        return isStandardLocale(this._locale);
    }

    toJSON() {
        return this.locale;
    }

    toString() {
        return this.locale;
    }
}

const regExTwoLetter = /^[a-z]{2}$/i;
const regExLocaleWithCountry = /^([a-z]{2})[_-]?([a-z]{2,3})$/i;
const regExValidLocale = /^([a-z]{2})(?:-([A-Z]{2,3}))?$/;

/**
 * Attempt to normalize a locale.
 * @param locale a locale string
 */
export function normalizeLocale(locale: string): string {
    locale = locale.trim();
    if (regExTwoLetter.test(locale)) return locale.toLowerCase();

    const m = locale.match(regExLocaleWithCountry);

    // give up if we cannot parse it.
    if (!m) return locale;

    const lang = m[1].toLowerCase();
    const variant = m[2].toUpperCase();

    return `${lang}-${variant}`;
}

export function isStandardLocale(locale: string): boolean {
    return regExValidLocale.test(locale);
}

export function lookupLocaleInfo(locale: string): LocaleInfo | undefined {
    codesByLocale = codesByLocale || buildLocaleLookup();
    return codesByLocale.get(locale);
}

function buildLocaleLookup(): Map<string, LocaleInfo> {
    const info = codes.map(([locale, language, country]) => ({ locale, language, country }));
    return new Map(info.map((i) => [i.locale, i]));
}

function createLocale(locale: string): Locale {
    return new Locale(locale);
}

export function parseLocale(locales: string | string[]): Locale[] {
    locales = typeof locales === 'string' ? locales.split(',') : locales;

    return locales.map(createLocale);
}
