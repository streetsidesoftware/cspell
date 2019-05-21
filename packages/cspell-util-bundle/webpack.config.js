//@ts-check
'use strict';

const path = require('path');

// cspell:ignore devtool

/**@type {import('webpack').Configuration}*/
const config = {
    target: 'node',
    entry: {
        extension: './src/index.ts'
    },
    output: {
        // the bundle is stored in the 'dist' folder (check package.json), 📖 -> https://webpack.js.org/configuration/output/
        path: path.resolve(__dirname, 'dist'),
        filename: 'index.js',
        libraryTarget: 'commonjs2',
        devtoolModuleFilenameTemplate: '../[resource-path]'
    },
    devtool: 'source-map',
    externals: {
    },
    resolve: {
        // support reading TypeScript and JavaScript files, 📖 -> https://github.com/TypeStrong/ts-loader
        extensions: [ '.ts', '.js' ]
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'ts-loader?configFile=tsconfig.webpack.json'
                    }
                ]
            }
        ]
    }
};
module.exports = config;
