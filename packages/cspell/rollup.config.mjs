import dts from 'rollup-plugin-dts';

const config = [
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

export default config;
