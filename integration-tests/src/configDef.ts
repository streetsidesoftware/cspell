export interface Config {
    repositories: Repository[];
}

export interface Repository {
    path: string;
    url: string;
    branch: string | undefined;
    commit: string;
    args: string[];
    postCheckoutSteps: string[] | undefined;
}
