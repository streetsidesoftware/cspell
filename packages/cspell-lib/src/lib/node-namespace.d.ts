declare namespace NodeJS {
    interface Process {
        getActiveResourcesInfo(): string[];
    }
}
