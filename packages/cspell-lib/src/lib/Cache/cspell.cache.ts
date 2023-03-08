/**
 * Proposed CSpell Cache file.
 * To be stored at `./.cspell/cache/cache.json`
 */

export interface CSpellCache {
    version: Version;
    signature: Hash;
    files: CachedFile[];
}

export type Version = '0.1';

/**
 * Hash used. Starts with hash id. i.e. `sha1-` or `sha512-`.
 */
export type Hash = string;

export type UriRelPath = string;

export enum IssueCode {
    UnknownWord = 1 << 0,
    ForbiddenWord = 1 << 1,
    KnownIssue = 1 << 2,
    ALL = IssueCode.UnknownWord | IssueCode.ForbiddenWord | IssueCode.KnownIssue,
}

export interface CachedFile {
    hash: Hash;
    path: UriRelPath;
    issues: Issue[];
}

export type Issue = IssueEntry | IssueLine;

export interface IssueEntry {
    line: number;
    character: number;
    code: IssueCode;
    text: string;
    len: number;
}

export type IssueLine = [
    line: IssueEntry['line'],
    character: IssueEntry['character'],
    code: IssueEntry['code'],
    text: IssueEntry['text'],
    len: IssueEntry['len']
];
