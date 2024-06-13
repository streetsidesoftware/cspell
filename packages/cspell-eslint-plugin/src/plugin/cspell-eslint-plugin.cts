// cspell:ignore TSESTree
import { readFileSync } from 'node:fs';
import { join as pathJoin } from 'node:path';

import type { ESLint, Rule } from 'eslint';
import type { Program } from 'estree';
import { createSyncFn } from 'synckit';

import { getDefaultLogger } from '../common/logger.cjs';
import type { Issue, SpellCheckFn } from '../worker/types.cjs';
import { normalizeOptions } from './defaultCheckOptions.cjs';

type ESlintPlugin = ESLint.Plugin;

const optionsSchema = JSON.parse(readFileSync(pathJoin(__dirname, '../../assets/options.schema.json'), 'utf8'));

const schema = optionsSchema as unknown as Rule.RuleMetaData['schema'];

// eslint-disable-next-line n/no-missing-require
const spellCheck = createSyncFn<SpellCheckFn>(require.resolve('../worker/worker.mjs'), 30_000);

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

const messages = {
    wordUnknown: 'Unknown word: "{{word}}"',
    wordForbidden: 'Forbidden word: "{{word}}"',
    suggestWord: '{{word}}{{preferred}}',
} as const;

type Messages = typeof messages;
type MessageIds = keyof Messages;

const ruleMeta: Rule.RuleMetaData = {
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

function nullFix(): null {
    // eslint-disable-next-line unicorn/no-null
    return null;
}

function create(context: Rule.RuleContext): Rule.RuleListener {
    const logger = getDefaultLogger();
    const log = logger.log;
    const options = normalizeOptions(context.options[0], context.cwd || context.getCwd());
    const autoFix = options.autoFix;
    isDebugMode = options.debugMode ?? isDebugMode;
    logger.enabled = options.debugMode ?? (logger.enabled || isDebugMode);
    logContext(log, context);

    function reportIssue(issue: Issue) {
        const messageId: MessageIds = issue.severity === 'Forbidden' ? 'wordForbidden' : 'wordUnknown';
        const { word, start, end } = issue;
        const data = {
            word,
        };
        const code = contextSourceCode(context);
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

        // log('Suggestions: %o', issue.suggestions);

        const issueSuggestions = issue.suggestions;
        const fixable = issueSuggestions?.filter((sug) => !!sug.isPreferred);
        const canFix = fixable?.length === 1;
        const preferredSuggestion = autoFix && canFix && fixable[0];
        const fix = preferredSuggestion
            ? fixFactory(preferredSuggestion.wordAdjustedToMatchCase || preferredSuggestion.word)
            : nullFix;
        const suggestions: Rule.ReportDescriptorOptions['suggest'] = issueSuggestions?.map((sug) => createSug(sug));
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

    function checkProgram(_node: Program) {
        const filename = context.filename || context.getFilename();
        const sc = context.sourceCode || context.getSourceCode();
        if (!sc) return;
        const { issues, errors } = spellCheck(filename, sc.text, sc.ast, options);
        if (errors && errors.length) {
            log(
                'errors: %o',
                errors.map((e) => e.message),
            );
            errors.forEach((error) => console.error('%s', error.message));
        }
        issues.forEach((issue) => reportIssue(issue));
    }

    return { Program: checkProgram };
}

const spellchecker: Rule.RuleModule = {
    meta: ruleMeta,
    create,
};

export const rules: { spellchecker: Rule.RuleModule } = {
    spellchecker,
} satisfies ESlintPlugin['rules'];

function logContext(log: typeof console.log, context: Rule.RuleContext) {
    log('context: %o', {
        id: context.id,
        cwd: context.cwd,
        filename: context.filename,
        physicalFilename: context.physicalFilename,
        // scope: context.getScope().type,
        options: context.options.length === 1 ? context.options[0] : context.options,
    });
}

function contextSourceCode(context: Rule.RuleContext): Rule.RuleContext['sourceCode'] {
    return context.sourceCode || context.getSourceCode();
}

export const meta = { name: '@cspell' } as const;

const recommended: ESLint.ConfigData = {
    plugins: ['@cspell'],
    rules: {
        '@cspell/spellchecker': ['warn', {}],
    },
};

const debugConfig: ESLint.ConfigData = {
    plugins: ['@cspell'],
    rules: {
        '@cspell/spellchecker': ['warn', { debugMode: true }],
    },
};

export const configs: ESlintPlugin['configs'] = {
    debug: debugConfig,
    'debug-legacy': debugConfig,
    recommended,
    'recommended-legacy': recommended,
};

export const plugin = { rules, configs, meta } satisfies ESlintPlugin;
