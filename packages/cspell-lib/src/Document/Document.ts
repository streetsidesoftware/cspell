export interface Document {
    uri: UriString;
    text?: string;
    languageId?: string;
    locale?: string;
}

export type UriString = string;

export interface DocumentWithText extends Document {
    text: string;
}
