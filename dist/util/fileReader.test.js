"use strict";
const chai_1 = require("chai");
const fileReader = require("./fileReader");
describe('Validate file reader', () => {
    it('Catches errors for non-existent files', () => {
        return fileReader.textFileStream('./non-existent.txt')
            .toPromise()
            .then(ok => {
            chai_1.expect(true).to.be.false;
        }, error => {
            chai_1.expect(error).to.be.instanceof(Error);
            return true; // convert the error into a success.
        });
    });
});
//# sourceMappingURL=fileReader.test.js.map