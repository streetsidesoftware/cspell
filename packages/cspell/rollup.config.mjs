/**
 * Rollup Config.
 */

import rollupPluginNodeResolve from '@rollup/plugin-node-resolve';
import rollupPluginTypescript from '@rollup/plugin-typescript';
import rollupPluginJson from '@rollup/plugin-json';
import rollupPluginCommonjs from '@rollup/plugin-commonjs';
import rollupPluginTerser from '@rollup/plugin-terser';
import dts from 'rollup-plugin-dts';
import { readFileSync } from 'fs';

const pkgContent = readFileSync('./package.json', 'utf-8');
const pkg = JSON.parse(pkgContent);

const common = {
    input: 'src/app.ts',

    output: {
        sourcemap: true,
    },

    external: [],

    treeshake: {
        annotations: true,
        moduleSideEffects: [],
        propertyReadSideEffects: false,
        unknownGlobalSideEffects: false,
    },
};

const commonTest = { ...common, input: 'src/app.test.ts' };

/**
 * Get new instances of all the common plugins.
 */
function getPlugins(tsconfig = 'tsconfig.build.json') {
    return [
        rollupPluginTypescript({
            tsconfig,
        }),
        rollupPluginNodeResolve({
            mainFields: ['module', 'exports', 'es', 'es6', 'esm', 'main'],
            extensions: ['.ts', '.js', '.mjs', '.node', '.json'],
            preferBuiltins: true,
        }),
        rollupPluginCommonjs({
            transformMixedEsModules: true,
        }),
        rollupPluginJson(),
        rollupPluginTerser({
            ecma: 2018,
            warnings: true,
            compress: { drop_console: false },
            format: { comments: false },
            sourceMap: true,
        }),
    ];
}

const copyright = `/*!
 * ${pkg.name} v${pkg.version}
 * Copyright ${new Date().getFullYear()} ${pkg.author}
 * Released under the ${pkg.license} License
 * ${pkg.homepage}
 */
`;

/**
 * The common JS build.
 */
const cjs = {
    ...common,

    output: {
        ...common.output,
        file: pkg.main,
        format: 'cjs',
        banner: copyright,
    },

    plugins: getPlugins(),
};

/**
 * The common JS test build.
 */
const cjsTest = {
    ...commonTest,

    output: {
        ...commonTest.output,
        file: './dist/app.test.js',
        format: 'cjs',
        banner: copyright,
    },

    plugins: getPlugins(),
};

const api = [
    {
        input: './dist/index.d.ts',
        output: [{ file: './api/index.d.ts', format: 'es' }],
        plugins: [dts()],
    },
    {
        input: './dist/application.d.ts',
        output: [{ file: './api/application.d.ts', format: 'es' }],
        plugins: [dts()],
    },
    {
        input: './dist/app.d.ts',
        output: [{ file: './api/app.d.ts', format: 'es' }],
        plugins: [dts()],
    },
];

const configs = [cjs, cjsTest, ...api];

export default [...configs];
