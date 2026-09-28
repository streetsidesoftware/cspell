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
 * Only a well-formed fenced code block is an exception, so a cspell directive shown in one isn't reported.
 * Everything else is: inline code, quotes, lists, and indented code included.
 */
export function findHtmlComments(markdown: string): HtmlComment[] {
    const blocks = findCodeBlocks(markdown);
    const inBlock = (offset: number) => blocks.some(([s, e]) => offset >= s && offset < e);

    const comments: HtmlComment[] = [];
    let from = 0;
    for (;;) {
        const start = markdown.indexOf('<!--', from);
        if (start < 0) break;
        if (inBlock(start)) {
            // Shown as code, so skip it, without pairing it with a `-->` that may be past the block.
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

/** These HTML blocks continue across blank lines, so a fence inside one isn't code. */
const htmlBlockAcrossBlankLines = /^ {0,3}<(?:pre|script|style|textarea)(?:[\s>]|$)/i;
const blankLine = /^[ \t]*\r?$/;

/**
 * Well-formed fenced code blocks: an opening fence right after a blank line (or at the start), closed by a fence of the
 * same character that is at least as long. None, if the text has a `<pre>`, `<script>`, `<style>`, or `<textarea>`.
 */
function findCodeBlocks(markdown: string): Range[] {
    const lines = splitLines(markdown);
    if (lines.some((l) => htmlBlockAcrossBlankLines.test(l.text))) return [];

    const blocks: Range[] = [];
    for (let i = 0; i < lines.length; ++i) {
        const fence = openingFence(lines[i].text);
        if (!fence || (i > 0 && !blankLine.test(lines[i - 1].text))) continue;
        const close = lines.findIndex((l, j) => j > i && isClosingFence(l.text, fence));
        if (close < 0) continue;
        blocks.push([lines[i].start, lines[close].end]);
        i = close;
    }
    return blocks;
}

function openingFence(line: string): string | undefined {
    const m = /^ {0,3}(`{3,}|~{3,})(.*)$/.exec(line);
    // GitHub doesn't treat a backtick fence with another backtick on its line as a fence.
    if (!m || (m[1][0] === '`' && m[2].includes('`'))) return undefined;
    return m[1];
}

function isClosingFence(line: string, fence: string): boolean {
    const m = /^ {0,3}(`{3,}|~{3,})[ \t]*\r?$/.exec(line);
    return !!m && m[1][0] === fence[0] && m[1].length >= fence.length;
}

function splitLines(text: string): Line[] {
    const lines: Line[] = [];
    for (let start = 0; ;) {
        const newline = text.indexOf('\n', start);
        const end = newline < 0 ? text.length : newline + 1;
        lines.push({ start, end, text: text.slice(start, newline < 0 ? end : newline) });
        if (newline < 0) return lines;
        start = end;
    }
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
