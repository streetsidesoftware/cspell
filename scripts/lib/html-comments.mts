export interface HtmlComment {
    /** 1-based line of the `<!--`. */
    line: number;
    /** 1-based column of the `<!--`. */
    column: number;
    /** Offset of the `<!--` in the text. */
    offset: number;
    /** Length of the comment, including `<!--` and `-->`. An unclosed comment runs to the end of the text. */
    length: number;
    closed: boolean;
    text: string;
}

type Range = [start: number, end: number];

interface Line {
    start: number;
    end: number;
    text: string;
}

/**
 * Find the HTML comments in Markdown text: text that GitHub doesn't show.
 *
 * A `<!--` shown as code is visible, so it isn't reported. Code is only recognized where HTML can't change its meaning,
 * so anything unusual is reported rather than missed. See {@link codeRanges}.
 */
export function findHtmlComments(markdown: string): HtmlComment[] {
    const code = codeRanges(markdown);
    const comments: HtmlComment[] = [];
    let from = 0;
    for (;;) {
        const start = markdown.indexOf('<!--', from);
        if (start < 0) break;
        if (code.some(([s, e]) => start >= s && start < e)) {
            from = start + 4;
            continue;
        }
        const close = markdown.indexOf('-->', start + 4);
        const end = close < 0 ? markdown.length : close + 3;
        comments.push({
            ...lineAndColumn(markdown, start),
            offset: start,
            length: end - start,
            closed: close >= 0,
            text: markdown.slice(start, end),
        });
        from = end;
    }
    return comments;
}

/** Blocks such as `<pre>` can span blank lines, so code can't be told apart anywhere in the text. */
const htmlBlockAcrossBlankLines = /^ {0,3}(?:<(?:pre|script|style|textarea)(?:[\s>]|$)|<\?|<!(?!--))/i;
/** An HTML tag or autolink, which takes precedence over code spans and can hide backticks. */
const htmlTag = /<[A-Za-z/?]|<!(?!--)/;
const openingFence = /^ {0,3}(`{3,}|~{3,})(.*)$/;
const blankLine = /^[ \t]*\r?$/;

/**
 * The ranges of code that GitHub shows, recognized conservatively:
 * - Fenced code blocks that start a chunk (after a blank line), outside quotes and lists. An unclosed fence runs to the
 *   end, as on GitHub.
 * - Inline code, with matching backtick runs, within one line, without a `|` (table cells split first), in a chunk
 *   with no HTML tag or autolink. A code span can't cross from one block to the next, such as list items.
 * - Nothing at all if the text has an HTML block that can span blank lines.
 */
function codeRanges(markdown: string): Range[] {
    const lines = splitLines(markdown);
    if (lines.some((l) => htmlBlockAcrossBlankLines.test(l.text))) return [];

    const ranges: Range[] = [];
    let i = 0;
    while (i < lines.length) {
        if (blankLine.test(lines[i].text)) {
            ++i;
            continue;
        }
        const fence = parseOpeningFence(lines[i].text);
        if (fence) {
            let j = i + 1;
            while (j < lines.length && !isClosingFence(lines[j].text, fence)) ++j;
            ranges.push([lines[i].start, j < lines.length ? lines[j].end : markdown.length]);
            i = j + 1;
            continue;
        }
        let j = i;
        while (j < lines.length && !blankLine.test(lines[j].text)) ++j;
        const start = lines[i].start;
        const end = lines[j - 1].end;
        if (!htmlTag.test(markdown.slice(start, end))) {
            for (const line of lines.slice(i, j)) ranges.push(...inlineCodeRanges(markdown, line.start, line.end));
        }
        i = j;
    }
    return ranges;
}

function splitLines(text: string): Line[] {
    const lines: Line[] = [];
    let start = 0;
    while (start <= text.length) {
        const newline = text.indexOf('\n', start);
        const end = newline < 0 ? text.length : newline + 1;
        lines.push({ start, end, text: text.slice(start, newline < 0 ? end : newline) });
        if (newline < 0) break;
        start = end;
    }
    return lines;
}

function parseOpeningFence(line: string): string | undefined {
    const m = openingFence.exec(line);
    if (!m) return undefined;
    const [, fence, info] = m;
    // A backtick fence's info string can't contain a backtick, or it isn't a fence.
    if (fence[0] === '`' && info.includes('`')) return undefined;
    return fence;
}

function isClosingFence(line: string, fence: string): boolean {
    const m = /^ {0,3}(`{3,}|~{3,})[ \t]*\r?$/.exec(line);
    return !!m && m[1][0] === fence[0] && m[1].length >= fence.length;
}

/** Code spans in one line, `markdown[start, end)`: a run of backticks closed by a run of the same length, without a `|`. */
function inlineCodeRanges(markdown: string, start: number, end: number): Range[] {
    const ranges: Range[] = [];
    let i = start;
    while (i < end) {
        const ch = markdown[i];
        if (ch === '\\') {
            // An escaped backtick is literal, so it can't open code.
            i += 2;
            continue;
        }
        if (ch !== '`') {
            ++i;
            continue;
        }
        const run = backtickRun(markdown, i, end);
        let close = -1;
        for (let j = i + run; j < end;) {
            if (markdown[j] !== '`') {
                ++j;
                continue;
            }
            const len = backtickRun(markdown, j, end);
            if (len === run) {
                close = j;
                break;
            }
            j += len;
        }
        if (close < 0) {
            i += run;
            continue;
        }
        if (!markdown.slice(i, close).includes('|')) ranges.push([i, close + run]);
        i = close + run;
    }
    return ranges;
}

function backtickRun(text: string, at: number, end: number): number {
    let n = 0;
    while (at + n < end && text[at + n] === '`') ++n;
    return n;
}

function lineAndColumn(text: string, offset: number): { line: number; column: number } {
    const before = text.slice(0, offset);
    const lineStart = before.lastIndexOf('\n') + 1;
    return { line: before.split('\n').length, column: offset - lineStart + 1 };
}

/** One line per comment: `name:line:column - HTML comment (closed, 48 characters)`. */
export function formatHtmlComment(name: string, comment: HtmlComment): string {
    const kind = comment.closed ? 'closed' : 'unclosed';
    return `${name}:${comment.line}:${comment.column} - HTML comment (${kind}, ${comment.length} characters)`;
}
