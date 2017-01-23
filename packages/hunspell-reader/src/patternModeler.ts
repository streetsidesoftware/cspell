import * as Rx from 'rxjs/Rx';

export interface PatternNode {
    count: number;
    connections: Map<string, PatternNode>;
    value: string;
    ratio?: number;
}

interface ActiveNodeSet {
    root: PatternNode;
    active: PatternNode[];
}

export function patternModeler(triEditFragments: Rx.Observable<string>): Rx.Observable<Pattern[]> {

    const ans: ActiveNodeSet = {
        root: {
            count: 0,
            value: '',
            connections: new Map<string, PatternNode>()
        },
        active: []
    };
    ans.active.push(ans.root);

    return triEditFragments
        .reduce((ans, frag) => {
            const {root} = ans;
            const active: PatternNode[] = [root];
            const toProcess = ans.active;
            for (const node of toProcess) {
                node.count += 1;
                const next = node.connections.get(frag);
                if (next) {
                    active.push(next);
                } else {
                    node.connections.set(frag, {
                        count: 1,
                        value: frag,
                        connections: new Map<string, PatternNode>()
                    });
                }
            }

            return { root, active };
        }, ans)
        .map(ans => ans.root)
        .last()
        // .map(root => prunePattern(root, root.count, initialCutoffRatio))
        .map(root => prunePattern2(root, root.count))
        .map(flattenPattern)
        ;
}

const cutoffCount = 1000;
const cutoffRatio = 0.10;
// const initialCutoffRatio = 0.001;

const cutoffTopPercent = 0.10;

function prunePattern(root: PatternNode, denom: number, localCutoffRatio: number): PatternNode {
    const { count, value } = root;
    const ratio = count / denom;
    const cutoff = Math.max(count * localCutoffRatio, cutoffCount);
    const connections = new Map<string, PatternNode>();
    for (const n of root.connections.values()) {
        if (n.count >= cutoff) {
            connections.set(n.value, prunePattern(n, count, cutoffRatio));
        }
    }
    return { count, value, connections, ratio };
}

function prunePattern2(root: PatternNode, denom: number): PatternNode {
    const { count, value } = root;
    const ratio = count / denom;
    const nodes = mapToArray(root.connections).sort((a, b) => b.count - a.count);

    nodes.length = Math.ceil(nodes.length * cutoffTopPercent);
    const connections = new Map<string, PatternNode>();
    nodes.filter(n => n.count > cutoffCount).forEach(n => connections.set(n.value, prunePattern2(n, count)));
    return { count, value, connections, ratio };
}

export interface Pattern {
    value: string;
    count: number;
    savings: number;
    ratio: number;
}

const patternSymbolCost = 2;
const patternStorageCost = 10;

function flattenPattern(root: PatternNode) {
    const collection: Pattern[] = [];

    function flattenR(node: PatternNode, prefix: string) {
        const { count, connections, ratio } = node;
        const value = prefix + node.value;
        const savings = calcSavings(value, count);
        collection.push({ value, count, savings, ratio});
        for (const n of connections.values()) {
            flattenR(n, value);
        }
    }

    for (const n of root.connections.values()) {
        flattenR(n, '');
    }

    const sortedCollection = topCandidatePatterns(collection);

    console.log('By savings:');
    sortedCollection.forEach(p => console.log(`p: ${JSON.stringify(p.value)}, c: ${p.count}, r: ${p.ratio}, s: ${p.savings}`));

    const sortedByValue = [...sortedCollection].sort((a, b) => a.value < b.value ? -1 : 1);

    console.log('By pattern:');
    sortedByValue.forEach(p => console.log(`p: ${JSON.stringify(p.value)}, c: ${p.count}, r: ${p.ratio}, s: ${p.savings}`));

    return sortedCollection;
}

const numTopCandidates = 64;

function topCandidatePatterns(candidates: Pattern[]): Pattern[] {
    const topCandidates: Pattern[] = [];

    function compare(a: Pattern, b: Pattern) {
        return a.savings - b.savings;
    }

    let sortedCandidates = candidates.filter(a => a.savings > 0).sort(compare);
    while (topCandidates.length < numTopCandidates && candidates.length > 0) {
        const top = sortedCandidates.pop();
        topCandidates.push(top);

        sortedCandidates = sortedCandidates
            .map(c => {
                if (top.value.indexOf(c.value) >= 0) {
                    const { value, ratio } = c;
                    const count = c.count - top.count;
                    const savings = calcSavings(value, count);
                    return { value, count, savings, ratio };
                }
                if (c.value.indexOf(top.value) >= 0) {
                    const value = c.value.replace(top.value, `@${String.fromCharCode(47 + topCandidates.length)}`);
                    const { ratio, count } = c;
                    const savings = calcSavings(value, count);
                    return { value, count, savings, ratio };
                }
                return c;
            })
            .filter(a => a.savings > 0)
            .sort(compare);
    }

    return topCandidates;
}

function calcSavings(value: string, count: number) {
    return (value.length - patternSymbolCost) * count - value.length - patternStorageCost;
}

function mapToArray(map: Map<string, PatternNode>): PatternNode[] {
    const array: PatternNode[] = [];
    for (const [, n] of map) {
        array.push(n);
    }
    return array;
}
