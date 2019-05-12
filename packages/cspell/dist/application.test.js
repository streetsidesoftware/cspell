"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const App = require("./application");
describe('Validate the Application', function () {
    this.timeout(10000); // make sure we have enough time on Travis.
    it('Tests running the application', () => {
        const files = ['samples/text.txt'];
        const options = {};
        const logger = new Logger();
        const lint = App.lint(files, options, logger);
        return lint
            .then(result => {
            chai_1.expect(logger.errorCount).to.be.equal(0);
            chai_1.expect(logger.infoCount).to.be.greaterThan(0);
            chai_1.expect(logger.debugCount).to.be.greaterThan(0);
            chai_1.expect(result.files).equals(1);
        });
    });
    it('Tests running the application verbose', () => {
        const files = ['samples/text.txt'];
        const options = { verbose: true };
        const logger = new Logger();
        const lint = App.lint(files, options, logger);
        return lint
            .then(result => {
            chai_1.expect(logger.errorCount).to.be.equal(0);
            chai_1.expect(logger.infoCount).to.be.greaterThan(0);
            chai_1.expect(logger.debugCount).to.be.greaterThan(0);
            chai_1.expect(result.files).equals(1);
        });
    });
    it('Tests running the application words only', () => {
        const files = ['samples/text.txt'];
        const options = { wordsOnly: true, unique: true };
        const logger = new Logger();
        const lint = App.lint(files, options, logger);
        return lint
            .then(result => {
            chai_1.expect(logger.errorCount).to.be.equal(0);
            chai_1.expect(logger.infoCount).to.be.greaterThan(0);
            chai_1.expect(logger.debugCount).to.be.greaterThan(0);
            chai_1.expect(result.files).equals(1);
        });
    });
    it('Tests running the trace command', async () => {
        const result = await App.trace(['apple'], {});
        chai_1.expect(result.length).to.be.greaterThan(2);
        const foundIn = result.filter(r => r.found).map(r => r.dictName);
        chai_1.expect(foundIn).to.contain('en_US.trie.gz');
    });
    it('Tests checkText', async () => {
        const result = await App.checkText('samples/latex/sample2.tex', {});
        chai_1.expect(result.items.length).to.be.gt(50);
        chai_1.expect(result.items.map(i => i.text).join('')).to.be.equal(result.text);
    });
});
class Logger {
    constructor() {
        this.log = [];
        this.issueCount = 0;
        this.errorCount = 0;
        this.debugCount = 0;
        this.infoCount = 0;
        this.issue = (issue) => {
            this.issueCount += 1;
            const { uri, row, col, text } = issue;
            this.log.push(`Issue: ${uri}[${row}, ${col}]: Unknown word: ${text}`);
        };
        this.error = (message, error) => {
            this.errorCount += 1;
            this.log.push(`Error: ${message} ${error.toString()}`);
            return Promise.resolve();
        };
        this.info = (message) => {
            this.infoCount += 1;
            this.log.push(`Info: ${message}`);
        };
        this.debug = (message) => {
            this.debugCount += 1;
            this.log.push(`Debug: ${message}`);
        };
    }
}
//# sourceMappingURL=application.test.js.map