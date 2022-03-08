import { promises as fs } from 'fs';

export const LITERAL_NUM = 42;
export const LITERAL_STR_SINGLE = 'Guuide to the Gallaxy'
export const LITERAL_STR_DOUBLE = "To Infinity and Beyond";
export const LITERAL_COOKED = 'cafe\u0301';
export const UNDEFINED = undefined;
export const NULL = null;
export const BIG_INT = 1n;

function mapDir(dir) {
    return `type: ${dir.isFile ? 'F' : ' '}${dir.isDirectory() ? 'D' :' '} name: ${dir.name}`;
}

export async function listFiles() {
    const dirs = await fs.readdir('.', { withFileTypes: true });
    const entries = dirs.map(mapDir);
    console.log(entries.join('\n'));
}
