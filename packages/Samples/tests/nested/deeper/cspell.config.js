"use strict";

module.exports = /** @type {import("@cspell/cspell-types").FileSettings} */ ({
    language: "en-GB",
    dictionaries: ["typescript"],
    files: ["**/*.{html,js,json,md,scss,ts,vue}", "/.*.js"],
    ignorePaths: ["public/assets/", "src/ignore-me/"],
    ignoreWords: []
});
