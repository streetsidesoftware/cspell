import { promises as fs } from 'fs';

async function listFiles() {
    const dir = await fs.readdir('.');
    console.log(dir.join('\n'));
}

listFiles();
