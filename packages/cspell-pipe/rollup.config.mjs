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
    ];
}

/** @type {import('rollup').RollupOptions[]} */
const configs = [
    {
        ...common,
        input: 'src/sync/index.ts',
        external: [],
        output: { ...common.output, file: 'dist/cjs/sync/index.cjs', format: 'cjs' },
        plugins: getPlugins(),
    },
    {
        ...common,
        output: [
            { ...common.output, file: pkg.main, format: 'cjs' },
            // { ...common.output, file: pkg.module, format: 'es' },
        ],
        plugins: getPlugins(),
    },
];
export default configs;
