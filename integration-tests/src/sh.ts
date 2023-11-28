import Shell from 'shelljs';

export interface ExecOptions {
    /** log output to console */
    echo?: boolean;
    /** exit if error code non zero */
    bail?: boolean;
}

export function exec(command: string, options: ExecOptions = {}): Shell.ExecOutputReturnValue {
    const { echo = false, bail = false } = options;
    if (echo) {
        console.log(command);
    }
    const result = Shell.exec(command, { silent: !echo, fatal: bail });
    return result;
}

export function execAsync(command: string, options: ExecOptions = {}): Promise<Shell.ExecOutputReturnValue> {
    const { echo = false, bail = false } = options;
    if (echo) {
        console.log(command);
    }
    return new Promise<Shell.ExecOutputReturnValue>((resolve) => {
        Shell.exec(
            command /* lgtm[js/shell-command-injection-from-environment] */,
            { silent: !echo, fatal: bail },
            (code, stdout, stderr) => resolve({ code, stdout, stderr }),
        );
    });
}
