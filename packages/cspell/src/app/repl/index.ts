import * as readline from 'readline';

export function simpleRepl(): AsyncIterable<string> {
    return new SimpleRepl();
}

export type CompleterResult = [string[], string];
export type Completer = (line: string) => CompleterResult;

export class SimpleRepl implements AsyncIterable<string> {
    public beforeEach: undefined | (() => void);
    public completer: undefined | Completer;
    private _history: string[];
    private rl: readline.ReadLine;

    constructor(public prompt = '> ') {
        this._history = [];
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            prompt,
            history: this._history,
            historySize: 100,
            completer: (line: string) => this._completer(line),
        });

        this.rl.on('history', (h) => ((this._history = h), undefined));
    }

    question(query: string): Promise<string> {
        return new Promise<string>((resolve) => {
            this.rl.question(query, resolve);
        });
    }

    private _completer(line: string): CompleterResult {
        // console.log('Complete: %s', line);
        // console.log('History: %o', this._history);
        if (this.completer) return this.completer(line);
        const hist = this._history.filter((h) => h.startsWith(line));
        return [hist, line];
    }

    get history() {
        return this._history;
    }

    [Symbol.asyncIterator]() {
        const next = (): Promise<IteratorResult<string, undefined>> => {
            if (this.beforeEach) this.beforeEach();
            // console.log('%o', this.rl);
            return this.question(this.prompt)
                .then((value: string) => ({ value }))
                .catch(() => ({ done: true, value: undefined }));
        };

        return { next };
    }
}
