import {expect} from 'chai';
import * as App from './application';


describe('Validate the Application', () => {
    it('Tests running the application', () => {
        const files = ['samples/text.txt'];
        const options = {};
        const logs: string[] = [];
        const logger = (message?: any) => {
            logs.push(message + '');
        };
        const app = new App.CSpellApplication(files, options, logger);
        return app.run()
            .then(result => {
                expect(result.files).equals(1);
            });
    });

    it('Tests running the application verbose', () => {
        const files = ['samples/text.txt'];
        const options = { verbose: true };
        const logs: string[] = [];
        const logger = (message?: any) => {
            logs.push(message + '');
        };
        const app = new App.CSpellApplication(files, options, logger);
        return app.run()
            .then(result => {
                expect(result.files).equals(1);
            });
    });

    it('Tests running the application words only', () => {
        const files = ['samples/text.txt'];
        const options = { wordsOnly: true, unique: true };
        const logs: string[] = [];
        const logger = (message?: any) => {
            logs.push(message + '');
        };
        const app = new App.CSpellApplication(files, options, logger);
        return app.run()
            .then(result => {
                expect(result.files).equals(1);
            });
    });
});
