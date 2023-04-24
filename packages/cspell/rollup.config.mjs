import dts from 'rollup-plugin-dts';

const config = [
    {
        input: './dist/esm/index.d.mts',
        output: [{ file: './api/index.d.ts', format: 'es' }],
        plugins: [dts()],
    },
    {
        input: './dist/esm/application.d.mts',
        output: [{ file: './api/application.d.ts', format: 'es' }],
        plugins: [dts()],
    },
    {
        input: './dist/esm/app.d.mts',
        output: [{ file: './api/app.d.ts', format: 'es' }],
        plugins: [dts()],
    },
];

export default config;
