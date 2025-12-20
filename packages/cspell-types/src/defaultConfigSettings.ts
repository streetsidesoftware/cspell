import type { CSpellSettings } from './CSpellSettingsDef';

export const defaultCSpellSettings: {
    readonly ignoreRandomStrings: boolean;
    readonly minRandomLength: number;
} = {
    ignoreRandomStrings: true,
    minRandomLength: 40,
} as const satisfies CSpellSettings;
