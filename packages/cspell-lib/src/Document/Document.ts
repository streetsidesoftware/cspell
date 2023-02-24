import type { Uri } from '../util/Uri';

export interface Document {
    uri: UriOrString;
    text?: string;
    languageId?: string;
    locale?: string;
}

export type UriString = string;
export type UriOrString = UriString | Uri;

export interface DocumentWithText extends Document {
    text: string;
}
