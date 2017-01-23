import * as Text from './util/text';
export declare const diagSource = "cSpell Checker";
import { CSpellUserSettings } from './CSpellSettingsDef';
export declare function validateText(text: string, settings: CSpellUserSettings): Promise<Text.WordOffset[]>;
