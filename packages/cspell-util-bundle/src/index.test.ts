import { expect } from 'chai';
import { xregexp } from '.';

describe('Validate Bundled Libraries', () => {
    test('Test xregexp', () => {
        expect(typeof xregexp).to.be.equal('function');

        const x = xregexp('t$');
        expect(x.test('first')).to.be.true;
        expect(x.test('second')).to.be.false;
    });
});
