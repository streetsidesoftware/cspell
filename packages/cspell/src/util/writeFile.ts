import fs from 'node:fs/promises';

export async function writeFileOrStream(filename: string, data: string): Promise<void> {
    switch (filename) {
        case 'stdout': {
            await writeStream(process.stdout, data);
            return;
        }
        case 'stderr': {
            await writeStream(process.stderr, data);
            return;
        }
        case 'null': {
            return;
        }
    }
    return fs.writeFile(filename, data);
}

export function writeStream(stream: NodeJS.WriteStream, data: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        stream.write(data, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}
