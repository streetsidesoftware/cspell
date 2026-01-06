/* eslint-disable n/no-unsupported-features/node-builtins */

const perPage = 100;

export interface Contributor {
    id: number;
    login: string;
    html_url: string;
    avatar_url: string;
    type: string;
    contributions: number;
}

export type ContributorFields = keyof Contributor;

const contributorFieldNames = [
    'id',
    'login',
    'avatar_url',
    'html_url',
    'type',
    'contributions',
] as const satisfies ContributorFields[];

export const CONTRIBUTOR_FIELD_NAMES: ContributorFields[] = contributorFieldNames;

export function normalizeContributorFields(con: Contributor): Contributor {
    return {
        id: con.id,
        login: con.login,
        html_url: con.html_url,
        avatar_url: con.avatar_url,
        type: con.type,
        contributions: con.contributions,
    };
}

/**
 * Fetch the contributors of the repository.
 * @param token - the github token
 * @returns an array of matching contributors
 */
export async function fetchContributors(token: string): Promise<Contributor[]> {
    /**
     *
     * @param {number} page
     * @returns Promise<Contributor[]>
     */
    async function fetchPage(page: number): Promise<Contributor[]> {
        const response = await fetch(
            `https://api.github.com/repos/streetsidesoftware/cspell/contributors?per_page=${perPage}&page=${page}`,
            {
                headers: {
                    Accept: 'application/vnd.github+json',
                    Authorization: `Bearer ${token}`,
                    'X-GitHub-Api-Version': '2022-11-28',
                },
            },
        );

        if (!response.ok) {
            throw new Error(`Response status: ${response.status} ${response.statusText}`);
        }

        return response.json() as Promise<Contributor[]>;
    }

    const contributors = [];

    for (let page = 1; page < 5; page++) {
        const c = (await fetchPage(page)).filter((c) => c.type === 'User');
        contributors.push(...c);
        if (c.length < perPage) {
            break;
        }
    }

    return contributors;
}
