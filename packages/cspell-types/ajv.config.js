'use strict';

const keywords = ['deprecatedMessage', 'markdownDescription', 'scope'];

function addKeywords(ajv) {
    for (const keyword of keywords) {
        ajv.addKeyword(keyword);
    }
}

module.exports = addKeywords;
