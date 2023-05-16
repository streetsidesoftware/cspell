export interface BuilderCursor {
    insertChar(char: string): void;
    markEOW(): void;
    reference(nodeIdx: number): void;
    backStep(num: number): void;
}
