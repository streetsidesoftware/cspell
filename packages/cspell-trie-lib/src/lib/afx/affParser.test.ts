import { describe, expect, test } from 'vitest';

import { unindent } from '../utils/unindent.ts';
import { parseAff, parseAffRule } from './affParser.ts';

describe('parseAff', () => {
    test('should parse affix rules from an aff string', () => {
        const affWithShortRules = unindent`
            SFX D Y 4
            SFX D   0     d          e
            SFX D   y     ied        [^aeiou]y
            SFX D   0     ed         [^ey]
            SFX D   0     ed         [aeiou]y

            PFX A N 1
            PFX A   0     un         .
            SFX R Y 4
            SFX R   0     r          e
            SFX R   y     ier        [^aeiou]y
            SFX R   0     er         [aeiou]y
            SFX R   0     er         [^ey]

            SFX Z Y 4
            SFX Z   0     r/S         e
            SFX Z   y     ier/S       [^aeiou]y
            SFX Z   0     er/S        [aeiou]y
            SFX Z   0     er/S        [^ey]

            SFX S Y 4
            SFX S   y     ies        [^aeiou]y
            SFX S   0     s          [aeiou]y
            SFX S   0     es         [sxzh]
            SFX S   0     s          [^sxzhy]

            SFX G Y 2
            SFX G   e     ing        e
            SFX G   0     ing        [^e]

            SFX J Y 2
            SFX J   e     ing/S       e
            SFX J   0     ing/S       [^e]
        `;

        const affString = affWithShortRules;
        const affDef = parseAff(affString);

        expect(affDef.wordRulesFormat).toBeDefined();
        expect(affDef.wordRulesFormat).toBe('');

        expect(Object.entries(affDef.rules)).toHaveLength(7);

        const sfxRuleD = affDef.rules['D'];
        expect(sfxRuleD.type).toBe('S');
        expect(sfxRuleD.mutations).toHaveLength(4);

        const pfxRuleA = affDef.rules['A'];
        expect(pfxRuleA.type).toBe('P');
        expect(pfxRuleA.mutations).toHaveLength(1);

        const sfxRuleZ = affDef.rules['Z'];
        expect(sfxRuleZ.type).toBe('S');
        expect(sfxRuleZ.mutations).toHaveLength(4);
        expect(sfxRuleZ.mutations[0].attach).toBe('r');
        expect(sfxRuleZ.mutations[0].apply).toEqual(['S']);
    });

    test('should parse affix rules from an aff string (long)', () => {
        const affWithShortRules = unindent`
            FLAG long

            SFX DD Y 4
            SFX DD   0     d          e
            SFX DD   y     ied        [^aeiou]y
            SFX DD   0     ed         [^ey]
            SFX DD   0     ed         [aeiou]y

            PFX AA N 1
            PFX AA   0     un         .
            SFX RR Y 4
            SFX RR   0     r          e
            SFX RR   y     ier        [^aeiou]y
            SFX RR   0     er         [aeiou]y
            SFX RR   0     er         [^ey]

            SFX ZZ Y 4
            SFX ZZ   0     r/SS         e
            SFX ZZ   y     ier/SS       [^aeiou]y
            SFX ZZ   0     er/SS        [aeiou]y
            SFX ZZ   0     er/SSDD      [^ey]           # cspell:ignore SSDD

            SFX SS Y 4
            SFX SS   y     ies        [^aeiou]y
            SFX SS   0     s          [aeiou]y
            SFX SS   0     es         [sxzh]
            SFX SS   0     s          [^sxzhy]

            SFX GG Y 2
            SFX GG   e     ing        e
            SFX GG   0     ing        [^e]

            SFX JJ Y 2
            SFX JJ   e     ing/SS       e
            SFX JJ   0     ing/SS       [^e]
        `;

        const affString = affWithShortRules;
        const affDef = parseAff(affString);

        expect(affDef.wordRulesFormat).toBeDefined();
        expect(affDef.wordRulesFormat).toBe('..');

        expect(Object.entries(affDef.rules)).toHaveLength(7);

        const sfxRuleD = affDef.rules['DD'];
        expect(sfxRuleD.type).toBe('S');
        expect(sfxRuleD.mutations).toHaveLength(4);

        const pfxRuleA = affDef.rules['AA'];
        expect(pfxRuleA.type).toBe('P');
        expect(pfxRuleA.mutations).toHaveLength(1);

        const sfxRuleZ = affDef.rules['ZZ'];
        expect(sfxRuleZ.type).toBe('S');
        expect(sfxRuleZ.mutations).toHaveLength(4);
        expect(sfxRuleZ.mutations[0].attach).toBe('r');
        expect(sfxRuleZ.mutations[0].apply).toEqual(['SS']);
        expect(sfxRuleZ.mutations[3].attach).toBe('er');
        expect(sfxRuleZ.mutations[3].apply).toEqual(['SS', 'DD']);
    });

    test('should parse affix rules from an aff string (num)', () => {
        const affWithShortRules = unindent`
            FLAG num

            SFX 1004 Y 4
            SFX 1004   0     d          e
            SFX 1004   y     ied        [^aeiou]y
            SFX 1004   0     ed         [^ey]
            SFX 1004   0     ed         [aeiou]y

            PFX 1001 N 1
            PFX 1001   0     un         .
            SFX 1010 Y 4
            SFX 1010   0     r          e
            SFX 1010   y     ier        [^aeiou]y
            SFX 1010   0     er         [aeiou]y
            SFX 1010   0     er         [^ey]

            SFX 1011 Y 4
            SFX 1011   0     r/1100         e
            SFX 1011   y     ier/1100       [^aeiou]y
            SFX 1011   0     er/1100        [aeiou]y
            SFX 1011   0     er/1100,1004   [^ey]

            SFX 1100 Y 4
            SFX 1100   y     ies        [^aeiou]y
            SFX 1100   0     s          [aeiou]y
            SFX 1100   0     es         [sxzh]
            SFX 1100   0     s          [^sxzhy]

            SFX 1020 Y 2
            SFX 1020   e     ing        e
            SFX 1020   0     ing        [^e]

            SFX 1021 Y 2
            SFX 1021   e     ing/1100       e
            SFX 1021   0     ing/1100       [^e]
        `;

        const affString = affWithShortRules;
        const affDef = parseAff(affString);

        expect(affDef.wordRulesFormat).toBeDefined();
        expect(affDef.wordRulesFormat).toBe(',');

        expect(Object.entries(affDef.rules)).toHaveLength(7);

        const sfxRuleD = affDef.rules['1004'];
        expect(sfxRuleD.type).toBe('S');
        expect(sfxRuleD.mutations).toHaveLength(4);

        const pfxRuleA = affDef.rules['1001'];
        expect(pfxRuleA.type).toBe('P');
        expect(pfxRuleA.mutations).toHaveLength(1);

        const sfxRuleZ = affDef.rules['1011'];
        expect(sfxRuleZ.type).toBe('S');
        expect(sfxRuleZ.mutations).toHaveLength(4);
        expect(sfxRuleZ.mutations[0].attach).toBe('r');
        expect(sfxRuleZ.mutations[0].apply).toEqual(['1100']);
        expect(sfxRuleZ.mutations[3].attach).toBe('er');
        expect(sfxRuleZ.mutations[3].apply).toEqual(['1100', '1004']);
    });
});

describe('parseAffRule', () => {
    test('should parse a simple SFX rule', () => {
        const content = unindent`
            SFX S Y 4
            SFX S   y     ies        [^aeiou]y
            SFX S   0     s          [aeiou]y
            SFX S   0     es         [sxzh]
            SFX S   0     s          [^sxzhy]
        `;
        const rule = parseAffRule(content);
        expect(rule).toBeDefined();
        expect(rule?.type).toBe('S');
        expect(rule?.id).toBe('S');
        expect(rule?.mutations).toHaveLength(4);
    });

    test('should return undefined for non-rule content', () => {
        const content = unindent`\
            This is not a valid affix rule.
            It should return undefined when parsed.
        `;
        const rule = parseAffRule(content);
        expect(rule).toBeUndefined();
    });
});

// cspell:ignore aeiou sxzh sxzhy ings
