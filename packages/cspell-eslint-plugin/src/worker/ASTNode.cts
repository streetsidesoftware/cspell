import type { Comment, Literal, Node } from 'estree';

export interface JSXText extends Omit<Literal, 'type'> {
    type: 'JSXText';
}

export type ASTNode = Readonly<(Node | Comment | JSXText) & { parent?: Node }>;

export type NodeType = ASTNode['type'];
