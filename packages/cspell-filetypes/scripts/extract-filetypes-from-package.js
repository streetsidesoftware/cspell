import { readFile } from 'node:fs/promises';

async function processFiles(files) {
    const defs = [];

    for (const file of files) {
        const content = await readFile(file, 'utf8');
        const pkg = JSON.parse(content);

        const languages = pkg.contributes?.languages;
        if (!languages?.length) {
            continue;
        }

        for (const def of languages) {
            if (!def.id) {
                continue;
            }
            const filenames = [...(def.filenamePatterns || []), ...(def.filenames || [])];
            defs.push({
                id: def.id,
                extensions: def.extensions || [],
                filenames: filenames.length ? filenames : undefined,
            });
        }
    }

    return defs;
}

const packageFiles = process.argv.slice(2);

const defs = await processFiles(packageFiles);

console.log(JSON.stringify(defs, undefined, 2));
