import type { ASTNode } from './ASTNode.mjs';

export type Key = string | number | symbol | null | undefined;

export interface ASTPathElement {
    node: ASTNode;
    parent: ASTNode | undefined;
    key: Key;
    index?: number | undefined;
}

export interface ASTPath extends ASTPathElement {
    prev: ASTPath | undefined;
}
