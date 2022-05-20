export function detectIndent(content: string): string {
    const m = content.match(/^[ \t]+/m);
    return (m && m[0]) || '  ';
}

export function detectIndentAsNum(content: string): number {
    const indent = detectIndent(content).replace(/\t/g, '    ').replace(/[^ ]/g, '');
    return indent.length;
}
