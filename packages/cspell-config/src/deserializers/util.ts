export function detectIndent(content: string): string {
    const m = content.match(/^[ \t]+/m);
    return (m && m[0]) || '  ';
}
