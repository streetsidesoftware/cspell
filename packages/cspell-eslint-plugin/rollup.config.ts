/**
 * Rollup Config.
 */

import rollupPluginNodeResolve from '@rollup/plugin-node-resolve';
import rollupPluginTypescript from '@rollup/plugin-typescript';
import rollupPluginCommonJS from '@rollup/plugin-commonjs';
import rollupPluginAutoExternal from 'rollup-plugin-auto-external';
import rollupPluginDts from 'rollup-plugin-dts';
import type { RollupOptions } from 'rollup';

import pkg from './package.json';

const common: RollupOptions = {
    input: 'src/index.ts',

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

const commonTest: RollupOptions = { ...common, input: 'src/index.test.ts' };

/**
 * Get new instances of all the common plugins.
 */
function getPlugins(tsconfig = 'tsconfig.build.json') {
    return [
        rollupPluginAutoExternal(),
        rollupPluginNodeResolve(),
        rollupPluginTypescript({
            tsconfig,
        }),
    ];
}

function getPluginsTest(tsconfig = 'tsconfig.build.json') {
    return [rollupPluginCommonJS({}), ...getPlugins(tsconfig)];
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
const cjs: RollupOptions = {
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
const cjsTest: RollupOptions = {
    ...commonTest,

    output: {
        ...commonTest.output,
        file: './dist/index.test.js',
        format: 'cjs',
        banner: copyright,
    },

    plugins: getPluginsTest(),
};

/**
 * The esm build.
 */
const esm: RollupOptions = {
    ...common,

    output: {
        ...common.output,
        file: pkg.module,
        format: 'esm',
        banner: copyright,
    },

    plugins: getPlugins(),
};

/**
 * The esm build.
 */
const _esmTest: RollupOptions = {
    ...commonTest,

    output: {
        ...commonTest.output,
        file: './dist/index.test.mjs',
        format: 'esm',
        banner: copyright,
    },

    plugins: getPlugins(),
};

/**
 * The types.
 */
const dts: RollupOptions = {
    ...common,

    output: {
        file: pkg.types,
        format: 'esm',
    },

    plugins: [rollupPluginDts()],
};

const configs: RollupOptions[] = [cjs, /* cjsTest, */ esm, dts];

export default [...configs];
