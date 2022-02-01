require('ts-node').register({
    compilerOptions: {
        module: 'CommonJS'
    },
});

// @ts-ignore
module.exports = require('./rollup.config.ts');
