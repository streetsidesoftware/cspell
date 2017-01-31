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
});
