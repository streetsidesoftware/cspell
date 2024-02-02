import { DefaultMaxDepth } from './affConstants.js';
import type { AffixWord, AffRule, AffSubstitution, AffSubstitutionsForRegExp, FxRule } from './AffData.js';
import { AffData, joinRules } from './AffData.js';
import type { AffInfo } from './affDef.js';
import { AffixFlags } from './AffixFlags.js';
import { Converter } from './converter.js';
import { filterOrderedList } from './util.js';

/** The `word` field in a Converted AffWord has been converted using the OCONV mapping */
export interface ConvertedAffixWord extends AffixWord {
    originalWord: string;
}

const debug = false;

export function logError(msg: string, ...args: unknown[]) {
    debug && console.error(msg, ...args);
}

export class Aff {
    protected affData: AffData;
    protected _oConv: Converter;
    protected _iConv: Converter;
    private _maxSuffixDepth = DefaultMaxDepth;
    protected _cacheCombinableRules = new WeakMap<FxRule[], FxRule[]>();

    constructor(
        readonly affInfo: AffInfo,
        filename: string,
    ) {
        this.affData = new AffData(affInfo, filename);
        this._iConv = new Converter(affInfo.ICONV || []);
        this._oConv = new Converter(affInfo.OCONV || []);
    }

    public get maxSuffixDepth() {
        return this._maxSuffixDepth;
    }

    public set maxSuffixDepth(value: number) {
        this._maxSuffixDepth = value;
    }

    /**
     * Takes a line from a hunspell.dic file and applies the rules found in the aff file.
     * For performance reasons, only the `word` field is mapped with OCONV.
     * @param {string} line - the line from the .dic file.
     */
    applyRulesToDicEntry(line: string, maxDepth?: number): ConvertedAffixWord[] {
        const afWord = this.affData.dictLineToAffixWord(line);
        const maxSuffixDepth = maxDepth ?? this.maxSuffixDepth;
        const convert = this._oConv.convert;
        const results = this.applyRulesToWord(afWord, maxSuffixDepth).map((affWord) => ({
            ...affWord,
            word: convert(affWord.word),
            originalWord: affWord.word,
        }));
        results.sort(compareAff);
        const filtered = results.filter(filterAff());
        return filtered;
    }

    // cspell:ignore COMPOUNDMIN

    /**
     * @internal
     */
    applyRulesToWord(affWord: AffixWord, remainingDepth: number): AffixWord[] {
        const compoundMin = this.affInfo.COMPOUNDMIN ?? 3;
        const { word, flags, dict, appliedRules } = affWord;
        const wordWithFlags: AffixWord = { word, rules: undefined, flags, dict, appliedRules };
        return [wordWithFlags, ...this.applyAffixesToWord(affWord, remainingDepth)]
            .filter(({ flags }) => !(flags & AffixFlags.isNeedAffix))
            .map((affWord) => adjustCompounding(affWord, compoundMin));
    }

    applyAffixesToWord(affWord: AffixWord, remainingDepth: number): AffixWord[] {
        if (remainingDepth <= 0 || !affWord.rules) {
            return [];
        }
        const rules = affWord.rules;
        const combinableSfx = this.#calcCombinableSfxRules(rules);
        const r = affWord.rules
            .flatMap((affix) => this.applyAffixToWord(affix, affWord, combinableSfx))
            .flatMap((affWord) => this.applyRulesToWord(affWord, remainingDepth - 1));
        return r;
    }

    applyAffixToWord(rule: FxRule, affWord: AffixWord, combinableSfx: FxRule[]): AffixWord[] {
        const { word } = affWord;
        const combineRules = rule.type === 'P' && rule.fx.combinable ? combinableSfx : [];
        const flags = affWord.flags & ~AffixFlags.isNeedAffix;
        const matchingSubstitutions = rule.fx.substitutionsForRegExps.filter((sub) => sub.match.test(word));
        const source = {
            dict: affWord.dict,
            appliedRules: affWord.appliedRules ? [...affWord.appliedRules, rule.idx] : undefined,
        };
        const partialAffWord = this.affData.toAffixWord(source, word, flags, combineRules);
        return matchingSubstitutions.flatMap((sub) => this.#applySubstitution(partialAffWord, sub));
    }

    #substituteAttach(affWord: AffixWord, sub: AffSubstitution, stripped: string): AffixWord {
        const { flags } = affWord;
        const subRules = this.affData.getRulesForAffSubstitution(sub);
        const rules = joinRules(affWord.rules, subRules);
        let word: string;
        if (sub.type === 'S') {
            word = stripped + sub.attach;
        } else {
            word = sub.attach + stripped;
        }
        return this.affData.toAffixWord(affWord, word, flags, rules);
    }

    #applySubstitution(affWord: AffixWord, subs: AffSubstitutionsForRegExp): AffixWord[] {
        const results: AffixWord[] = [];
        for (const [replace, substitutions] of subs.substitutionsGroupedByRemove) {
            if (!replace.test(affWord.word)) continue;
            const stripped = affWord.word.replace(replace, '');
            for (const sub of substitutions) {
                results.push(this.#substituteAttach(affWord, sub, stripped));
            }
        }
        return results;
    }

    getMatchingRules(flags: string): AffRule[] {
        const rules = this.affData.getRules(flags);
        return rules;
    }

    /**
     * Convert the applied rule indexes to AFF Letters.
     * Requires that the affixWord was generated with trace mode turned on.
     * @param affixWord - the generated AffixWord.
     */
    getFlagsValuesForAffixWord(affixWord: AffixWord): string[] | undefined {
        const rules = this.affData.getRulesForIndexes(affixWord.appliedRules);
        return rules?.map((r) => r.id);
    }

    get iConv() {
        return this._iConv;
    }

    get oConv() {
        return this._oConv;
    }

    setTraceMode(value: boolean) {
        this.affData.trace = value;
    }

    #calcCombinableSfxRules(rules: FxRule[]): FxRule[] {
        const found = this._cacheCombinableRules.get(rules);
        if (found) return found;
        const combinable = rules.filter((r) => r.fx.combinable && r.type === 'S');
        this._cacheCombinableRules.set(rules, combinable);
        return combinable;
    }
}

export function compareAff(a: AffixWord, b: AffixWord): number {
    return a.word < b.word ? -1 : a.word > b.word ? 1 : a.flags - b.flags;
}

/**
 * Returns a filter function that will filter adjacent AffWords
 * It compares the word and the flags.
 */
function filterAff() {
    return filterOrderedList<AffixWord>((a, b) => a.word !== b.word || a.flags !== b.flags);
}

function adjustCompounding(affWord: AffixWord, minLength: number): AffixWord {
    if (!(affWord.flags & AffixFlags.isCompoundPermitted) || affWord.word.length >= minLength) {
        return affWord;
    }
    affWord.flags &= ~AffixFlags.isCompoundPermitted;
    return affWord;
}
