/*
 * Check that the published type declarations work without `@types/node`.
 * Type-checks the `.d.ts` files that each public package's `exports` and `types` point to, with only the `esnext` and
 * `dom` libs. A missing name, namespace, or module fails the check. Other errors are reported, but don't fail it.
 * Run after `pnpm run build`.
 * Usage: node ./scripts/check-types-without-node.mts [package-dir ...]
 * Exit codes: 0 no missing types, 2 missing types found, 1 error.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

import ts from 'typescript';

const rootDir = fileURLToPath(new URL('..', import.meta.url));

const compilerOptions: ts.CompilerOptions = {
    lib: ['lib.esnext.d.ts', 'lib.dom.d.ts'],
    types: [],
    module: ts.ModuleKind.NodeNext,
    moduleResolution: ts.ModuleResolutionKind.NodeNext,
    target: ts.ScriptTarget.ES2023,
    noEmit: true,
    skipLibCheck: false,
    strict: true,
};

/**
 * Errors that mean a declaration uses something the consumer doesn't have.
 */
const missingTypeCodes = new Set([
    2304, // Cannot find name 'x'.
    2307, // Cannot find module 'x' or its corresponding type declarations.
    2503, // Cannot find namespace 'x'.
    2552, // Cannot find name 'x'. Did you mean 'y'?
    2580, // Cannot find name 'x'. Do you need to install type definitions for node?
    2591, // Cannot find name 'x'. Do you need to install type definitions for node? (with `types` set)
]);

interface PackageJson {
    name: string;
    private?: boolean;
    types?: string;
    exports?: unknown;
}

function collectTargets(exp: unknown, out: Set<string>): Set<string> {
    if (typeof exp === 'string') {
        out.add(exp);
    } else if (exp && typeof exp === 'object') {
        for (const value of Object.values(exp)) collectTargets(value, out);
    }
    return out;
}

function findDeclaration(pkgDir: string, target: string): string | undefined {
    const base = target.replace(/\.(?:[cm]?js|d\.[cm]?ts)$/, '');
    return ['.d.ts', '.d.mts', '.d.cts']
        .map((ext) => path.join(pkgDir, base + ext))
        .find((file) => fs.existsSync(file));
}

function checkPackage(pkgDir: string): { missing: number; other: number } | undefined {
    const pkg = JSON.parse(fs.readFileSync(path.join(pkgDir, 'package.json'), 'utf8')) as PackageJson;
    if (pkg.private) return undefined;
    const targets = collectTargets(pkg.exports, new Set());
    if (pkg.types) targets.add(pkg.types);
    const files = [...new Set([...targets].map((t) => findDeclaration(pkgDir, t)).filter((f) => f !== undefined))];
    if (!files.length) return undefined;

    const program = ts.createProgram(files, compilerOptions);
    const diagnostics = ts.getPreEmitDiagnostics(program);
    const missing = diagnostics.filter((d) => missingTypeCodes.has(d.code));
    const other = diagnostics.filter((d) => !missingTypeCodes.has(d.code));

    console.log(`${pkg.name}: ${missing.length ? `${missing.length} missing` : 'ok'}`);
    for (const d of missing) console.log(`  error ${formatDiagnostic(d)}`);
    for (const d of other) console.log(`  note  ${formatDiagnostic(d)}`);
    return { missing: missing.length, other: other.length };
}

function formatDiagnostic(d: ts.Diagnostic): string {
    const message = ts.flattenDiagnosticMessageText(d.messageText, ' ');
    if (!d.file || d.start === undefined) return `TS${d.code}: ${message}`;
    const { line, character } = d.file.getLineAndCharacterOfPosition(d.start);
    const file = path.relative(rootDir, d.file.fileName).split(path.sep).join('/');
    return `${file}:${line + 1}:${character + 1} TS${d.code}: ${message}`;
}

function main(): number {
    const { positionals } = parseArgs({ allowPositionals: true });
    const packagesDir = path.join(rootDir, 'packages');
    const pkgDirs = positionals.length
        ? positionals.map((p) => path.resolve(p))
        : fs
              .readdirSync(packagesDir)
              .map((name) => path.join(packagesDir, name))
              .filter((dir) => fs.existsSync(path.join(dir, 'package.json')));

    let missing = 0;
    for (const dir of pkgDirs) {
        missing += checkPackage(dir)?.missing ?? 0;
    }
    if (missing) {
        console.log(
            `\n${missing} missing type(s). A published declaration needs \`@types/node\` or another missing type.`,
        );
        return 2;
    }
    return 0;
}

try {
    process.exitCode = main();
} catch (e) {
    console.error(e);
    process.exitCode = 1;
}
