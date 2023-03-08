import type { Uri } from '../util/Uri.js';

export interface Document {
    uri: UriString;
    text?: string;
    languageId?: string;
    locale?: string;
}

export type UriString = string;
export type UriOrString = UriString | Uri;

export interface DocumentWithText extends Document {
    text: string;
}
