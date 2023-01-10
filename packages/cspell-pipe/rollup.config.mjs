import rollupPluginCommonjs from '@rollup/plugin-commonjs';
import rollupPluginJson from '@rollup/plugin-json';
import rollupPluginNodeResolve from '@rollup/plugin-node-resolve';
import rollupPluginTypescript from '@rollup/plugin-typescript';
import { readFileSync } from 'fs';
import { globbySync } from 'globby';
import * as path from 'node:path';

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));

const cjsExports = globbySync(['operators/*.ts', 'sync/*.ts'], { ignore: ['**/*.test.ts'], cwd: 'src' });
// console.log('%o', cjsExports);

/** @type {import('rollup').RollupOptions} */
const common = {
    output: {
        sourcemap: false,
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
    ...cjsExports.map((filename) => ({
        ...common,
        input: `src/${filename}`,
        external: [],
        output: {
            ...common.output,
            file: `dist/cjs/${path.join(path.dirname(filename), path.basename(filename, '.ts')) + '.cjs'}`,
            format: 'cjs',
        },
        plugins: getPlugins(),
    })),
    {
        ...common,
        input: 'src/index.ts',
        output: [
            { ...common.output, file: pkg.main, format: 'cjs' },
            // { ...common.output, file: pkg.module, format: 'es' },
        ],
        plugins: getPlugins(),
    },
];
export default configs;
