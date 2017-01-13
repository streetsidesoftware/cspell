// cSpell:ignore jpegs outing dirs lcode
// cSpell:enableCompoundWords


import { expect } from 'chai';
import { lineToWords, compileWordList } from './wordListCompiler';
import * as path from 'path';
import * as fs from 'fs';

describe('Validate the wordListCompiler', function() {
    it('tests splitting lines', () => {
        const line = 'AppendIterator::getArrayIterator';
        expect(lineToWords(line).toArray()).to.deep.equal([
            'append',
            'iterator',
            'get',
            'array',
        ]);
        expect(lineToWords('Austin Martin').toArray()).to.deep.equal([
            'austin martin', 'austin', 'martin'
        ]);
        expect(lineToWords('JPEGsBLOBs').toArray()).to.deep.equal(['jpegs', 'blobs']);
        expect(lineToWords('CURLs CURLing').toArray()).to.deep.equal(['curls curling', 'curls', 'curling']);
        expect(lineToWords('DNSTable Lookup').toArray()).to.deep.equal(['dns', 'table', 'lookup']);
        expect(lineToWords('OUTRing').toArray()).to.deep.equal(['outring']);
        expect(lineToWords('OUTRings').toArray()).to.deep.equal(['outrings']);
        expect(lineToWords('DIRs').toArray()).to.deep.equal(['dirs']);
        expect(lineToWords('AVGAspect').toArray()).to.deep.equal(['avg', 'aspect']);
        expect(lineToWords('New York').toArray()).to.deep.equal(['new york', 'new', 'york']);
        expect(lineToWords('Namespace DNSLookup').toArray()).to.deep.equal(['namespace', 'dns', 'lookup']);
        expect(lineToWords('well-educated').toArray()).to.deep.equal(['well-educated', 'well', 'educated']);
        // Sadly we cannot do this one correctly
        expect(lineToWords('CURLcode').toArray()).to.deep.equal(['cur', 'lcode']);
        expect(lineToWords('kDNSServiceErr_BadSig').toArray()).to.deep.equal([
            'dns',
            'service',
            'err',
            'bad',
            'sig',
        ]);
        expect(lineToWords('apd_get_active_symbols').toArray()).to.deep.equal([
            'apd',
            'get',
            'active',
            'symbols',
        ]);
    });

    it('test reading and normalizing a file', () => {
        const sourceName = path.join(__dirname, '..', 'Samples', 'cities.txt');
        const destName = path.join(__dirname, '..', 'temp', 'cities.txt');
        return compileWordList(sourceName, destName)
        .then(s => {
            expect(s).to.be.not.empty;
            return new Promise((resolve, reject) => {
                s.on('finish', () => resolve());
                s.on('error', () => reject());
            }).then(() => {
                const output = fs.readFileSync(destName, 'UTF-8');
                expect(output).to.be.equal(citiesResult);
            });
        });
    });
});

const citiesResult = `\
amsterdam
angles
city
delhi
francisco
las
las angles
london
mexico
mexico city
new
new amsterdam
new delhi
new york
paris
san
san francisco
york
`;