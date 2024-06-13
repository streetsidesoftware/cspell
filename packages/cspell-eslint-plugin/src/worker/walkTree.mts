import type { Node } from 'estree-walker';
import { walk } from 'estree-walker';

import type { ASTNode } from './ASTNode.cjs';
import type { ASTPath } from './ASTPath.mjs';

export function walkTree(node: ASTNode, enter: (path: ASTPath) => void) {
    const visited = new Set<object>();

    let pathNode: ASTPath | undefined = undefined;

    function adjustPath(n: ASTPath): ASTPath {
        if (!n.parent || !pathNode) {
            pathNode = n;
            n.prev = undefined;
            return n;
        }
        if (pathNode.node === n.parent) {
            n.prev = pathNode;
            pathNode = n;
            return n;
        }
        while (pathNode && pathNode.node !== n.parent) {
            pathNode = pathNode.prev;
        }
        n.prev = pathNode;
        pathNode = n;
        return n;
    }

    walk(node as Node, {
        enter: function (node, parent, key) {
            if (key === 'tokens' || key === 'parent' || visited.has(node)) {
                this.skip();
                return;
            }
            visited.add(node);
            const path = adjustPath({ node, parent: parent ?? undefined, key, prev: undefined });
            enter(path);
        },
    });
}
