import { GitIgnore, findRepoRoot } from '.';

import * as path from 'path';

type OptionParser = (params: string[]) => string[];

const helpText = `Usage cspell-gitignore [options] <files>

Check files against .gitignore
Compare against git check-ignore -v -n <files>

Options:
-r, --root   Add a root to prevent searching for .gitignore files above the root if the file is under the root.
             This option can be used multiple times to add multiple roots. The default root is the current
             repository root determined by the \`.git\` directory.

Example:
  cspell-gitignore README.md
  cspell-gitignore -r . node_modules
`;

export async function run(args: string[]): Promise<void> {
    const { roots, files, help } = parseArgs(args.slice(2));
    const cwd = process.cwd();
    const repo = (await findRepoRoot(cwd)) || cwd;
    const gi = await createGitIgnore(roots, repo);

    if (help) {
        console.log(help);
        return;
    }

    if (!files.length) {
        console.error('Missing files');
        process.exitCode = 1;
        return;
    }

    for (const file of files) {
        const filename = path.relative(cwd, file);
        const pFile = gi.isIgnoredEx(file);
        const pDir = gi.isIgnoredEx(file + '/ ');
        const r = (await pFile) || (await pDir);
        const gitignore = r?.gitIgnoreFile ? path.relative(repo, r.gitIgnoreFile) : '';
        const line = r?.line || '';
        const glob = r?.glob || '';
        console.log(`${gitignore}:${line}:${glob}\t${filename}`);
    }
}

function parseArgs(params: string[]) {
    const roots: string[] = [];
    const files: string[] = [];
    let help = '';

    const options: Record<string, OptionParser | undefined> = {
        '-r': optionRoot,
        '--root': optionRoot,
        '-h': optionHelp,
        '--help': optionHelp,
    };

    function optionRoot(params: string[]): string[] {
        const root = params[1];
        if (!root) {
            throw new Error('Missing root parameter.');
        }
        roots.push(path.resolve(root));
        return params.slice(2);
    }

    function optionFile(params: string[]): string[] {
        const file = params[0].trim();

        if (file) {
            files.push(path.resolve(file));
        }

        return params.slice(1);
    }

    function optionHelp(_params: string[]) {
        help = helpText;
        return [];
    }

    while (params.length) {
        const fn = options[params[0]];
        params = fn?.(params) ?? optionFile(params);
    }

    return { roots, files, help };
}

async function createGitIgnore(roots: string[], repoRoot: string) {
    if (!roots.length) {
        roots.push(repoRoot);
    }

    return new GitIgnore(roots);
}
