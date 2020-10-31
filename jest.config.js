module.exports = {
    "roots": [
        "./src"
    ],
    "transform": {
        "^.+\\.tsx?$": "ts-jest"
    },
    "testRegex": "(/__tests__/.*|(\\.|/)(test|spec|perf))\\.tsx?$",
    "moduleFileExtensions": [
        "ts",
        "tsx",
        "js",
        "jsx",
        "json",
        "node"
    ],
    "coverageReporters": ["html", "json", ["lcov", {"projectRoot": "../../"}], "text"],
    // "coverageProvider": "v8",
    "collectCoverageFrom": [
        "src/**/*.ts",
        "!**/*.test.helper.ts",
        "!**/node_modules/**",
        "!**/vendor/**"
    ],
    "moduleNameMapper": {
        "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$": "<rootDir>/src/__mocks__/fileMock.js",
        "\\.(css|less)$": "<rootDir>/src/__mocks__/styleMock.js"
    }
}
