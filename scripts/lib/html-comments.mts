import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import { visit } from 'unist-util-visit';

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

/**
 * Find the HTML comments in Markdown text: text that GitHub doesn't show.
 * A `<!--` in a code block or inline code is visible, so it isn't reported.
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

function codeRanges(markdown: string): Range[] {
    const ranges: Range[] = [];
    visit(remark().use(remarkGfm).parse(markdown), ['code', 'inlineCode'], (node) => {
        const start = node.position?.start.offset;
        const end = node.position?.end.offset;
        if (start !== undefined && end !== undefined) ranges.push([start, end]);
    });
    return ranges;
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
