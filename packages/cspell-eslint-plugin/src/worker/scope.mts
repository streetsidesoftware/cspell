import assert from 'node:assert';

import type { ASTPath, Key } from './ASTPath.mjs';

export type ScopeScore = number;

export class AstScopeMatcher {
    constructor(readonly scope: ScopeItem[]) {}

    static fromScopeSelector(scopeSelector: string): AstScopeMatcher {
        return new AstScopeMatcher(parseScope(scopeSelector).reverse());
    }

    /**
     * Score the astScope based on the given scope.
     * @param astScope The scope to score.
     * @returns The score of the scope. 0 = no match, higher the score the better the match.
     */
    score(astScope: string[]): ScopeScore {
        try {
            const scopeItems = astScope.map(parseScopeItem).reverse();
            return this.scoreItems(scopeItems);
        } catch {
            console.error('Failed to parse scope: %o', astScope);
            return 0;
        }
    }

    /**
     * Score the astScope based on the given scope.
     * @param astScope The scope to score.
     * @returns The score of the scope. 0 = no match, higher the score the better the match.
     */
    scoreItems(scopeItems: ScopeItem[]): ScopeScore {
        const scope = this.scope;
        let score = 0;
        let scale = 1;
        let matchKey = false;

        for (let i = 0; i < scope.length; i++) {
            const item = scopeItems[i];
            if (!item) return 0;
            const curr = scope[i];
            if (curr.type !== item.type) return 0;
            if (curr.childKey && item.childKey && curr.childKey !== item.childKey) return 0;
            if (curr.childKey && !item.childKey && matchKey) return 0;
            if (curr.childKey && (curr.childKey == item.childKey || !matchKey)) {
                score += scale;
            }
            score += scale * 2;
            matchKey = true;
            scale *= 4;
        }

        return score;
    }

    matchPath(path: ASTPath): ScopeScore {
        const s = this.scope[0];
        // Early out
        if (s?.type !== path.node.type) return 0;

        const items = astPathToScopeItems(path);
        return this.scoreItems(items);
    }

    scopeField(): string {
        return this.scope[0]?.childKey || 'value';
    }

    scopeType(): string {
        return this.scope[0]?.type || '';
    }
}

export interface ScopeItem {
    type: string;
    childKey: string | undefined;
}

export function scopeItem(type: string, childKey?: string): ScopeItem {
    return { type, childKey };
}

const regexValidScope = /^([\w.-]+)(?:\[([\w<>.-]*)\])?$/;

function parseScopeItem(item: string): ScopeItem {
    const match = item.match(regexValidScope);
    assert(match, `Invalid scope item: ${item}`);
    const [_, type, key] = match;
    return { type, childKey: key || undefined };
}

export function parseScope(scope: string): ScopeItem[] {
    return scope
        .split(' ')
        .filter((s) => s)
        .map(parseScopeItem);
}

export interface ASTPathNodeToScope {
    /**
     * Convert a path node into a scope.
     * @param node - The node to convert
     * @param childKey - The key to the child node.
     */
    (node: ASTPath, childKey: Key | undefined): ScopeItem;
}

export function keyToString(key: Key): string | undefined {
    return key === undefined || key === null
        ? undefined
        : typeof key === 'symbol'
          ? `<${Symbol.keyFor(key)}>`
          : `${key}`;
}

export function mapNodeToScope(p: ASTPath, key: Key | undefined): ScopeItem {
    return mapNodeToScopeItem(p, key);
}

export function mapNodeToScopeItem(p: ASTPath, childKey: Key | undefined): ScopeItem {
    return scopeItem(p.node.type, keyToString(childKey));
}

export function mapScopeItemToString(item: ScopeItem): string {
    const { type, childKey: k } = item;
    return k === undefined ? type : `${type}[${k}]`;
}

/**
 * Convert an ASTPath to a scope.
 * @param path - The path to convert to a scope.
 * @returns
 */
export function astPathToScope(path: ASTPath | undefined, mapFn: ASTPathNodeToScope = mapNodeToScope): string[] {
    return astPathToScopeItems(path, mapFn).map(mapScopeItemToString).reverse();
}

export function astScopeToString(path: ASTPath | undefined, sep = ' ', mapFn?: ASTPathNodeToScope): string {
    return astPathToScope(path, mapFn).join(sep);
}

export function astPathToScopeItems(
    path: ASTPath | undefined,
    mapFn: ASTPathNodeToScope = mapNodeToScope,
): ScopeItem[] {
    const parts: ScopeItem[] = [];

    let key: Key | undefined = undefined;

    while (path) {
        parts.push(mapFn(path, key));
        key = path?.key;
        path = path.prev;
    }

    return parts;
}

export class AstPathScope {
    private items: ScopeItem[];
    constructor(readonly path: ASTPath) {
        this.items = astPathToScopeItems(path);
    }

    get scope(): string[] {
        return this.items.map(mapScopeItemToString).reverse();
    }

    get scopeItems(): ScopeItem[] {
        return this.items;
    }

    get scopeString(): string {
        return this.scope.join(' ');
    }

    score(matcher: AstScopeMatcher): ScopeScore {
        const field = matcher.scopeField();
        const node = this.path.node;
        if (field in node && typeof (node as unknown as Record<string, unknown>)[field] === 'string') {
            return matcher.scoreItems(this.items);
        }
        return 0;
    }
}
