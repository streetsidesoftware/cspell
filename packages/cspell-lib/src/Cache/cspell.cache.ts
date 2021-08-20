/**
 * Proposed CSpell Cache file.
 * To be stored at `./.cspell/cache/cache.json`
 */

export interface CSpellCache {
    version: Version;
    signature: Hash;
    files: CachedFile[];
}

type Version = '0.1';

/**
 * Hash used. Starts with hash id. i.e. `sha1-` or `sha512-`.
 */
type Hash = string;

type UriRelPath = string;

enum IssueCode {
    UnknownWord = 1 << 0,
    ForbiddenWord = 1 << 1,
    KnownIssue = 1 << 2,
}

interface CachedFile {
    hash: Hash;
    path: UriRelPath;
    issues: Issue[];
}

type Issue = IssueEntry | IssueLine;

interface IssueEntry {
    line: number;
    character: number;
    code: IssueCode;
    text: string;
    len: number;
}

type IssueLine = [
    line: IssueEntry['line'],
    character: IssueEntry['character'],
    code: IssueEntry['code'],
    text: IssueEntry['text'],
    len: IssueEntry['len']
];
