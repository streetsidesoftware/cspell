import { readFileSync } from 'node:fs';

import rollupPluginCommonjs from '@rollup/plugin-commonjs';
import rollupPluginJson from '@rollup/plugin-json';
import rollupPluginNodeResolve from '@rollup/plugin-node-resolve';
import rollupPluginTypescript from '@rollup/plugin-typescript';

const pkg = JSON.parse(readFileSync('./package.json', 'utf8'));

/** @type {import('rollup').RollupOptions} */
const common = {
    input: 'src/index.mts',

    output: {
        sourcemap: true,
    },

    // external: ['@cspell/cspell-pipe', '@cspell/cspell-pipe/sync'],

    treeshake: {
        annotations: true,
        moduleSideEffects: [],
        propertyReadSideEffects: false,
        unknownGlobalSideEffects: false,
    },
    external: ['@cspell/dynamic-import'],
};

/**
 * Get new instances of all the common plugins.
 */
function getPlugins(tsconfig = 'tsconfig.json') {
    return [
        rollupPluginTypescript({
            tsconfig,
        }),
        rollupPluginNodeResolve({
            mainFields: ['module', 'exports', 'es', 'es6', 'esm', 'main'],
            extensions: ['.ts', '.js', '.mjs', '.mts', '.node', '.json'],
            preferBuiltins: true,
        }),
        rollupPluginCommonjs({
            transformMixedEsModules: true,
        }),
        rollupPluginJson(),
        // rollupPluginTerser({
        //     ecma: 2018,
        //     warnings: true,
        //     compress: { drop_console: false },
        //     format: { comments: false },
        //     sourceMap: true,
        // }),
    ];
}

// browser-friendly UMD build
// CommonJS (for Node) and ES module (for bundlers) build.
// (We could have three entries in the configuration array
// instead of two, but it's quicker to generate multiple
// builds from a single configuration where possible, using
// an array for the `output` option, where we can specify
// `file` and `format` for each target)
/** @type {import('rollup').RollupOptions[]} */
const configs = [
    {
        ...common,
        output: [
            { ...common.output, file: pkg.main, format: 'cjs' },
            { ...common.output, file: pkg.module, format: 'es' },
        ],
        plugins: getPlugins(),
    },
];
export default configs;
