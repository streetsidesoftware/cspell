import type { ASTNode } from './ASTNode.cjs';

export type Key = string | number | symbol | null | undefined;

export interface ASTPath {
    node: ASTNode;
    parent: ASTNode | undefined;
    key: Key;
    prev: ASTPath | undefined;
}
