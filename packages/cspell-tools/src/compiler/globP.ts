import glob from 'glob';

export function globP(pattern: string): Promise<string[]> {
    // Convert windows separators.
    pattern = pattern.replace(/\\/g, '/');
    return new Promise((resolve, reject) => {
        glob(pattern, (err, result) => {
            err ? reject(err) : resolve(result);
        });
    });
}
