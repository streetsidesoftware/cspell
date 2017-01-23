"use strict";
const affReader_1 = require("./affReader");
const fileReader_1 = require("./fileReader");
const Rx = require("rxjs/Rx");
class HunspellReader {
    constructor(affFile, dicFile) {
        this.affFile = affFile;
        this.dicFile = dicFile;
        this.aff = affReader_1.parseAffFileToAff(affFile);
    }
    readDicEntries(aff) {
        return fileReader_1.lineReader(this.dicFile, aff.affInfo.SET)
            .skip(1) // Skip the first line -- it's the number of words in the file context's.
        ;
    }
    readDicWords() {
        return Rx.Observable.fromPromise(this.aff)
            .flatMap(aff => this.readDicEntries(aff))
            .map(line => {
            const [word, rules] = line.split('/', 2);
            return { word, rules };
        });
    }
    readWordsEx() {
        const r = Rx.Observable.fromPromise(this.aff)
            .concatMap(aff => this.readDicEntries(aff)
            .concatMap(dicWord => aff.applyRulesToDicEntry(dicWord)));
        return r;
    }
    readWords() {
        return this.readWordsEx()
            .map(affWord => affWord.word);
    }
}
exports.HunspellReader = HunspellReader;
//# sourceMappingURL=HunspellReader.js.map