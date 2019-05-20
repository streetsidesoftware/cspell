import mockRequire = require('mock-require');
const getStdinResult = {
    value: ''
};
mockRequire('get-stdin', () => {
    return Promise.resolve(getStdinResult.value);
});

import {expect} from 'chai';

import * as App from './application';


describe('Validate the Application', function() {
    this.timeout(10000);  // make sure we have enough time on Travis.

    it('Tests running the application', () => {
        const files = ['samples/text.txt'];
        const options = {};
        const logger = new Logger();
        const lint = App.lint(files, options, logger);
        return lint
            .then(result => {
                expect(logger.errorCount).to.be.equal(0);
                expect(logger.infoCount).to.be.greaterThan(0);
                expect(logger.debugCount).to.be.greaterThan(0);
                expect(result.files).equals(1);
            });
    });

    it('Tests running the application verbose', () => {
        const files = ['samples/text.txt'];
        const options = { verbose: true };
        const logger = new Logger();
        const lint = App.lint(files, options, logger);
        return lint
            .then(result => {
                expect(logger.errorCount).to.be.equal(0);
                expect(logger.infoCount).to.be.greaterThan(0);
                expect(logger.debugCount).to.be.greaterThan(0);
                expect(result.files).equals(1);
            });
    });

    it('Tests running the application words only', () => {
        const files = ['samples/text.txt'];
        const options = { wordsOnly: true, unique: true };
        const logger = new Logger();
        const lint = App.lint(files, options, logger);
        return lint
            .then(result => {
                expect(logger.errorCount).to.be.equal(0);
                expect(logger.infoCount).to.be.greaterThan(0);
                expect(logger.debugCount).to.be.greaterThan(0);
                expect(result.files).equals(1);
            });
    });

    it('Tests running the trace command', async () => {
        const result = await App.trace(['apple'], {});
        expect(result.length).to.be.greaterThan(2);

        const foundIn = result.filter(r => r.found).map(r => r.dictName);
        expect(foundIn).to.contain('en_US.trie.gz');
    });

    it('Tests checkText', async () => {
        const result = await App.checkText('samples/latex/sample2.tex', {});
        expect(result.items.length).to.be.gt(50);
        expect(result.items.map(i => i.text).join('')).to.be.equal(result.text);
    });

    it('Test running the application from stdin', async () => {
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
        expect(result.files).equals(1);
        expect(logger.errorCount).to.be.equal(0);
        expect(logger.infoCount).to.be.greaterThan(0);
        expect(logger.debugCount).to.be.greaterThan(0);
        expect(logger.issues.map(i => i.text)).to.be.deep.equal(['texxt']);
    });
});

describe('Application, Validate Samples', () => {
    sampleTests().forEach(sample =>
        it(`Test file: "${sample.file}"`, async () => {
            const logger = new Logger();
            const { file, issues, options = {wordsOnly: true, unique: false } } = sample;
            const result = await App.lint([ file ], options, logger);
            expect(result.files).to.be.equal(1);
            expect(logger.issues.map(issue => issue.text)).to.be.deep.equal(issues);
            expect(result.issues).to.be.equal(issues.length);
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
        { file: 'samples/src/drives.ps1', issues: ['Woude', 'Woude'] },
        { file: 'samples/src/sample.c', issues: [] },
        { file: 'samples/src/sample.go', issues: ['garbbage'] },
        { file: 'samples/src/sample.py', issues: ['garbbage'] },
        { file: 'samples/src/sample.tex', issues: ['hammersley', 'gmail', 'includegraphics', 'Zotero'] },
    ];
    // cspell:enable
}

class Logger implements App.Emitters {
    log: string[] = [];
    issueCount: number = 0;
    errorCount: number = 0;
    debugCount: number = 0;
    infoCount: number = 0;
    issues: App.Issue[] = [];

    issue = (issue: App.Issue) => {
        this.issues.push(issue);
        this.issueCount += 1;
        const {uri, row, col, text} = issue;
        this.log.push(`Issue: ${uri}[${row}, ${col}]: Unknown word: ${text}`);
    }

    error = (message: string, error: Error) => {
        this.errorCount += 1;
        this.log.push(`Error: ${message} ${error.toString()}`);
        return Promise.resolve();
    }

    info = (message: string) => {
        this.infoCount += 1;
        this.log.push(`Info: ${message}`);
    }

    debug = (message: string) => {
        this.debugCount += 1;
        this.log.push(`Debug: ${message}`);
    }
}
