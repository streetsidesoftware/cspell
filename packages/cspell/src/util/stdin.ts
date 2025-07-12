import * as readline from 'node:readline';

export function readStdin(): AsyncIterable<string> {
    return readline.createInterface(process.stdin);
}
