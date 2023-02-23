import { URI as Uri, Utils } from 'vscode-uri';
export { URI as Uri } from 'vscode-uri';

export const { basename, dirname, extname, joinPath, resolvePath } = Utils;

const isFile = /^(?:[a-zA-Z]:|[/\\])/;
const isPossibleUri = /\w:\/\//;

const isUrl = /^(file:|stdin:|https?:|s?ftp:)\/\//;

export function toUri(uriOrFile: string | Uri): Uri {
    if (uriOrFile instanceof Uri) return uriOrFile;
    if (Uri.isUri(uriOrFile)) return uriOrFile;
    if (isUrl.test(uriOrFile)) return Uri.parse(uriOrFile);
    return isFile.test(uriOrFile) && !isPossibleUri.test(uriOrFile)
        ? Uri.file(normalizeFsPath(uriOrFile))
        : Uri.parse(uriOrFile);
}

export function isUri(uri: unknown): uri is Uri {
    return Uri.isUri(uri);
}

const hasDriveLetter = /^[A-Z]:/i;

export function uriToFilePath(uri: Uri): string {
    return normalizeFsPath(uri.fsPath);
}

function normalizeFsPath(path: string): string {
    return hasDriveLetter.test(path) ? path[0].toLowerCase() + path.slice(1) : path;
}
