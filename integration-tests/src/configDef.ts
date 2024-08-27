export interface Config {
    repositories: Repository[];
}

export interface Repository {
    path: string;
    url: string;
    branch: string | undefined;
    commit: string;
    args: string[];
    /**
     * Only snapshot unique issues.
     * @default true
     */
    uniqueOnly?: boolean;
    /**
     * List all files in the report, even if they have no issues.
     * @default false
     */
    listAllFiles?: boolean;
    postCheckoutSteps: string[] | undefined;
}
