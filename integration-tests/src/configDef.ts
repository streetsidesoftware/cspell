
export interface Config {
    repositories: Repository[];
}

export interface Repository {
    name?: string;
    path: string;
    args: string[];
}
