const matchHtml = /["'&<>]/g;
const matchMarkdown = /[-"'&<>`*_+[\]()\\|~]/g;

const entityMap = {
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;',
    '"': '&quot;',
    "'": '&#39;',
};

const charCodeToEntity: string[] = compileEntities(entityMap);

export function escapeMarkdown(text: string): string {
    return _escape(text, matchMarkdown);
}

export function escapeHtml(str: string): string {
    return _escape(str, matchHtml);
}

function _escape(str: string, r: RegExp): string {
    const cvt = charCodeToEntity;

    let lastIndex = 0;
    let html = '';

    r.lastIndex = 0;

    while (r.test(str)) {
        const i = r.lastIndex - 1;
        html += str.substring(lastIndex, i) + cvt[str.charCodeAt(i)];
        lastIndex = r.lastIndex;
    }
    return html + str.substring(lastIndex);
}

function compileEntities(entityMap: Record<string, string>): string[] {
    const result: string[] = [];
    result.length = 127;

    for (let i = 32; i < 128; ++i) {
        result[i] = `&#${i};`;
    }

    for (const [char, entity] of Object.entries(entityMap)) {
        result[char.charCodeAt(0)] = entity;
    }
    return result;
}
