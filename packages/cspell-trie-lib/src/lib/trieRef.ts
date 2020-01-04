export type RefList = [string, number][];

export interface TrieRefNode {
    f?: number;
    r?: RefList;
}
