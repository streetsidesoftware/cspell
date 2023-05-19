export interface TrieCursor extends Generator<string> {
    readonly text: string;
    readonly depth: number;
    readonly done: boolean;
    readonly eow: boolean;
    keys(): string[];
    next(): IteratorResult<string>;
}
