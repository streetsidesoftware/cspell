"use strict";
const chai_1 = require("chai");
const wordListCompiler_1 = require("./wordListCompiler");
describe('Validate the wordListCompiler', function () {
    it('tests splitting lines', () => {
        const line = 'AppendIterator::getArrayIterator';
        chai_1.expect(wordListCompiler_1.lineToWords(line).toArray()).to.deep.equal([
            'append',
            'iterator',
            'get',
            'array',
        ]);
        chai_1.expect(wordListCompiler_1.lineToWords('Austin Martin').toArray()).to.deep.equal([
            'austin martin', 'austin', 'martin'
        ]);
        chai_1.expect(wordListCompiler_1.lineToWords('JPEGsBLOBs').toArray()).to.deep.equal(['jpegs', 'blobs']);
        chai_1.expect(wordListCompiler_1.lineToWords('CURLs CURLing').toArray()).to.deep.equal(['curls curling', 'curls', 'curling']);
        chai_1.expect(wordListCompiler_1.lineToWords('DNSTable Lookup').toArray()).to.deep.equal(['dns', 'table', 'lookup']);
        chai_1.expect(wordListCompiler_1.lineToWords('OUTRing').toArray()).to.deep.equal(['outring']);
        chai_1.expect(wordListCompiler_1.lineToWords('OUTRings').toArray()).to.deep.equal(['outrings']);
        chai_1.expect(wordListCompiler_1.lineToWords('DIRs').toArray()).to.deep.equal(['dirs']);
        chai_1.expect(wordListCompiler_1.lineToWords('AVGAspect').toArray()).to.deep.equal(['avg', 'aspect']);
        chai_1.expect(wordListCompiler_1.lineToWords('New York').toArray()).to.deep.equal(['new york', 'new', 'york']);
        chai_1.expect(wordListCompiler_1.lineToWords('Namespace DNSLookup').toArray()).to.deep.equal(['namespace', 'dns', 'lookup']);
        chai_1.expect(wordListCompiler_1.lineToWords('well-educated').toArray()).to.deep.equal(['well-educated', 'well', 'educated']);
        // Sadly we cannot do this one correctly
        chai_1.expect(wordListCompiler_1.lineToWords('CURLcode').toArray()).to.deep.equal(['cur', 'lcode']);
        chai_1.expect(wordListCompiler_1.lineToWords('kDNSServiceErr_BadSig').toArray()).to.deep.equal([
            'dns',
            'service',
            'err',
            'bad',
            'sig',
        ]);
        chai_1.expect(wordListCompiler_1.lineToWords('apd_get_active_symbols').toArray()).to.deep.equal([
            'apd',
            'get',
            'active',
            'symbols',
        ]);
    });
});
const phpLines = `
    apd_get_active_symbols
    apd_set_pprof_trace
    apd_set_session
    apd_set_session_trace
    apd_set_session_trace_socket
    AppendIterator::append
    AppendIterator::current
    AppendIterator::getArrayIterator
    AppendIterator::getInnerIterator
    AppendIterator::getIteratorIndex
    AppendIterator::key
`;
//# sourceMappingURL=wordListCompiler.test.js.map