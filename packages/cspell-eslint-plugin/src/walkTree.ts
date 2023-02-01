import { walk } from 'estree-walker';

import type { ASTNode } from './ASTNode';

export function walkTree(node: ASTNode, enter: (node: ASTNode, parent: ASTNode | undefined, key: string) => void) {
    const visited = new Set<object>();

    walk(node, {
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
