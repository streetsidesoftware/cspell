"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Settings_1 = require("./Settings");
const SpellingDictionary_1 = require("./SpellingDictionary");
const util = require("./util/util");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
function traceWords(words, settings) {
    const r = rxjs_1.from(words).pipe(
    // Combine the words with the configs
    operators_1.map(word => ({ word, config: settings })), 
    // Load the dictionaries
    operators_1.flatMap(async ({ word, config }) => {
        const settings = Settings_1.finalizeSettings(config);
        const dictionaries = (settings.dictionaries || [])
            .concat((settings.dictionaryDefinitions || []).map(d => d.name))
            .filter(util.uniqueFn);
        const dictSettings = Object.assign({}, settings, { dictionaries });
        const dicts = await SpellingDictionary_1.getDictionary(dictSettings);
        return { word, config, dicts };
    }), 
    // Search each dictionary for the word
    operators_1.flatMap(({ word, config, dicts }) => {
        return dicts.dictionaries.map(dict => ({
            word,
            found: dict.has(word),
            dictName: dict.name,
            dictSource: dict.source,
            configSource: config.name || '',
        }));
    }));
    return r;
}
exports.traceWords = traceWords;
//# sourceMappingURL=trace.js.map