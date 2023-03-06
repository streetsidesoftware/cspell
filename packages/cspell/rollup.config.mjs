import dts from 'rollup-plugin-dts';

const config = [
    {
        input: './dist/cjs/index.d.ts',
        output: [{ file: './api/index.d.ts', format: 'es' }],
        plugins: [dts()],
    },
    {
        input: './dist/cjs/application.d.ts',
        output: [{ file: './api/application.d.ts', format: 'es' }],
        plugins: [dts()],
    },
    {
        input: './dist/cjs/app.d.ts',
        output: [{ file: './api/app.d.ts', format: 'es' }],
        plugins: [dts()],
    },
];

export default config;
