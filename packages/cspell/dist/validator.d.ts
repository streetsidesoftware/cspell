import * as Text from './util/text';
export declare const diagSource = "cSpell Checker";
import { CSpellUserSettings } from './Settings';
export { IncludeExcludeOptions } from './textValidator';
export declare function validateText(text: string, settings: CSpellUserSettings): Promise<Text.TextOffset[]>;
export interface CheckTextInfo {
    text: string;
    items: TextInfoItem[];
}
export interface TextInfoItem {
    text: string;
    startPos: number;
    endPos: number;
    flagIE: IncludeExcludeFlag;
    isError?: boolean;
}
export declare enum IncludeExcludeFlag {
    INCLUDE = "I",
    EXCLUDE = "E"
}
export declare function checkText(text: string, settings: CSpellUserSettings): Promise<CheckTextInfo>;
