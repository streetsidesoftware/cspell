import {expect} from 'chai';
import * as Conv from './converter';

describe('Test Converter', () => {
    it('tests empty conversion', () => {
        const conv = new Conv.Converter([]);
        expect(conv.convert('hello')).to.be.equal('hello');
        expect(conv.convert('')).to.be.equal('');
    });

    it('tests basic conversion', () => {
        const conv = new Conv.Converter([{ from: 'hello', to: 'good-bye'}]);
        expect(conv.convert('hello')).to.be.equal('good-bye');
        expect(conv.convert('')).to.be.equal('');
        expect(conv.convert('Please say hello.')).to.be.equal('Please say good-bye.');
    });

    it('tests multiple conversions', () => {
        const conv = new Conv.Converter([
            { from: 'hello', to: 'good-bye'},
            { from: 'good-bye', to: 'hello'},
        ]);
        expect(conv.convert('hello hello hello Hello!')).to.be.equal('good-bye good-bye good-bye Hello!');
        expect(conv.convert('hello good-bye hello')).to.be.equal('good-bye hello good-bye');
    });

    it('tests multiple conversions (with matching replacement)', () => {
        const conv = new Conv.Converter([{ from: 'hello', to: 'say hello'}]);
        expect(conv.convert('hello hello hello')).to.be.equal('say hello say hello say hello');
    });

    it('tests unicode characters', () => {
        const conv = new Conv.Converter([
            { from: 'hello', to: 'good-bye' },
            { from: 'good-bye', to: 'hello' },
            { from: 'áá', to: 'aa' },
            { from: 'éé', to: 'ee' },
            { from: 'íé', to: 'ie' },
            { from: 'óó', to: 'oo' },
            { from: 'úú', to: 'uu' },
            { from: 'óé', to: 'oe' },
            { from: '’', to: '\'' },
            { from: 'ij', to: '"ĳ' },
            { from: 'IJ', to: '"Ĳ' },
            { from: 'ĳ', to: 'ij' },
            { from: 'Ĳ', to: 'IJ' },
        ]);
        expect(conv.convert('')).to.be.equal('');
        expect(conv.convert('ĳ')).to.be.equal('ij');
        expect(conv.convert('áá')).to.be.equal('aa');
        expect(conv.convert('’hello’')).to.be.equal("'good-bye'");
    });

    it('tests with regex characters in the from (regex is not supported as a pattern)', () => {
        const conv = new Conv.Converter([
            { from: '^h', to: 'g' },
            { from: '^g', to: 'f' },
            { from: 'f$', to: 'g' },
            { from: 'g$', to: 'h' },
            { from: '|', to: '!' },
        ]);
        expect(conv.convert('helping')).to.be.equal('helping');
        expect(conv.convert('f$n')).to.be.equal('gn');
        expect(conv.convert('f|n')).to.be.equal('f!n');
    });
});