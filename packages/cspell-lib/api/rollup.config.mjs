import dts from 'rollup-plugin-dts';

const config = [
    {
        input: './dist/esm/index.d.mts',
        output: [{ file: './api/api.d.ts', format: 'es' }],
        plugins: [dts()],
    },
];

export default config;
