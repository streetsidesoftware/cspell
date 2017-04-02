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
});


class Logger implements App.Emitters {
    log: string[] = [];
    issueCount: number = 0;
    errorCount: number = 0;
    debugCount: number = 0;
    infoCount: number = 0;

    issue = (issue: App.Issue) => {
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
