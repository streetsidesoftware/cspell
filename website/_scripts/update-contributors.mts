/**
 * Update the contributors.mdx file.
 */

import { promises as fs } from 'node:fs';
import { inject, relativeToSite } from './lib/utils.mts';
import { URL_SITE_COMPONENTS, URL_SITE_PKG } from './lib/constants.mts';

const CONTRIBUTORS_JSON_URL = new URL('_static/contributors.json', URL_SITE_PKG);
const CONTRIBUTORS_MDX_PATH = new URL('home/contributors.mdx', URL_SITE_COMPONENTS);

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

function formatContributor(contributor: Contributor): string {
    return `[<img alt="Contributor ${contributor.login}" style={{"borderRadius": "50%"}} src="${contributor.avatar_url}&size=128" width="64"></img>](${contributor.html_url})`;
}

function makeContributorMdx(contributors: Contributor[]): string {
    const mdx = inject`\
        ---
        # AUTO-GENERATED ALL CHANGES WILL BE LOST
        # See \`${relativeToSite(import.meta.url)}\`
        title: 'Contributors'
        format: mdx
        ---

        { /* cspell:disable */ }

        ${contributors.map(formatContributor).join('\n')}

        { /* cspell:enable */ }
    `;

    return mdx;
}

export async function run(): Promise<void> {
    console.log(`Updating contributors at ${relativeToSite(CONTRIBUTORS_MDX_PATH)}`);
    const contributorsJson = await fs.readFile(CONTRIBUTORS_JSON_URL, 'utf-8');
    const contributorsData: ContributorsFile = JSON.parse(contributorsJson);
    const mdx = makeContributorMdx(contributorsData.contributors);
    await fs.writeFile(CONTRIBUTORS_MDX_PATH, mdx, 'utf-8');
    console.log(`Updating contributors at ${relativeToSite(CONTRIBUTORS_MDX_PATH)} - Done.`);
}

if (import.meta.main) {
    run();
}
