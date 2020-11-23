import * as path from 'path';
import * as App from './application';

const getStdinResult = {
    value: '',
};

jest.mock('get-stdin', () => {
    return jest.fn(() => Promise.resolve(getStdinResult.value));
});

describe('Validate the Application', () => {
    jest.setTimeout(10000); // make sure we have enough time on Travis.

    test('Tests running the application', () => {
        const files = ['samples/text.txt'];
        const options = {};
        const logger = new Logger();
        const lint = App.lint(files, options, logger);
        return lint.then((result) => {
            expect(logger.errorCount).toBe(0);
            expect(logger.infoCount).toBeGreaterThan(0);
            expect(logger.debugCount).toBeGreaterThan(0);
            expect(result.files).toBe(1);
            return;
        });
    });

    test('Tests running the application verbose', () => {
        const files = ['samples/text.txt'];
        const options = { verbose: true };
        const logger = new Logger();
        const lint = App.lint(files, options, logger);
        return lint.then((result) => {
            expect(logger.errorCount).toBe(0);
            expect(logger.infoCount).toBeGreaterThan(0);
            expect(logger.debugCount).toBeGreaterThan(0);
            expect(result.files).toBe(1);
            return;
        });
    });

    test('Tests running the application words only', () => {
        const files = ['samples/text.txt'];
        const options = { wordsOnly: true, unique: true };
        const logger = new Logger();
        const lint = App.lint(files, options, logger);
        return lint.then((result) => {
            expect(logger.errorCount).toBe(0);
            expect(logger.infoCount).toBeGreaterThan(0);
            expect(logger.debugCount).toBeGreaterThan(0);
            expect(result.files).toBe(1);
            return;
        });
    });

    test('Tests running the trace command', async () => {
        const result = await App.trace(['apple'], {});
        expect(result.length).toBeGreaterThan(2);

        const foundIn = result.filter((r) => r.found).map((r) => r.dictName);
        expect(foundIn).toEqual(expect.arrayContaining(['en_US.trie.gz']));
    });

    test('Tests checkText', async () => {
        const result = await App.checkText('samples/latex/sample2.tex', {});
        expect(result.items.length).toBeGreaterThan(50);
        expect(result.items.map((i) => i.text).join('')).toBe(result.text);
    });

    test('running the application from stdin', async () => {
        const files = ['stdin'];
        const options = { wordsOnly: true, unique: true };
        const logger = new Logger();
        // cspell:ignore texxt
        getStdinResult.value = `
            This is some texxt to test out reding from stdin.
            cspell:ignore badspellingintext
            We can ignore values within the text: badspellingintext
        `;
        const lint = App.lint(files, options, logger);
        const result = await lint;
        expect(result.files).toBe(1);
        expect(logger.errorCount).toBe(0);
        expect(logger.infoCount).toBeGreaterThan(0);
        expect(logger.debugCount).toBeGreaterThan(0);
        expect(logger.issues.map((i) => i.text)).toEqual(['texxt']);
    });
});

describe('Validate createInit', () => {
    test('createInit', async () => {
        async function worked() {
            try {
                await App.createInit();
            } catch (e) {
                return false;
            }
            return true;
        }
        expect(await worked()).toBe(false);
    });
});

describe('Validate internal functions', () => {
    test('_globP empty pattern', async () => {
        expect(await App._testing_._globP('', {})).toEqual([]);
    });

    test('normalizePattern relative', () => {
        const root = process.cwd();
        const r = App._testing_.normalizePattern('../../packages/**/*.ts', root);
        expect(r.root).toBe(path.dirname(path.dirname(root)));
        expect(r.pattern).toBe('packages/**/*.ts');
    });

    test('normalizePattern relative absolute', () => {
        const root = process.cwd();
        const p = '/packages/**/*.ts';
        const r = App._testing_.normalizePattern(p, root);
        expect(r.root).toBe(root);
        expect(r.pattern).toBe(p);
    });

    test('normalizePattern absolute', () => {
        const root = process.cwd();
        const p = path.join(__dirname, '**', '*.ts');
        const r = App._testing_.normalizePattern(p, root);
        expect(r.root).toBe(path.sep);
        expect(r.pattern).toBe(p);
    });
});

describe('Application, Validate Samples', () => {
    sampleTests().map((sample) =>
        test(`Test file: "${sample.file}"`, async () => {
            const logger = new Logger();
            const { file, issues, options = { wordsOnly: true, unique: false } } = sample;
            const result = await App.lint([file], options, logger);
            expect(result.files).toBe(1);
            expect(logger.issues.map((issue) => issue.text)).toEqual(issues);
            expect(result.issues).toBe(issues.length);
        })
    );
});

interface SampleTest {
    file: string;
    issues: string[];
    options?: App.CSpellApplicationOptions;
}

function sampleTests(): SampleTest[] {
    // cspell:disable
    return [
        {
            file: path.resolve(path.join(__dirname, '../samples/src/drives.ps1')),
            issues: ['Woude', 'Woude'],
        },
        {
            file: path.resolve(path.join(__dirname, '../../cspell-lib/samples/src/drives.ps1')),
            issues: ['Woude', 'Woude'],
        },
        { file: 'samples/src/drives.ps1', issues: ['Woude', 'Woude'] },
        { file: 'samples/src/sample.c', issues: [] },
        { file: 'samples/src/sample.go', issues: ['garbbage'] },
        { file: 'samples/src/sample.py', issues: ['garbbage'] },
        {
            file: 'samples/src/sample.tex',
            issues: ['includegraphics', 'Zotero'],
        },
        {
            file: path.resolve(path.join(__dirname, '../samples/src/drives.ps1')),
            issues: ['Woude', 'Woude'],
        },
        {
            file: path.resolve(path.join(__dirname, '../../cspell-lib/samples/src/drives.ps1')),
            issues: ['Woude', 'Woude'],
        },
    ];
    // cspell:enable
}

class Logger implements App.Emitters {
    log: string[] = [];
    issueCount = 0;
    errorCount = 0;
    debugCount = 0;
    infoCount = 0;
    issues: App.Issue[] = [];

    issue = (issue: App.Issue) => {
        this.issues.push(issue);
        this.issueCount += 1;
        const { uri, row, col, text } = issue;
        this.log.push(`Issue: ${uri}[${row}, ${col}]: Unknown word: ${text}`);
    };

    error = (message: string, error: Error) => {
        this.errorCount += 1;
        this.log.push(`Error: ${message} ${error.toString()}`);
        return Promise.resolve();
    };

    info = (message: string) => {
        this.infoCount += 1;
        this.log.push(`Info: ${message}`);
    };

    debug = (message: string) => {
        this.debugCount += 1;
        this.log.push(`Debug: ${message}`);
    };
}
