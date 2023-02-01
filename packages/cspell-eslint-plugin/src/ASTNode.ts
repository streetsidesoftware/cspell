import type { Comment, Literal, Node } from 'estree';

export interface JSXText extends Omit<Literal, 'type'> {
    type: 'JSXText';
}

export type ASTNode = (Node | Comment | JSXText) & { parent?: Node };
