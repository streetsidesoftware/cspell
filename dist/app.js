#!/usr/bin/env node
"use strict";
const path = require("path");
const program = require("commander");
const npmPackage = require(path.join(__dirname, '..', 'package.json'));
const application_1 = require("./application");
let showHelp = true;
program
    .version(npmPackage.version)
    .description('Spelling Checker for Code');
program
    .option('-c, --config <cspell.json>', 'Configuration file to use.  By default cspell looks for cspell.json in the current directory.')
    .option('-v, --verbose', 'output more information about the files being checked and the configuration')
    .option('-e, --exclude <glob>', 'Exclude files matching the glob pattern')
    .arguments('<files...>')
    .action(function (files, options) {
    showHelp = false;
    const app = new application_1.CSpellApplication(files, options, console.log);
    app.run().then(result => {
        console.log('CSpell: Files checked: %d, Issues found: %d', result.files, result.issues);
        process.exit(result.issues ? 1 : 0);
    }, (error) => {
        console.error(error.message);
        process.exit(1);
    });
});
program.parse(process.argv);
if (showHelp) {
    program.help();
}
//# sourceMappingURL=app.js.map