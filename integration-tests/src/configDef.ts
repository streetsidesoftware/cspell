export interface Config {
    repositories: Repository[];
}

export interface Repository {
    path: string;
    url: string;
    args: string[];
}
