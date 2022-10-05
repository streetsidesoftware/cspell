export interface BuildOptions {
    /** Optional path to config file */
    config?: string;
}

export async function build(targets: string[] | undefined, options: BuildOptions) {
    console.log('build targets: %o, options: %o', targets, options);
}
