import type { ASTNode } from './ASTNode.cjs';
import type { ASTPath, ASTPathElement, Key } from './ASTPath.mjs';

// const logger = getDefaultLogger();
// const log = logger.log;

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

    walk(node, ({ node, parent, key, index }) => {
        if (key === 'tokens' || key === 'parent' || visited.has(node)) {
            return false;
        }
        visited.add(node);
        const path = adjustPath({ node, parent: parent, key, index, prev: undefined });
        enter(path);
        return true;
    });
}

type CallBack = (element: ASTPathElement) => boolean;

function walk(root: ASTNode, enter: CallBack) {
    function walkNodes(pfx: string, node: ASTNode, parent: ASTNode | undefined, key: Key, index: number | undefined) {
        const goIn = enter({ node, parent, key, index });
        // log('walk: %o', { pfx, type: node.type, key, index, goIn });
        if (!goIn) return;

        const n = node as Readonly<Record<string, unknown>>;

        for (const key of Object.keys(n)) {
            const v = n[key] as unknown;
            const fx = pfx + `.${node.type}[${key}]`;
            if (Array.isArray(v)) {
                for (let i = 0; i < v.length; ++i) {
                    const vv = v[i];
                    isNode(vv) && walkNodes(fx, vv as ASTNode, node, key, i);
                }
            } else if (isNode(v)) {
                walkNodes(fx, v, node, key, undefined);
            }
        }

        return true;
    }

    walkNodes('root', root, undefined, undefined, undefined);
}

function isNode(node: ASTNode | unknown): node is ASTNode {
    if (!node) return false;
    const n = node as ASTNode;
    return (typeof n === 'object' && typeof n['type'] === 'string') || false;
}
