import { expect } from 'chai';
import * as lib from './index';

describe('Validate cspell-lib', () => {
    it('test an import', () => {
        expect(typeof lib.readFile).to.be.equal('function');
    });
});
