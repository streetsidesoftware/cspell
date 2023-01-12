export function normalizeLanguageIds(languageId: string | string[]): string[] {
    return (Array.isArray(languageId) ? languageId.join(',') : languageId).split(',').map((s) => s.trim());
}
