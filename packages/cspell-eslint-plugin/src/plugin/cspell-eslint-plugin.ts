// cspell:ignore TSESTree
import type { Rule } from 'eslint';
import { readFileSync } from 'fs';
import { join as pathJoin } from 'path';
import { createSyncFn } from 'synckit';

import type { Issue, SpellCheckSyncFn } from '../worker/spellCheck.mjs';
import { normalizeOptions } from './defaultCheckOptions';

const optionsSchema = JSON.parse(readFileSync(pathJoin(__dirname, '../../assets/options.schema.json'), 'utf8'));

const schema = optionsSchema as unknown as Rule.RuleMetaData['schema'];

const spellCheck: SpellCheckSyncFn = createSyncFn(require.resolve('../worker/worker.mjs'), undefined, 30000);

interface ExtendedSuggestion {
    /**
     * The suggestion.
     */
    word: string;
    /**
     * The word is preferred above others, except other "preferred" words.
     */
    isPreferred?: boolean;
    /**
     * The suggested word adjusted to match the original case.
     */
    wordAdjustedToMatchCase?: string;
}

interface PluginRules {
    ['spellchecker']: Rule.RuleModule;
}

const messages = {
    wordUnknown: 'Unknown word: "{{word}}"',
    wordForbidden: 'Forbidden word: "{{word}}"',
    suggestWord: '{{word}}{{preferred}}',
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
    fixable: 'code',
    schema: [schema],
};

let isDebugMode = false;
function log(...args: Parameters<typeof console.log>) {
    if (!isDebugMode) return;
    console.log(...args);
}

function nullFix(): null {
    return null;
}

function create(context: Rule.RuleContext): Rule.RuleListener {
    const options = normalizeOptions(context.options[0], context.getCwd());
    const autoFix = options.autoFix;
    isDebugMode = options.debugMode || false;
    isDebugMode && logContext(context);

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

        function createSug(sug: ExtendedSuggestion): Rule.SuggestionReportDescriptor {
            const word = sug.wordAdjustedToMatchCase || sug.word;
            const preferred = sug.isPreferred ? '*' : '';
            const data = { word, preferred };
            const messageId: MessageIds = 'suggestWord';

            return {
                messageId,
                data,
                fix: fixFactory(word),
            };
        }

        log('Suggestions: %o', issue.suggestions);

        const fixable = issue.suggestions?.filter((sug) => !!sug.isPreferred);
        const canFix = fixable?.length === 1;
        const preferredSuggestion = autoFix && canFix && fixable[0];
        const fix = preferredSuggestion
            ? fixFactory(preferredSuggestion.wordAdjustedToMatchCase || preferredSuggestion.word)
            : nullFix;
        const suggestions: Rule.ReportDescriptorOptions['suggest'] = issue.suggestions?.map((sug) => createSug(sug));
        const suggest = suggestions;

        const des: Rule.ReportDescriptor = {
            messageId,
            data,
            loc,
            suggest,
            fix,
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
