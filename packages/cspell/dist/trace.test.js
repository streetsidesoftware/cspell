"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const _1 = require(".");
const operators_1 = require("rxjs/operators");
describe('Verify trace', () => {
    it('tests tracing a word', async () => {
        const words = ['apple'];
        const config = _1.getDefaultSettings();
        const result = await _1.traceWords(words, config)
            .pipe(operators_1.toArray())
            .toPromise();
        chai_1.expect(result).to.not.be.empty;
        const foundIn = result.filter(r => r.found).map(r => r.dictName);
        chai_1.expect(foundIn).to.contain('en_US.trie.gz');
    });
});
//# sourceMappingURL=trace.test.js.map