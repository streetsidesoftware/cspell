import { promises as fs } from 'fs';

function mapDir(dir) {
    return `type: ${dir.isFile ? 'F' : ' '}${dir.isDirectory() ? 'D' :' '} name: ${dir.name}`;
}

async function listFiles() {
    const dirs = await fs.readdir('.', { withFileTypes: true });
    const entries = dirs.map(mapDir);
    console.log(entries.join('\n'));
}

listFiles();
