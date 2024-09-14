import { FlatpackStore } from '../dist/index.js';

function readStdin() {
    return new Promise((resolve, reject) => {
        let data = '';
        process.stdin.on('data', (chunk) => {
            data += chunk;
        });
        process.stdin.on('end', () => {
            resolve(data);
        });
        process.stdin.on('error', reject);
    });
}

async function main() {
    const content = await readStdin();
    const store = new FlatpackStore(JSON.parse(content));
    process.stdout.write(store.stringify());
}

main();
