"use strict";
function patternModeler(triEditFragments) {
    const ans = {
        root: {
            count: 0,
            value: '',
            connections: new Map()
        },
        active: []
    };
    ans.active.push(ans.root);
    return triEditFragments
        .reduce((ans, frag) => {
        const { root } = ans;
        const active = [root];
        const toProcess = ans.active;
        for (const node of toProcess) {
            node.count += 1;
            const next = node.connections.get(frag);
            if (next) {
                active.push(next);
            }
            else {
                node.connections.set(frag, {
                    count: 1,
                    value: frag,
                    connections: new Map()
                });
            }
        }
        return { root, active };
    }, ans)
        .map(ans => ans.root)
        .last()
        .map(root => prunePattern2(root, root.count))
        .map(flattenPattern);
}
exports.patternModeler = patternModeler;
const cutoffCount = 1000;
const cutoffRatio = 0.10;
const initialCutoffRatio = 0.001;
const cutoffTopPercent = 0.10;
function prunePattern(root, denom, localCutoffRatio) {
    const { count, value } = root;
    const ratio = count / denom;
    const cutoff = Math.max(count * localCutoffRatio, cutoffCount);
    const connections = new Map();
    for (const n of root.connections.values()) {
        if (n.count >= cutoff) {
            connections.set(n.value, prunePattern(n, count, cutoffRatio));
        }
    }
    return { count, value, connections, ratio };
}
function prunePattern2(root, denom) {
    const { count, value } = root;
    const ratio = count / denom;
    const nodes = mapToArray(root.connections).sort((a, b) => b.count - a.count);
    nodes.length = Math.ceil(nodes.length * cutoffTopPercent);
    const connections = new Map();
    nodes.filter(n => n.count > cutoffCount).forEach(n => connections.set(n.value, prunePattern2(n, count)));
    return { count, value, connections, ratio };
}
const patternSymbolCost = 2;
const patternStorageCost = 10;
function flattenPattern(root) {
    const collection = [];
    function flattenR(node, prefix) {
        const { count, connections, ratio } = node;
        const value = prefix + node.value;
        const savings = calcSavings(value, count);
        collection.push({ value, count, savings, ratio });
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
function topCandidatePatterns(candidates) {
    const topCandidates = [];
    function compare(a, b) {
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
function calcSavings(value, count) {
    return (value.length - patternSymbolCost) * count - value.length - patternStorageCost;
}
function mapToArray(map) {
    const array = [];
    for (const [, n] of map) {
        array.push(n);
    }
    return array;
}
//# sourceMappingURL=patternModeler.js.map