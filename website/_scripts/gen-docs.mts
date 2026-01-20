export async function run(): Promise<void> {
    await (await import('./extract-properties.mts')).run();
    await (await import('./update-contributors.mts')).run();
    await (await import('./gen-help-lint.mts')).run();
}

if (import.meta.main) {
    run();
}
