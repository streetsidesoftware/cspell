export interface TextOffset {
    text: string;
    offset: number;
}

export interface TextDocumentOffset extends TextOffset {
    uri?: string;
    doc: string;
    row: number;
    col: number;
    line: TextOffset;
}
