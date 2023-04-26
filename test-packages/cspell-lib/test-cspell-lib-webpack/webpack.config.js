const path = require('path');
// @ts-check

/**@type {import('webpack').Configuration}*/
const config = {
    entry: {
        main: './src/index.mts',
    },
    target: 'node',
    module: {
        rules: [
            {
                test: /\.[mc]?tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js', '.mts'],
    },
    node: {
        __filename: false,
        __dirname: false,
    },
    externalsType: 'commonjs-module',
    externalsPresets: {
        node: true,
    },
    // experiments: {
    //     outputModule: true,
    // },
    externals: [/^@cspell\/cspell-bundled-dicts/],
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js',
        libraryTarget: 'commonjs',
    },
};

module.exports = config;
