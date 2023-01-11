const path = require('path');
// @ts-check

/**@type {import('webpack').Configuration}*/
const config = {
    entry: {
        main: './src/index.ts',
    },
    target: 'node',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    node: {
        __filename: false,
        __dirname: false,
    },
    externalsType: 'commonjs-module',
    externalsPresets: {
        node: true,
    },
    externals: [/^@cspell\/cspell-bundled-dicts/],
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js',
        libraryTarget: 'commonjs2',
    },
};

module.exports = config;
