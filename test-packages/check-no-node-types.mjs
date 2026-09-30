/*
 * Check that the published packages' types work in a project without `@types/node`.
 * Type-checks `no-node.mts` in the current directory with the settings in `tsconfig.no-node.json`, including the type
 * declarations of every package it imports. Fails if there are any errors, or if `@types/node` got loaded anyway, for
 * example through a `/// <reference types="node" />` in a dependency.
 * Usage, from a test package: node ../../check-no-node-types.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import ts from 'typescript';

const configFile = fileURLToPath(new URL('tsconfig.no-node.json', import.meta.url));
const entry = path.resolve('no-node.mts');

function main() {
    if (!fs.existsSync(entry)) {
        console.error(`Missing ${entry}`);
        return 1;
    }

    const config = ts.readConfigFile(configFile, ts.sys.readFile);
    if (config.error) return report([config.error]);
    const { options, errors } = ts.parseJsonConfigFileContent(config.config, ts.sys, path.dirname(configFile));
    if (errors.length) return report(errors);

    const program = ts.createProgram([entry], options);
    const diagnostics = ts.getPreEmitDiagnostics(program);
    if (diagnostics.length) return report(diagnostics);

    const nodeTypes = program.getSourceFiles().filter((f) => /[/\\]@types[/\\]node[/\\]/.test(f.fileName));
    if (nodeTypes.length) {
        const referencedBy = program
            .getSourceFiles()
            .filter((f) => f.typeReferenceDirectives.some((r) => r.fileName === 'node'))
            // `@types/node` loads `undici-types`, which refers back to it.
            .filter((f) => !/[/\\]undici-types[/\\]/.test(f.fileName))
            .map((f) => path.relative(process.cwd(), f.fileName));
        console.error('`@types/node` was loaded, so missing Node.js types would go unnoticed.');
        if (referencedBy.length) console.error(`Referenced by:\n  ${referencedBy.join('\n  ')}`);
        return 1;
    }

    console.log('Types check without @types/node.');
    return 0;
}

/**
 * @param {readonly ts.Diagnostic[]} diagnostics
 */
function report(diagnostics) {
    const host = {
        getCanonicalFileName: (f) => f,
        getCurrentDirectory: () => process.cwd(),
        getNewLine: () => '\n',
    };
    console.error(ts.formatDiagnostics(diagnostics, host));
    return 1;
}

process.exitCode = main();
