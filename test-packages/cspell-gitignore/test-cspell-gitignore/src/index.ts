import { findRepoRoot, GitIgnore } from 'cspell-gitignore';

export async function run(filename: string) {
    // Stop at the repo root, so a `.gitignore` above the checkout can't change the result.
    const root = await findRepoRoot(filename);
    const gitIgnore = new GitIgnore(root ? [root] : []);
    return gitIgnore.isIgnored(filename);
}
