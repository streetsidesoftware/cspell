export interface BuilderCursor {
    /** Insert a character in the current node. */
    insertChar(char: string): void;
    /** Mark the current node as End of Word */
    markEOW(): void;
    /** Refer to a previous node */
    reference(refId: number): void;
    backStep(num: number): void;

    /** Optional dispose method to release the cursor */
    dispose?(): void;
    /** Optional dispose method to release the cursor */
    [Symbol.dispose]?(): void;
}
