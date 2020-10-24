import * as Shell from 'shelljs';

export interface ExecOptions {
    /** log output to console */
    echo?: boolean;
    /** exit if error code non zero */
    bail?: boolean;
}


export function exec(command: string, options: ExecOptions = {}) {
    const { echo = false, bail = false } = options;
    if (echo) {
        console.log(command);
    }
    const result = Shell.exec(command);
    if (echo && result.toString()) {
        console.log(result.toString());
    }
    if (bail && result.code) {
        process.exit(result.code);
    }
    return result;
}
