/* eslint-disable node/no-extraneous-import */
import rollupPluginNodeResolve from '@rollup/plugin-node-resolve';
import rollupPluginJson from '@rollup/plugin-json';
import rollupPluginCommonjs from '@rollup/plugin-commonjs';
import { readFileSync } from 'fs';

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));

/** @type {import('rollup').RollupOptions} */
const common = {
    input: 'lib/index.js',

    output: {
        sourcemap: true,
    },

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
function getPlugins() {
    return [
        rollupPluginNodeResolve({
            mainFields: ['module', 'exports', 'es', 'es6', 'esm', 'main'],
            extensions: ['.ts', '.js', '.mjs', '.mts', '.node', '.json'],
            preferBuiltins: true,
        }),
        rollupPluginCommonjs({
            transformMixedEsModules: true,
        }),
        rollupPluginJson(),
    ];
}

const plugins = getPlugins();

/** @type {import('rollup').RollupOptions[]} */
const configs = [
    {
        ...common,
        output: [{ ...common.output, file: pkg.main, format: 'cjs' }],
        plugins,
    },
];
export default configs;
