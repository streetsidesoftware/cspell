import fs from 'node:fs/promises';
import * as md from '@streetsidesoftware/markdown-toolkit';
import { unindent } from '@streetsidesoftware/unindent';

import { relativeToSite } from './lib/utils.mts';
import { URL_REPO_ROOT_PKG, URL_SITE_PKG } from './lib/constants.mts';

const urlPkgCSpell = new URL('packages/cspell/package.json', URL_REPO_ROOT_PKG);
const urlCSpellStaticDir = new URL('static/', urlPkgCSpell);
const urlHelpLintFile = new URL('help-lint.txt', urlCSpellStaticDir);

const urlTarget = new URL('src/components/help-lint.md', URL_SITE_PKG);

function makeMD(helpText: string): string {
    const frontmatter = unindent`\
        # AUTO-GENERATED ALL CHANGES WILL BE LOST
        # See \`${relativeToSite(import.meta.url)}\`
        title: 'cspell lint --help'
        format: md
    `;

    return md.document(md.frontmatter(frontmatter), md.codeBlock(helpText.trimEnd(), 'text')).toString();
}

export async function run(): Promise<void> {
    console.log(`Generating help-lint at ${relativeToSite(urlTarget)}`);
    const helpText = await fs.readFile(urlHelpLintFile, 'utf-8');
    const markdown = makeMD(helpText);
    await fs.writeFile(urlTarget, markdown, 'utf-8');
    console.log(`Generating help-lint at ${relativeToSite(urlTarget)} - Done.`);
}

if (import.meta.main) {
    run();
}
