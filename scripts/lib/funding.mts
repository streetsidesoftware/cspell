import fs from 'node:fs/promises';
import path from 'node:path';

import { parse } from 'yaml';

import { rootDir } from './packages.mts';

/** An entry in a package.json `funding` array. */
export interface FundingEntry {
    type: string;
    url: string;
}

/** The FUNDING.yml keys that become npm `funding` entries. */
const platforms: Record<string, (value: string) => FundingEntry> = {
    github: (user) => ({ type: 'github', url: `https://github.com/sponsors/${user}` }),
    open_collective: (slug) => ({ type: 'opencollective', url: `https://opencollective.com/${slug}` }),
    thanks_dev: (id) => ({ type: 'thanks.dev', url: `https://thanks.dev/${id}` }),
    custom: (url) => ({ type: 'corporate', url }),
};

/** The npm `funding` value for the repository's published packages. */
export async function readFunding(): Promise<FundingEntry[]> {
    return fundingFromYaml(await fs.readFile(path.join(rootDir, '.github/FUNDING.yml'), 'utf8'));
}

/** Convert the text of a FUNDING.yml file to npm `funding` entries, in the file's order. Keys without a value are skipped. */
export function fundingFromYaml(text: string): FundingEntry[] {
    const funding = (parse(text) ?? {}) as Record<string, unknown>;
    const entries: FundingEntry[] = [];
    for (const [key, value] of Object.entries(funding)) {
        const values = stringsOf(value);
        if (!values.length) continue;
        const toEntry = platforms[key];
        if (!toEntry) {
            throw new Error(`FUNDING.yml keys must be one of: ${Object.keys(platforms).join(', ')}.`);
        }
        entries.push(...values.map(toEntry));
    }
    return entries;
}

/** A FUNDING.yml value is a single string or a list of them. */
function stringsOf(value: unknown): string[] {
    const values = Array.isArray(value) ? value : [value];
    return values.filter((v): v is string => typeof v === 'string' && v !== '');
}
