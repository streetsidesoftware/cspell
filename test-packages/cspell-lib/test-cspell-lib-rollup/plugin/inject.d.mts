export function injectSnippet(
    code,
    pos,
    codeSnippet,
): {
    code: string;
    map: { mappings: string };
};
