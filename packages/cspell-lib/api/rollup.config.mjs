import dts from 'rollup-plugin-dts';

const config = [
    {
        input: './dist/lib/index.d.ts',
        output: [{ file: './api/api.d.ts', format: 'es' }],
        plugins: [dts()],
    },
];

export default config;
