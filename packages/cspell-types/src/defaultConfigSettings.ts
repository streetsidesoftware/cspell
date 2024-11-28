import { CSpellSettings } from './CSpellSettingsDef';

export const defaultCSpellSettings = {
    ignoreRandomStrings: true,
    minRandomLength: 40,
} as const satisfies CSpellSettings;
