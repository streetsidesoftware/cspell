"use strict";
const tds = require("./TextDocumentSettings");
exports.diagSource = 'cSpell Checker';
const TV = require("./textValidator");
function validateText(text, settings) {
    const dict = tds.getDictionary(settings);
    return dict.then(dict => [...TV.validateText(text, dict, settings)]);
}
exports.validateText = validateText;
//# sourceMappingURL=validator.js.map