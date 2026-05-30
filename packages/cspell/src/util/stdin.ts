import * as readline from 'node:readline';

export async function* readStdin(): AsyncIterable<string> {
    const rl = readline.createInterface(process.stdin);
    try {
        yield* rl;
    } catch (e) {
        if (!isReadlineClosedError(e)) {
            throw e;
        }
    }
}

function isReadlineClosedError(e: unknown): boolean {
    return e instanceof Error && e.message.includes('closed');
}
