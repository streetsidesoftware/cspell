import { join } from 'path';

export const pkgDir = join(__dirname, '../..');

// eslint-disable-next-line @typescript-eslint/no-var-requires
export const npmPackage = require('../../package.json');
