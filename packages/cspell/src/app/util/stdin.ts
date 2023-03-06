import * as readline from 'readline';

export function readStdin(): AsyncIterable<string> {
    return readline.createInterface(process.stdin);
}
