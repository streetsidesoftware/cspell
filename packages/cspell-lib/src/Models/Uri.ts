import { Utils, URI as Uri } from 'vscode-uri';
export { URI as Uri } from 'vscode-uri';

export const { basename, dirname, extname, joinPath, resolvePath } = Utils;

const isFile = /^(?:[a-zA-Z]:|[/\\])/;
const isPossibleUri = /\w:\/\//;

export function toUri(uriOrFile: string | Uri): Uri {
    if (uriOrFile instanceof Uri) return uriOrFile;
    return isFile.test(uriOrFile) && !isPossibleUri.test(uriOrFile) ? Uri.file(uriOrFile) : Uri.parse(uriOrFile);
}
