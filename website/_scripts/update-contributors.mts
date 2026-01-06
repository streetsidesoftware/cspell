/**
 * Update the contributors.mdx file.
 */

import { promises as fs } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { inject } from './lib/utils.mts';

const CONTRIBUTORS_JSON_URL = new URL('../_static/contributors.json', import.meta.url);
const CONTRIBUTORS_MDX_PATH = new URL('../src/components/home/contributors.mdx', import.meta.url);

interface Contributor {
    id: number;
    login: string;
    html_url: string;
    avatar_url: string;
    type: string;
    contributions: number;
}

interface ContributorsFile {
    contributors: Contributor[];
}

function relative(url: URL): string {
    const cwd = pathToFileURL('./');
    const p = url.pathname;
    if (p.startsWith(cwd.pathname)) {
        return p.slice(cwd.pathname.length);
    }
    return p;
}

function formatContributor(contributor: Contributor): string {
    return `[<img alt="Contributor ${contributor.login}" style={{"borderRadius": "50%"}} src="${contributor.avatar_url}&size=128" width="64"></img>](${contributor.html_url})`;
}

function makeContributorMdx(contributors: Contributor[]): string {
    const mdx = inject`\
        ---
        # AUTO-GENERATED ALL CHANGES WILL BE LOST
        # See \`_scripts/update-contributors.mts\`
        title: 'Contributors'
        format: mdx
        ---

        { /* cspell:disable */ }

        ${contributors.map(formatContributor).join('\n')}

        { /* cspell:enable */ }
    `;

    return mdx;
}

async function run() {
    console.log(`Updating contributors at ${relative(CONTRIBUTORS_MDX_PATH)}`);
    const contributorsJson = await fs.readFile(CONTRIBUTORS_JSON_URL, 'utf-8');
    const contributorsData: ContributorsFile = JSON.parse(contributorsJson);
    const mdx = makeContributorMdx(contributorsData.contributors);
    await fs.writeFile(CONTRIBUTORS_MDX_PATH, mdx, 'utf-8');
    console.log(`Updated contributors at ${relative(CONTRIBUTORS_MDX_PATH)}`);
}

run();
