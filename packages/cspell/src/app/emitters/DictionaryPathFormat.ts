export type DictionaryPathFormat = 'hide' | 'long' | 'short' | 'full';

const formats: Record<DictionaryPathFormat, true> = {
    full: true,
    hide: true,
    long: true,
    short: true,
};

export function isDictionaryPathFormat(value: string | undefined): value is DictionaryPathFormat {
    if (!value || typeof value !== 'string') return false;
    return value in formats;
}
