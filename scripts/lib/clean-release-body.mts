import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import { visit } from 'unist-util-visit';

type Range = [start: number, end: number];

const maintainerSummary = /^\s*<summary>\s*for maintainers\s*<\/summary>/i;
const detailsTag = /<(\/?)details\b[^>]*>/gi;

/**
 * Remove what must not reach the release notes from one PR body:
 * - HTML comments. An unclosed `<!--` is made visible, so it can't hide what follows it.
 * - `<details>` blocks whose summary is "For maintainers", including any blocks nested in them.
 *
 * Code blocks and inline code are left as they are.
 */
export function cleanPullRequestBody(body: string): string {
    return removeMaintainerBlocks(removeComments(body));
}

function removeComments(body: string): string {
    const code = codeRanges(body);
    let result = '';
    let pos = 0;
    for (let start = body.indexOf('<!--'); start >= 0; start = body.indexOf('<!--', pos)) {
        if (inRanges(code, start)) {
            result += body.slice(pos, start + 4);
            pos = start + 4;
            continue;
        }
        result += body.slice(pos, start);
        const end = body.indexOf('-->', start + 4);
        if (end < 0) {
            result += '&lt;!--';
            pos = start + 4;
            continue;
        }
        pos = end + 3;
    }
    return result + body.slice(pos);
}

function removeMaintainerBlocks(body: string): string {
    const code = codeRanges(body);
    const tags = [...body.matchAll(detailsTag)].filter((m) => !inRanges(code, m.index));
    const remove: Range[] = [];
    for (let i = 0; i < tags.length; ++i) {
        const open = tags[i];
        if (open[1] || !maintainerSummary.test(body.slice(open.index + open[0].length))) continue;
        let depth = 0;
        let end = body.length;
        let j = i;
        for (; j < tags.length; ++j) {
            depth += tags[j][1] ? -1 : 1;
            if (!depth) {
                end = tags[j].index + tags[j][0].length;
                break;
            }
        }
        remove.push([open.index, end]);
        i = j;
    }
    let result = body;
    for (const [start, end] of remove.reverse()) {
        result = result.slice(0, start) + result.slice(end);
    }
    return result;
}

function codeRanges(markdown: string): Range[] {
    const ranges: Range[] = [];
    const tree = remark().use(remarkGfm).parse(markdown);
    visit(tree, ['code', 'inlineCode'], (node) => {
        const start = node.position?.start.offset;
        const end = node.position?.end.offset;
        if (start !== undefined && end !== undefined) ranges.push([start, end]);
    });
    return ranges;
}

function inRanges(ranges: Range[], offset: number): boolean {
    return ranges.some(([start, end]) => offset >= start && offset < end);
}

/** The PR numbers of the entries in a release body, from headings such as `### fix: Report errors (#9267)`. */
export function pullRequestNumbers(releaseBody: string): number[] {
    const numbers = [...releaseBody.matchAll(/^#{1,6} .*\(#(\d+)\)[ \t]*\r?$/gm)].map((m) => Number(m[1]));
    return [...new Set(numbers)];
}

export interface CleanReleaseBodyResult {
    body: string;
    /** The PRs whose body was changed. */
    cleaned: number[];
}

/**
 * Clean each PR body in a release body.
 *
 * release-drafter inserts each PR body verbatim, so each one is fetched, cleaned on its own, and replaced by exact text.
 * Throws if a body that needs cleaning isn't found, for example because the PR was edited after the draft was built.
 */
export async function cleanReleaseBody(
    releaseBody: string,
    getPullRequestBody: (prNumber: number) => Promise<string>,
): Promise<CleanReleaseBodyResult> {
    let body = releaseBody;
    const cleaned: number[] = [];
    for (const prNumber of pullRequestNumbers(releaseBody)) {
        const original = await getPullRequestBody(prNumber);
        if (!original.trim()) continue;
        const clean = cleanPullRequestBody(original);
        if (clean === original) continue;
        if (!body.includes(original)) {
            throw new Error(
                `The body of #${prNumber} is not in the release notes. Was it edited after the draft was built?`,
            );
        }
        body = body.split(original).join(clean);
        cleaned.push(prNumber);
    }
    return { body, cleaned };
}
