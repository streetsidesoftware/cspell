import assert from 'assert';

export class Scope {
    constructor(readonly value: string, readonly parent?: Scope) {}
    /**
     * Convert the scope hierarchy to a string
     * @param ltr - return ancestry from left-to-right
     * @returns the scope hierarchy as a string separated by a space.
     */
    toString(ltr = false): string {
        if (!this.parent) return this.value;
        return ltr ? this.parent.toString(ltr) + ' ' + this.value : this.value + ' ' + this.parent.toString(ltr);
    }

    static isScope(value: unknown): value is Scope {
        return value instanceof Scope;
    }
}

interface Box<T> {
    v: T;
}

/**
 * A Scope Pool is used to keep the number of scope chains down to a minimum. It ensure that if two scopes match,
 * then they will be the same object.
 */
export class ScopePool {
    private pool = new Map<string, Map<Scope | undefined, Box<Scope>>>();

    /**
     * Get a Scope that matches the scope. This method is idempotent.
     * @param scopeValue - a single scope value: i.e. `source.ts`
     * @param parent - optional parent Scope
     */
    getScope(scopeValue: string, parent?: Scope): Scope {
        const foundPoolMap = this.pool.get(scopeValue);
        const poolMap = foundPoolMap || new Map<Scope | undefined, Box<Scope>>();
        if (poolMap !== foundPoolMap) {
            this.pool.set(scopeValue, poolMap);
        }
        const foundScope = poolMap.get(parent);
        if (foundScope) return foundScope.v;
        const scope = new Scope(scopeValue, parent);
        poolMap.set(parent, { v: scope });
        return scope;
    }

    /**
     *
     * @param scopes - the scope as a string or array of strings
     *   i.e. `
     * @param ltr - left-to-right ancestry
     */
    parseScope(scopes: Scope | ScopeLike): Scope;
    parseScope(scopes: string | ScopeLike): Scope;
    parseScope(scopes: string | string[], ltr?: boolean): Scope;
    parseScope(scopes: string | string[] | Scope | ScopeLike, ltr = false): Scope {
        if (Scope.isScope(scopes)) return scopes;
        if (isScopeLike(scopes)) {
            const parent = scopes.parent ? this.parseScope(scopes.parent) : undefined;
            return this.getScope(scopes.value, parent);
        }
        return this.parseScopeString(scopes, ltr);
    }

    private parseScopeString(scopes: string | string[], ltr?: boolean): Scope {
        scopes = Array.isArray(scopes) ? scopes : scopes.split(' ');
        const parentToChild = ltr ? scopes : scopes.reverse();
        let parent: Scope | undefined = undefined;
        for (const value of parentToChild) {
            parent = this.getScope(value, parent);
        }
        assert(parent, 'Empty scope is not allowed.');
        return parent;
    }
}

interface ScopeLike {
    readonly value: string;
    readonly parent?: ScopeLike | undefined;
}

function isScopeLike(value: string | string[] | ScopeLike): value is ScopeLike {
    return typeof value === 'object' && !Array.isArray(value) && value.value !== undefined;
}
