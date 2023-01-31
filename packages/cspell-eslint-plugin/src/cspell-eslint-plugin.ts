// cspell:ignore TSESTree
import { refreshDictionaryCache } from 'cspell-lib';
import type { Rule } from 'eslint';
import * as path from 'path';

import optionsSchema from './_auto_generated_/options.schema.json';
import { addWordToCustomWordList } from './customWordList';
import type { CustomWordListFile } from './options';
import { normalizeOptions } from './options';
import { type Issue, spellCheck, walkTree } from './worker';

const schema = optionsSchema as unknown as Rule.RuleMetaData['schema'];

interface PluginRules {
    ['spellchecker']: Rule.RuleModule;
}

const messages = {
    wordUnknown: 'Unknown word: "{{word}}"',
    wordForbidden: 'Forbidden word: "{{word}}"',
    suggestWord: '{{word}}',
    addWordToDictionary: 'Add "{{word}}" to {{dictionary}}',
} as const;

type Messages = typeof messages;
type MessageIds = keyof Messages;

const meta: Rule.RuleMetaData = {
    docs: {
        description: 'CSpell spellchecker',
        category: 'Possible Errors',
        recommended: false,
    },
    messages,
    hasSuggestions: true,
    schema: [schema],
};

let isDebugMode = false;
function log(...args: Parameters<typeof console.log>) {
    if (!isDebugMode) return;
    console.log(...args);
}

const debugTree = false;

function dumpTree(context: Rule.RuleContext) {
    if (!debugTree) return;

    walkTree(context.getSourceCode().ast, function (node, _parent, key) {
        const withValue: { type: string; value?: unknown } = node;
        console.log('key: %o, node: %o', key, { type: node.type, value: withValue.value });
    });
}

function create(context: Rule.RuleContext): Rule.RuleListener {
    const options = normalizeOptions(context.options[0], context.getCwd());
    isDebugMode = options.debugMode || false;
    isDebugMode && logContext(context);

    dumpTree(context);

    function reportIssue(issue: Issue) {
        const messageId: MessageIds = issue.severity === 'Forbidden' ? 'wordForbidden' : 'wordUnknown';
        const { word, start, end } = issue;
        const data = {
            word,
        };
        const code = context.getSourceCode();
        const startPos = code.getLocFromIndex(start);
        const endPos = code.getLocFromIndex(end);
        const loc = { start: startPos, end: endPos };

        function fixFactory(word: string): Rule.ReportFixer {
            return (fixer) => fixer.replaceTextRange([start, end], word);
        }

        function createSug(word: string): Rule.SuggestionReportDescriptor {
            const data = { word };
            const messageId: MessageIds = 'suggestWord';

            return {
                messageId,
                data,
                fix: fixFactory(word),
            };
        }

        function createAddWordToDictionaryFix(word: string): Rule.SuggestionReportDescriptor | undefined {
            if (!isCustomWordListFile(options.customWordListFile) || !options.customWordListFile.addWords) {
                return undefined;
            }

            const dictFile = path.resolve(context.getCwd(), options.customWordListFile.path);

            const data = { word, dictionary: path.basename(dictFile) };
            const messageId: MessageIds = 'addWordToDictionary';

            return {
                messageId,
                data,
                fix: (_fixer) => {
                    // This wrapper is a hack to delay applying the fix until it is actually used.
                    // But it is not reliable, since ESLint + extension will randomly read the value.
                    return new WrapFix({ range: [start, end], text: word }, () => {
                        refreshDictionaryCache(0);
                        addWordToCustomWordList(dictFile, word);
                    });
                },
            };
        }

        log('Suggestions: %o', issue.suggestions);
        const suggestions: Rule.ReportDescriptorOptions['suggest'] = issue.suggestions?.map(createSug);
        const addWordFix = createAddWordToDictionaryFix(issue.word);

        const suggest =
            suggestions || addWordFix ? (suggestions || []).concat(addWordFix ? [addWordFix] : []) : undefined;

        const des: Rule.ReportDescriptor = {
            messageId,
            data,
            loc,
            suggest,
        };
        context.report(des);
    }

    function checkProgram() {
        const sc = context.getSourceCode();
        const issues = spellCheck(context.getFilename(), sc.text, sc.ast, options);
        issues.forEach((issue) => reportIssue(issue));
    }

    return { Program: checkProgram };
}

export const rules: PluginRules = {
    spellchecker: {
        meta,
        create,
    },
};

function logContext(context: Rule.RuleContext) {
    log('\n\n************************');
    // log(context.getSourceCode().text);
    log(`

id: ${context.id}
cwd: ${context.getCwd()}
filename: ${context.getFilename()}
physicalFilename: ${context.getPhysicalFilename()}
scope: ${context.getScope().type}
`);
}

export const configs = {
    recommended: {
        plugins: ['@cspell'],
        rules: {
            '@cspell/spellchecker': ['warn', {}],
        },
    },
    debug: {
        plugins: ['@cspell'],
        rules: {
            '@cspell/spellchecker': ['warn', { debugMode: true }],
        },
    },
};

/**
 * This wrapper is used to add a
 */
class WrapFix implements Rule.Fix {
    /**
     *
     * @param fix - the example Fix
     * @param onGetText - called when `fix.text` is accessed
     * @param limit - limit the number of times onGetText is called. Set it to `-1` for infinite.
     */
    constructor(private fix: Rule.Fix, private onGetText: () => void, private limit = 1) {}

    get range() {
        return this.fix.range;
    }

    get text() {
        if (this.limit) {
            this.limit--;
            this.onGetText();
        }
        return this.fix.text;
    }
}

function isCustomWordListFile(value: string | CustomWordListFile | undefined): value is CustomWordListFile {
    return !!value && typeof value === 'object';
}
