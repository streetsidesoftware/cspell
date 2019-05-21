import { expect } from 'chai';
import { libraries } from './index';

describe('Validate Bundled Libraries', () => {
    it('Test xregexp', () => {
        expect(typeof libraries.xregexp).to.be.equal('function');
    });
});
