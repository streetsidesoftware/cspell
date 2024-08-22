/* eslint-disable n/no-unsupported-features/node-builtins */

const token = process.argv[2];

const perPage = 100;

/**
 * @typedef {{ login: string; html_url: string; avatar_url: string; }} Contributor
 */

/**
 * Fetch the contributors of the repository.
 * @param {string} token
 * @returns {Promise<Contributor[]>}
 */
async function fetchContributors(token) {
    /**
     *
     * @param {number} page
     * @returns Promise<Contributor[]>
     */
    async function fetchPage(page) {
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

        return response.json();
    }

    let contributors = [];

    for (let page = 1; page < 5; page++) {
        const c = await fetchPage(page);
        contributors.push(...c);
        if (c.length < perPage) {
            break;
        }
    }

    return contributors;
}

/**
 *
 * @param {Contributor} contributor
 * @returns string
 */
function contributorToMd(contributor) {
    return `[<img src="${contributor.avatar_url}&size=128" width=64>](${contributor.html_url})`;
}

/**
 *
 * @param {Contributor[]} contributors
 * @returns string
 */
function contributorsToMd(contributors) {
    return contributors.map(contributorToMd).join('\n');
}

async function run() {
    if (!token) {
        throw new Error('GitHub token is required');
    }

    const contributors = await fetchContributors(token);

    console.log('%s', contributorsToMd(contributors));
}

run();
