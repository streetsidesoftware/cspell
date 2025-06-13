/*
    Example fetch with curl:
    curl -L \
    -H "Accept: application/vnd.github+json" \
    -H "Authorization: Bearer <YOUR-TOKEN>" \
    -H "X-GitHub-Api-Version: 2022-11-28" \
    https://api.github.com/repos/OWNER/REPO/releases/tags/TAG
*/

/**
 * @typedef {Object} ReleaseData
 * @property {number} id
 * @property {string} node_id
 * @property {string} tag_name
 * @property {string} target_commitish
 * @property {string} name
 * @property {string} body
 * @property {boolean} draft
 * @property {boolean} prerelease
 * @property {string} created_at
 * @property {string} published_at
 */

// cspell:ignore commitish

/**
 *
 * @param {string} token
 * @param {string} tag
 * @returns {Promise<ReleaseData>}
 */
export async function fetchGitHubReleaseData(token, tag) {
    // eslint-disable-next-line n/no-unsupported-features/node-builtins
    const response = await fetch(`https://api.github.com/repos/streetsidesoftware/cspell/releases/tags/${tag}`, {
        headers: {
            Accept: 'application/vnd.github+json',
            Authorization: `Bearer ${token}`,
            'X-GitHub-Api-Version': '2022-11-28',
        },
    });

    if (!response.ok) {
        throw new Error(`Response status: ${response.status} ${response.statusText}`);
    }

    return response.json();
}
