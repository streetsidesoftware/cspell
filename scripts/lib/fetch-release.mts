/*
    Example fetch with curl:
    curl -L \
    -H "Accept: application/vnd.github+json" \
    -H "Authorization: Bearer <YOUR-TOKEN>" \
    -H "X-GitHub-Api-Version: 2022-11-28" \
    https://api.github.com/repos/OWNER/REPO/releases/tags/TAG
*/

export interface ReleaseData {
    id: number;
    node_id: string;
    tag_name: string;
    target_commitish: string;
    name: string;
    body: string;
    draft: boolean;
    prerelease: boolean;
    created_at: string;
    published_at: string;
}

export interface Request {
    apiUrl: URL;
    token: string;
    tag: string;
}

// cspell:ignore commitish

function calcGetReleaseUrl(apiUrl: URL, tag: string): URL {
    if (tag === 'latest') {
        return new URL('releases/latest', apiUrl);
    }
    return new URL(`releases/tags/${tag}`, apiUrl);
}

export async function fetchGitHubReleaseData(request: Request): Promise<ReleaseData> {
    const { apiUrl, token, tag } = request;
    const url = calcGetReleaseUrl(apiUrl, tag);
    // eslint-disable-next-line n/no-unsupported-features/node-builtins
    const response = await fetch(url, {
        headers: {
            Accept: 'application/vnd.github+json',
            Authorization: `Bearer ${token}`,
            'X-GitHub-Api-Version': '2022-11-28',
        },
    });

    if (!response.ok) {
        throw new Error(`Response status: ${response.status} ${response.statusText}`);
    }

    return response.json() as Promise<ReleaseData>;
}
