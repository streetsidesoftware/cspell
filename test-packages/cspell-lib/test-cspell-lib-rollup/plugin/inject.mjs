// eslint-disable-next-line node/no-unpublished-import
import MagicString from 'magic-string';

export function injectSnippet(code, pos, codeSnippet) {
    const ms = new MagicString(code);

    const newCode = ms.appendLeft(pos, codeSnippet);

    const map = newCode.generateMap();

    return {
        code: newCode.toString(),
        map: {
            mappings: map.mappings,
        },
    };
}
