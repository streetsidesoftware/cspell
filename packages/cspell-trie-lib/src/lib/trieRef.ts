export type RefList = [string, number][];

export interface TrieRefNode {
    f?: number | undefined;
    r?: RefList | undefined;
}
