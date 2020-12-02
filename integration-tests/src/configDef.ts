export interface Config {
    repositories: Repository[];
}

export interface Repository {
    path: string;
    url: string;
    commit: string;
    args: string[];
}
