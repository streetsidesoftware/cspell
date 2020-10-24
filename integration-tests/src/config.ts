import { Config } from './configDef';

export const config: Config = {
    repositories: [
        {
            path: "w3c/specberus",
            args: ['**/*.*']
        },
        {
            path: "bitjson/typescript-starter",
            args: ['{README.md,.github/*.md,src/**/*.ts}']
        },
    ],
}
