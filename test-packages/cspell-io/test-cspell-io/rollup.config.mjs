/* eslint-disable node/no-extraneous-import */
import rollupPluginNodeResolve from '@rollup/plugin-node-resolve';
import rollupPluginTypescript from '@rollup/plugin-typescript';
import rollupPluginJson from '@rollup/plugin-json';
import rollupPluginCommonjs from '@rollup/plugin-commonjs';
import { readFileSync } from 'fs';

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));

/** @type {import('rollup').RollupOptions} */
const common = {
    input: 'src/index.ts',

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
};

/**
 * Get new instances of all the common plugins.
 */
function getPlugins(tsconfig = 'tsconfig.esm.json') {
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

/** @type {import('rollup').RollupOptions[]} */
const configs = [
    {
        ...common,
        external: [],
        output: [
            { ...common.output, file: './dist/rollup/cjs/index.cjs', format: 'cjs' },
            { ...common.output, file: './dist/rollup/esm/index.mjs', format: 'es' },
            // { ...common.output, file: pkg.browser, format: 'umd', name: 'test-cspell-pipe-rollup' },
        ],
        plugins: getPlugins(),
    },
];
export default configs;
