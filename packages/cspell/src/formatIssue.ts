import type { Issue } from '@cspell/cspell-types';
import type { ChalkInstance } from 'chalk';
import { Chalk } from 'chalk';
import { makeTemplate } from 'chalk-template';

import { ApplicationError } from './util/errors.js';

export interface TemplateSubstitutions extends Record<string, string> {
    $col: string;
    $contextFull: string;
    $contextLeft: string;
    $contextRight: string;
    $filename: string;
    $padContext: string;
    $padRowCol: string;
    $row: string;
    $suggestions: string;
    $text: string;
    $uri: string;
    $quickFix: string;
    $message: string;
    $messageColored: string;
}

export interface ReporterIssue extends Issue {
    filename: string;
}

export interface IOChalk {
    readonly chalk: ChalkInstance;
}

export function formatIssue(io: IOChalk, templateStr: string, issue: ReporterIssue, maxIssueTextWidth: number): string {
    function clean(t: string) {
        return t.replace(/\s+/, ' ');
    }
    const { uri = '', filename, row, col, text, context = issue.line, offset } = issue;
    const textLen = issue.length ?? text.length;
    const contextLeft = clean(context.text.slice(0, offset - context.offset));
    const contextRight = clean(context.text.slice(offset + textLen - context.offset));
    const contextFull = clean(context.text);
    const padContext = ' '.repeat(Math.max(maxIssueTextWidth - text.length, 0));
    const rowText = row.toString();
    const colText = col.toString();
    const padRowCol = ' '.repeat(Math.max(1, 8 - (rowText.length + colText.length)));
    const suggestions = formatSuggestions(io, issue);
    const msg = issue.message || (issue.isFlagged ? 'Forbidden word' : 'Unknown word');
    const messageColored = issue.isFlagged ? `{yellow ${msg}}` : msg;

    const substitutions = {
        $col: colText,
        $contextFull: contextFull,
        $contextLeft: contextLeft,
        $contextRight: contextRight,
        $filename: filename,
        $padContext: padContext,
        $padRowCol: padRowCol,
        $row: rowText,
        $suggestions: suggestions,
        $text: text,
        $uri: uri,
        $quickFix: formatQuickFix(io, issue),
        $message: msg,
        $messageColored: messageColored,
    };

    const t = templateStr.replaceAll('$messageColored', messageColored);
    const chalkTemplate = makeTemplate(io.chalk);
    return substitute(chalkTemplate(t), substitutions).trimEnd();
}

function formatSuggestions(io: IOChalk, issue: Issue): string {
    if (issue.suggestionsEx) {
        return issue.suggestionsEx
            .map((sug) =>
                sug.isPreferred
                    ? io.chalk.italic(io.chalk.bold(sug.wordAdjustedToMatchCase || sug.word)) + '*'
                    : sug.wordAdjustedToMatchCase || sug.word,
            )
            .join(', ');
    }
    return issue.suggestions ? issue.suggestions.join(', ') : '';
}

function formatQuickFix(io: IOChalk, issue: Issue): string {
    if (!issue.suggestionsEx?.length) return '';
    const preferred = issue.suggestionsEx
        .filter((sug) => sug.isPreferred)
        .map((sug) => sug.wordAdjustedToMatchCase || sug.word);
    if (!preferred.length) return '';
    const fixes = preferred.map((w) => io.chalk.italic(io.chalk.yellow(w)));
    return `fix: (${fixes.join(', ')})`;
}

function substitute(text: string, substitutions: TemplateSubstitutions): string {
    type SubRange = [number, number, string];
    const subs: SubRange[] = [];

    for (const [match, replaceWith] of Object.entries(substitutions)) {
        const len = match.length;
        for (let i = text.indexOf(match); i >= 0; i = text.indexOf(match, i)) {
            const end = i + len;
            const reg = /\b/y;
            reg.lastIndex = end;
            if (reg.test(text)) {
                subs.push([i, end, replaceWith]);
            }
            i = end;
        }
    }

    subs.sort((a, b) => a[0] - b[0]);

    let i = 0;
    function sub(r: SubRange): string {
        const [a, b, t] = r;
        const prefix = text.slice(i, a);
        i = b;
        return prefix + t;
    }

    const parts = subs.map(sub);
    return parts.join('') + text.slice(i);
}

export function checkTemplate(template: string): true | Error {
    const chalk = new Chalk();
    const chalkTemplate = makeTemplate(chalk);
    const substitutions: TemplateSubstitutions = {
        $col: '<col>',
        $contextFull: '<contextFull>',
        $contextLeft: '<contextLeft>',
        $contextRight: '<contextRight>',
        $filename: '<filename>',
        $padContext: '<padContext>',
        $padRowCol: '<padRowCol>',
        $row: '<row>',
        $suggestions: '<suggestions>',
        $text: '<text>',
        $uri: '<uri>',
        $quickFix: '<quickFix>',
        $message: '<message>',
        $messageColored: '<messageColored>',
    };

    try {
        const t = chalkTemplate(template);
        const result = substitute(t, substitutions);
        const problems = [...result.matchAll(/\$[a-z]+/gi)].map((m) => m[0]);
        if (problems.length) {
            throw new Error(
                `Unresolved template variable${problems.length > 1 ? 's' : ''}: ${problems.map((v) => `'${v}'`).join(', ')}`,
            );
        }
        return true;
    } catch (e) {
        const msg = e instanceof Error ? e.message : `${e}`;
        return new ApplicationError(msg);
    }
}
