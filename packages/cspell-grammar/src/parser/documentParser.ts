// import { Grammar, Pattern, PatternMatch } from './grammarDefinition';
// import { Rule, NGrammar, NPattern, MatchResult, MatchingRule } from './grammarNormalized';
// import { normalizeGrammar } from './grammarNormalizer';
// import { DocumentParser, ParsedText, ParseLineResult } from './parser';

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

// interface Stack {
//     scope: string | undefined;
//     parent: Stack | undefined;
// }

// export function parseLine(line: string, rule: Rule): ParseLineResult {
//     const ln = { line, offset: 0 };

//     let find: Rule | undefined = rule.find(ln, undefined);
//     const root: Stack = {
//         scope: grammar.scopeName,
//         parent: undefined,
//     };
//     let stack = root;

//     while (ln.offset < line.length && find) {
//         pushText(find.match.index);
//         find = pattern.find();
//     }

//     pushText(line.length);

//     function pushText(index: number) {
//         if (ln.offset < index) {
//             parsedText.push({
//                 scope: stackToScope(),
//                 text: ln.line.slice(ln.offset, index),
//                 offset: ln.offset,
//             });
//             ln.offset = index;
//         }
//     }

//     function stackToScope(): string[] {
//         const scope: string[] = [];
//         for (let s: Stack | undefined = stack; s; s = s.parent) {
//             s.scope && scope.push(s.scope);
//         }
//         return scope;
//     }

//     return {
//         parsedText,
//         parse: () => {},
//     };
// }
