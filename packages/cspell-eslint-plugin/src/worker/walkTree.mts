import type { Node } from 'estree-walker';
import { walk } from 'estree-walker';

import type { ASTNode } from './ASTNode.cjs';

type Key = string | number | symbol | null | undefined;

export function walkTree(node: ASTNode, enter: (node: ASTNode, parent: ASTNode | undefined, key: Key) => void) {
    const visited = new Set<object>();

    walk(node as Node, {
        enter: function (node, parent, key) {
            if (visited.has(node) || key === 'tokens') {
                this.skip();
                return;
            }
            visited.add(node);
            enter(node as ASTNode, parent as ASTNode, key);
        },
    });
}
