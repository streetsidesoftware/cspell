'use strict';

const keywords = ['deprecatedMessage'];

function addKeywords(ajv) {
    for (const keyword of keywords) {
        ajv.addKeyword(keyword);
    }
}

module.exports = addKeywords;
