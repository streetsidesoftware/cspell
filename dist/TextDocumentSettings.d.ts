import { CSpellUserSettings } from './CSpellSettingsDef';
import { SpellingDictionary } from './SpellingDictionary';
export declare function getSettings(settings: CSpellUserSettings, text: string, languageId: string): CSpellUserSettings;
export declare function getDictionary(settings: CSpellUserSettings): Promise<SpellingDictionary>;
