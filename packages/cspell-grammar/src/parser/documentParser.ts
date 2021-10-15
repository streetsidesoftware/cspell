// import { Grammar } from './grammarDefinition';
// import { NGrammar, Rule } from './grammarNormalized';
// import { normalizeGrammar } from './grammarNormalizer';
// import { DocumentParser, ParsedText, ParseLineResult } from './parser';
// import type { Line, LineOffsetAnchored, MatchResult } from './types';
// import { extractScope } from './grammarNormalizer';
// import { applyCaptureToBeginOrMatch, applyCaptureToEnd } from './processors/procMatchingRule';
// import assert, { AssertionError } from 'assert';

// interface LineOffset {
//     text: string;
//     offset: number;
// }

// class DocumentParserFromGrammar implements DocumentParser {
//     constructor(readonly grammar: NGrammar) {}
//     parse(line: string): ParseLineResult {}
// }

// export function createDocumentParser(grammar: Grammar): DocumentParser {
//     return new DocumentParserFromGrammar(normalizeGrammar(grammar));
// }

// export function parseLine(line: Line, rule: Rule): ParseLineResult {
//     const text = line.text;
//     const lineLen = line.text.length;
//     const parsedText: ParsedText[] = [];

//     let ctx = buildContext(line, rule);
//     let ln = ctx.line;

//     // Note: the begin rule has already been matched and applied.
//     // Does it need to end or go deeper?

//     while (ctx.line.offset < lineLen) {
//         const { line, rule, endMatch } = ctx;
//         // We are at an end
//         if (endMatch?.index === line.offset) {
//             if (ln.offset < line.offset) {
//                 const scope = extractScope(rule);
//                 const offset = ln.offset;
//                 parsedText.push({
//                     scope,
//                     text: text.slice(offset, line.offset),
//                     offset,
//                 });
//             }
//             parsedText.push(...applyCaptureToEnd(rule, endMatch));
//             ctx = must(ctx.parent);
//             ctx.line.offset = endMatch.index + endMatch.match.length;
//             ln = ctx.line;
//         }

//         const m = rule.pattern.find(ctx.line, rule);
//         const atEnd = determineEnd(ln, rule);
//         pushText(find.match.index);
//         find = pattern.find();
//     }

//     // We are at the end of the line.
//     // Did the end match?
//     if (ctx.endMatch) {
//     }

//     return {
//         parsedText,
//         parse: () => {},
//     };
// }

// function determineEnd(ln: LineOffset, rule: Rule): MatchResult | undefined {}

// interface Context {
//     line: LineOffsetAnchored;
//     rule: Rule;
//     endMatch?: MatchResult;
//     parent?: Context;
// }

// function buildContext(line: Line, rule: Rule): Context {
//     const rules = calcRuleStack(rule);
//     const numRules = rules.length;
//     const rootNum = numRules - 1;
//     const rootRule = rules[rootNum];

//     const rootContext: Context = {
//         line: { ...line, offset: 0, anchor: -1 },
//         rule: rootRule,
//     };

//     let ctx = rootContext;
//     for (let i = rootNum - 1; i >= 0; --i) {
//         const rule = rules[i];
//         const line = ctx.line;
//         const endMatch = rule.end?.(line);
//         ctx = {
//             line,
//             rule,
//             endMatch,
//             parent: ctx,
//         };
//         if (endMatch?.index === line.offset) break;
//     }

//     return ctx;
// }

// function calcRuleStack(rule: Rule) {
//     const rules: Rule[] = [];
//     let r: Rule | undefined = rule;
//     while (r) {
//         rules.push(r);
//         r = r.parent;
//     }
//     return rules;
// }

// function must<T>(t: T | undefined, msg = 'Must be defined'): T {
//     assert(t !== undefined && t !== null, msg);
//     return t;
// }
