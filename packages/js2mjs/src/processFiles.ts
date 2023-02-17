import * as path from 'path';
import { promises as fs } from 'fs';
import { isSupportedFileType, processFile } from './processFile.js';
import { rebaseFile } from './fileUtils.js';
import chalk from 'chalk';

export interface Options {
    keep?: boolean | undefined;
    output?: string | undefined;
    root?: string | undefined;
    progress: (message: string) => void;
    dryRun: boolean;
}

export interface ProcessFilesResult {
    fileCount: number;
    skippedCount: number;
}

export async function processFiles(files: string[], options: Options): Promise<ProcessFilesResult> {
    const { keep = false, output, root = process.cwd(), dryRun, progress: logProgress } = options;

    const result: ProcessFilesResult = {
        fileCount: 0,
        skippedCount: 0,
    };

    const fromDir = path.resolve(root);
    const toDir = output ? path.resolve(output) : fromDir;

    const cwd = process.cwd();

    function relName(filename: string): string {
        return path.relative(cwd, filename);
    }

    async function mkFileDir(filename: string) {
        !dryRun && (await fs.mkdir(path.dirname(filename), { recursive: true }));
    }

    async function cp(src: string, dst: string) {
        !dryRun && (await fs.cp(src, dst));
    }

    async function rm(file: string) {
        !dryRun && (await fs.rm(file));
    }

    async function writeFile(filename: string, content: string) {
        !dryRun && (await fs.writeFile(filename, content, 'utf-8'));
    }

    async function copyFile(filename: string) {
        if (fromDir === toDir) {
            return;
        }
        const src = path.resolve(fromDir, filename);
        const target = rebaseFile(src, fromDir, toDir);
        if (target === filename) return;
        logProgress(`${relName(src)} - ${chalk.yellow('copy')}`);
        await mkFileDir(target);
        await cp(src, target);
    }

    async function removeSrcIfNecessary(filename: string) {
        if (keep || fromDir !== toDir) return;
        logProgress(`${relName(filename)} - ${chalk.yellow('renamed')}`);
        await rm(filename);
    }

    async function handleFile(filename: string) {
        const src = path.resolve(fromDir, filename);
        const content = await fs.readFile(src, 'utf8');
        const result = processFile(src, content, fromDir);
        if (result.skipped) {
            await copyFile(filename);
            return;
        }
        const dst = rebaseFile(result.filename, fromDir, toDir);
        logProgress(`${relName(src)} -> ${relName(dst)} ${chalk.green('Updated')}`);
        await mkFileDir(dst);
        writeFile(dst, result.content);
        if (dst !== src) {
            await removeSrcIfNecessary(src);
        }
    }

    const pending: Promise<void>[] = [];

    for (const file of files) {
        const filename = path.resolve(fromDir, file);
        pending.push(!isSupportedFileType(filename) ? copyFile(filename) : handleFile(filename));
    }

    await Promise.all(pending);

    return result;
}
