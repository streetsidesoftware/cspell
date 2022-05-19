export function json(obj: unknown, indent: string | number = 2): string {
    return JSON.stringify(obj, null, indent) + '\n';
}
