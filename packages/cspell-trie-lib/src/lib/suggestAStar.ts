import { TrieRoot, TrieNode } from './TrieNode';
import { CompoundWordsMethod, JOIN_SEPARATOR, WORD_SEPARATOR } from './walker';
import { SuggestionIterator } from './suggest';
import { PairingHeap } from './PairingHeap';
import { SuggestionCollector, suggestionCollector, SuggestionResult } from '.';
import { visualLetterMaskMap } from './orthography';

export interface GenSuggestionOptions {
    compoundMethod: CompoundWordsMethod; // NONE is the best option.
    ignoreCase: boolean;
    maxNumChanges: number; // 3 is a good number, much higher than 5 is problematic.
}

export function* genCompoundableSuggestions(
    root: TrieRoot,
    word: string,
    options: GenSuggestionOptions
): SuggestionIterator {
    const { compoundMethod, ignoreCase, maxNumChanges } = options;
    const len = word.length;

    const nodes = determineInitialNodes(root, ignoreCase);
    const noFollow = determineNoFollow(root);

    function compare(a: Candidate, b: Candidate): number {
        const deltaCost = a.g - b.g;
        if (deltaCost) return deltaCost;
        // The costs are the some return the one with the most progress.

        return b.i - a.i;
    }

    const opCosts = {
        baseCost: 100,
        swapCost: 75,
        duplicateLetterCost: 25,
        visuallySimilar: 1,
        firstLetterBias: 25,
        wordBreak: 99,
    } as const;

    const bc = opCosts.baseCost;
    const maxCostScale = 1.03 / 2;
    const optimalCost = 0;
    const mapSugCost = opCosts.visuallySimilar;
    const wordSeparator = compoundMethod === CompoundWordsMethod.JOIN_WORDS ? JOIN_SEPARATOR : WORD_SEPARATOR;
    const compoundIndicator = root.compoundCharacter;

    let costLimit = bc * Math.min(len * maxCostScale, maxNumChanges);

    const candidates = new PairingHeap(compare);
    const locationCache: LocationCache = new Map();
    const wordsToEmit: EmitWord[] = [];
    const pathToLocation: Map<Path, LocationNode> = new Map();

    const edgesToResolve: EdgeToResolve[] = [];

    const emittedWords = new Map<string, number>();

    function getLocationNode(path: Path): LocationNode {
        const index = path.i;
        const node = path.n;
        const foundByIndex = locationCache.get(index);
        const byTrie: LocationByTriNode = foundByIndex || new Map<TrieNode, LocationNode>();
        if (!foundByIndex) locationCache.set(index, byTrie);
        const f = byTrie.get(node);
        const n: LocationNode = f || { in: new Map(), er: [], bc: 0, p: path, sbc: -1, sfx: [] };
        if (!f) byTrie.set(node, n);
        return n;
    }

    function* emitWord(word: string, cost: number): SuggestionIterator {
        if (cost <= costLimit) {
            // console.log(`e: ${word} ${cost}`);
            const f = emittedWords.get(word);
            if (f !== undefined && f <= cost) return undefined;
            emittedWords.set(word, cost);
            const lastChar = word[word.length - 1];
            if (!noFollow[lastChar]) {
                const changeLimit = (yield { word: word, cost: cost - optimalCost }) ?? costLimit - optimalCost;
                costLimit = Math.min(changeLimit + optimalCost, costLimit);
            }
        }
        return undefined;
    }

    function* emitWords(): SuggestionIterator {
        for (const w of wordsToEmit) {
            yield* emitWord(w.word, w.cost);
        }
        wordsToEmit.length = 0;
        return undefined;
    }

    function addEdgeToBeResolved(path: Path, edge: Edge) {
        path.r = path.r || new Set();
        path.r.add(edge);
    }

    function addEdge(path: Path, edge: Edge): Edge | undefined {
        const g = path.g + edge.c;
        const i = edge.i;
        if (g > costLimit) return undefined;

        const { n } = edge;
        const w = path.w + edge.s;
        const can: Path = { e: edge, n, i, w, g, r: undefined, a: true };
        const location = getLocationNode(can);
        location.er.push(edge);

        // Is Location Resolved
        if (location.sbc >= 0 && location.sbc <= can.g) {
            // No need to go further, this node has been resolved.
            // Return the edge to be resolved
            addEdgeToBeResolved(path, edge);
            edgesToResolve.push({ edge, suffixes: location.sfx });
            return undefined;
        }
        const found = location.in.get(can.w);
        if (found) {
            // If the existing path is cheaper or the same keep it.
            // Do not add the edge.
            if (found.g <= can.g) return undefined;
            // Otherwise mark it as inactive and
            const e = found.e;
            if (e) {
                edgesToResolve.push({ edge: e, suffixes: [] });
            }
            found.a = false;
        }
        addEdgeToBeResolved(path, edge);
        location.in.set(can.w, can);
        if (location.p.g > can.g) {
            pathToLocation.delete(location.p);
            location.sbc = -1;
            location.sfx.length = 0;
            location.p = can;
        }
        if (location.p === can) {
            // Make this path the representation of this location.
            pathToLocation.set(can, location);
            candidates.add(can);
        }
        return edge;
    }

    function opWordFound(best: Candidate): void {
        if (!best.n.f) return;
        const i = best.i;
        const toDelete = len - i;
        const e: Edge = { p: best, n: best.n, i, s: '', c: bc * toDelete, a: Action.Delete };
        addEdgeToBeResolved(best, e);
        edgesToResolve.push({ edge: e, suffixes: [{ s: '', c: 0 }] });
        if (compoundMethod) {
            const s = wordSeparator;
            nodes.forEach((node) => {
                const e: Edge = { p: best, n: node, i, s, c: opCosts.wordBreak, a: Action.WordBreak };
                addEdge(best, e);
            });
        }
    }

    function opCompoundWord(best: Candidate): void {
        if (!best.n.c?.get(compoundIndicator)) return;
        const i = best.i;
        const s = '';
        nodes.forEach((node) => {
            const n = node.c?.get(compoundIndicator);
            if (!n) return;
            const e: Edge = { p: best, n, i, s, c: opCosts.wordBreak, a: Action.CompoundWord };
            addEdge(best, e);
        });
    }

    function opInsert(best: Candidate): void {
        const children = best.n.c;
        if (!children) return;
        const i = best.i;
        const c = bc;
        for (const [s, n] of children) {
            const e: Edge = { p: best, n, i, s, c, a: Action.Insert };
            addEdge(best, e);
        }
    }

    function opDelete(best: Candidate, num = 1): Edge | undefined {
        const i = best.i;
        const e: Edge = {
            p: best,
            n: best.n,
            i: i + num,
            s: '',
            c: bc * num,
            a: Action.Delete,
            t: word.slice(i, i + num),
        };
        return addEdge(best, e);
    }

    function opIdentity(best: Candidate): void {
        const s = word[best.i];
        const n = best.n.c?.get(s);
        if (!n) return;
        const i = best.i + 1;
        const e: Edge = { p: best, n, i, s, c: 0, a: Action.Identity };
        addEdge(best, e);
    }

    function opReplace(best: Candidate): void {
        const children = best.n.c;
        if (!children) return;
        const wc = word[best.i];
        const wg = visualLetterMaskMap[wc] || 0;
        const i = best.i + 1;
        const cost = bc + (best.i ? 0 : opCosts.firstLetterBias);
        for (const [s, n] of children) {
            if (s == wc) continue;
            const sg = visualLetterMaskMap[s] || 0;
            const c = wg & sg ? mapSugCost : cost;
            const e: Edge = { p: best, n, i, s, c, a: Action.Replace, t: wc };
            addEdge(best, e);
        }
    }

    function opSwap(best: Candidate): void {
        const children = best.n.c;
        const i = best.i;
        const i2 = i + 1;
        if (!children || len <= i2) return;
        const wc1 = word[i];
        const wc2 = word[i2];
        if (wc1 === wc2) return;
        const n = best.n.c?.get(wc2);
        const n2 = n?.c?.get(wc1);
        if (!n || !n2) return;
        const e: Edge = { p: best, n: n2, i: i2 + 1, s: wc2 + wc1, c: opCosts.swapCost, a: Action.Swap, t: wc1 + wc2 };
        addEdge(best, e);
    }

    function opDuplicate(best: Candidate): void {
        const children = best.n.c;
        const i = best.i;
        const i2 = i + 1;
        if (!children || len <= i2) return;
        const wc1 = word[i];
        const wc2 = word[i2];
        const n = best.n.c?.get(wc1);
        if (!n) return;
        if (wc1 === wc2) {
            // convert double letter to single
            const e: Edge = { p: best, n, i: i + 2, s: wc1, c: opCosts.duplicateLetterCost, a: Action.Delete };
            addEdge(best, e);
            return;
        }
        const n2 = n?.c?.get(wc1);
        if (!n2) return;
        // convert single to double letter
        const e: Edge = { p: best, n: n2, i: i2, s: wc1 + wc1, c: opCosts.duplicateLetterCost, a: Action.Insert };
        addEdge(best, e);
    }

    function resolveEdges() {
        let e: EdgeToResolve | undefined;
        while ((e = edgesToResolve.shift())) {
            resolveEdge(e);
        }
    }

    function resolveLocationEdges(location: LocationNode, suffixes: Suffix[]) {
        for (const edge of location.er) {
            edgesToResolve.push({ edge, suffixes });
        }
    }

    function resolveEdge({ edge, suffixes }: EdgeToResolve) {
        const { p, s: es, c: ec } = edge;
        if (!p.r?.has(edge)) return;
        const edgeSuffixes = suffixes.map((sfx) => ({ s: es + sfx.s, c: ec + sfx.c }));
        for (const { s, c } of edgeSuffixes) {
            const cost = p.g + c;
            if (cost <= costLimit) {
                const word = p.w + s;
                wordsToEmit.push({ word, cost });
            }
        }
        p.r.delete(edge);
        const location = pathToLocation.get(p);
        if (location?.p === p) {
            location.sfx = location.sfx.concat(edgeSuffixes);
            if (!p.r.size) {
                location.sbc = p.g;
                resolveLocationEdges(location, edgeSuffixes);
            }
        } else if (!p.r.size) {
            if (p.e) {
                // Keep rolling up.
                edgesToResolve.push({ edge: p.e, suffixes: edgeSuffixes });
            }
        }
    }

    /************
     * Below is the core of the A* algorithm
     */

    nodes.forEach((node, idx) => {
        const g = idx ? 1 : 0;
        candidates.add({ e: undefined, n: node, i: 0, w: '', g, r: undefined, a: true });
    });

    let maxSize = 0;
    let best: Candidate | undefined;
    // const bc2 = 2 * bc;
    while ((best = candidates.dequeue())) {
        maxSize = Math.max(maxSize, candidates.length);
        if (best.g > costLimit) break;
        if (!best.a) continue;

        const bi = best.i;
        opWordFound(best);
        const children = best.n.c;
        if (!children) continue;

        if (bi === len) {
            opInsert(best);
        } else {
            opIdentity(best);
            opReplace(best);
            opDelete(best);
            opInsert(best);
            opSwap(best);
            opCompoundWord(best);
            opDuplicate(best);
        }
        resolveEdges();
        yield* emitWords();
    }
    resolveEdges();
    yield* emitWords();

    // console.log(`
    // word: ${word}
    // maxSize: ${maxSize}
    // length: ${candidates.length}
    // `);

    return undefined;
}

enum Action {
    Identity,
    Replace,
    Delete,
    Insert,
    Swap,
    CompoundWord,
    WordBreak,
}

interface Edge {
    /** from */
    p: Path;
    /** to Node */
    n: TrieNode;
    /** index into the original word */
    i: number;
    /** suffix character to add to Path p.  */
    s: string;
    /** edge cost */
    c: number;
    /** Action */
    a: Action;
    /** Optional Transform */
    t?: string | undefined;
}

interface Path {
    /** Edge taken to get here */
    e: Edge | undefined;
    /** to Node */
    n: TrieNode;
    /** index into the original word */
    i: number;
    /** Suggested word so far */
    w: string;
    /** cost so far */
    g: number;
    /** active */
    a: boolean;
    /** Edges to be resolved. */
    r: Set<Edge> | undefined;
}

interface Suffix {
    /** suffix */
    s: string;
    /** Cost of using suffix */
    c: number;
}

interface LocationNode {
    /** Incoming Paths */
    in: Map<string, Path>;
    /** Edges to Resolve when Location is Resolved */
    er: Edge[];
    /** Best Possible cost - only non-zero when location has been resolved. */
    bc: number;
    /** Pending Path to be resolved */
    p: Path;
    /**
     * Suffix Base Cost
     * The base cost used when calculating the suffixes.
     * If a new path comes in with a lower base cost,
     * then the suffixes need to be recalculated.
     */
    sbc: number;
    /** Set of suffixes, calculated when location has been resolved. */
    sfx: Suffix[];
}

type LocationByTriNode = Map<TrieNode, LocationNode>;

type LocationCache = Map<number, LocationByTriNode>;

type Candidate = Path;

type NoFollow = Record<string, true | undefined>;

interface EmitWord {
    word: string;
    cost: number;
}

interface EdgeToResolve {
    edge: Edge;
    suffixes: Suffix[];
}

const defaultMaxNumberSuggestions = 10;
const maxNumChanges = 3;

export function suggest(
    root: TrieRoot | TrieRoot[],
    word: string,
    numSuggestions: number = defaultMaxNumberSuggestions,
    compoundMethod: CompoundWordsMethod = CompoundWordsMethod.NONE,
    numChanges: number = maxNumChanges,
    ignoreCase?: boolean
): SuggestionResult[] {
    const collector = suggestionCollector(word, {
        numSuggestions: numSuggestions,
        changeLimit: numChanges,
        includeTies: true,
        ignoreCase,
    });
    const opts: GenSuggestionOptions = {
        compoundMethod,
        ignoreCase: collector.ignoreCase,
        maxNumChanges: collector.maxNumChanges,
    };
    collector.collect(genSuggestions(root, word, opts));
    return collector.suggestions;
}

export function* genSuggestions(
    root: TrieRoot | TrieRoot[],
    word: string,
    options: GenSuggestionOptions
): SuggestionIterator {
    const roots = Array.isArray(root) ? root : [root];
    for (const r of roots) {
        yield* genCompoundableSuggestions(r, word, options);
    }
    return undefined;
}

export function sugGenOptsFromCollector(
    collector: SuggestionCollector,
    compoundMethod = CompoundWordsMethod.NONE
): GenSuggestionOptions {
    const opts: GenSuggestionOptions = {
        compoundMethod,
        ignoreCase: collector.ignoreCase,
        maxNumChanges: collector.maxNumChanges,
    };
    return opts;
}

function determineNoFollow(root: TrieRoot): NoFollow {
    const noFollow: NoFollow = Object.assign(Object.create(null), {
        [root.compoundCharacter]: true,
        [root.forbiddenWordPrefix]: true,
        [root.stripCaseAndAccentsPrefix]: true,
    });
    return noFollow;
}

function determineInitialNodes(root: TrieRoot | TrieRoot[], ignoreCase: boolean): TrieNode[] {
    const roots = Array.isArray(root) ? root : [root];
    const rootNodes: TrieNode[] = roots.map((r) => {
        const noFollow = determineNoFollow(r);
        return { c: new Map([...r.c].filter(([c]) => !noFollow[c])) };
    });
    const noCaseNodes = ignoreCase
        ? roots
              .filter((r) => r.stripCaseAndAccentsPrefix)
              .map((n) => n.c?.get(n.stripCaseAndAccentsPrefix))
              .filter(isDefined)
        : [];
    const nodes: TrieNode[] = rootNodes.concat(noCaseNodes);
    return nodes;
}

function isDefined<T>(v: T | undefined): v is T {
    return v !== undefined;
}
