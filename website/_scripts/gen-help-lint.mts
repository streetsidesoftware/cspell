import fs from 'node:fs/promises';
import { inject, relativeToSite } from './lib/utils.mts';
import { URL_REPO_ROOT_PKG, URL_SITE_PKG } from './lib/constants.mts';
import { codeBlock } from './lib/markdown-helpers.mts';

const urlPkgCSpell = new URL('packages/cspell/package.json', URL_REPO_ROOT_PKG);
const urlCSpellStaticDir = new URL('static/', urlPkgCSpell);
const urlHelpLintFile = new URL('help-lint.txt', urlCSpellStaticDir);

const urlTarget = new URL('src/components/help-lint.md', URL_SITE_PKG);

function makeMD(helpText: string): string {
    const md = inject`\
        ---
        # AUTO-GENERATED ALL CHANGES WILL BE LOST
        # See \`${relativeToSite(import.meta.url)}\`
        title: 'cspell lint --help'
        format: md
        ---

        ${codeBlock(helpText)}
    `;

    return md;
}

export async function run(): Promise<void> {
    console.log(`Generating help-lint at ${relativeToSite(urlTarget)}`);
    const helpText = await fs.readFile(urlHelpLintFile, 'utf-8');
    const md = makeMD(helpText);
    await fs.writeFile(urlTarget, md, 'utf-8');
    console.log(`Generating help-lint at ${relativeToSite(urlTarget)} - Done.`);
}

if (import.meta.main) {
    run();
}
