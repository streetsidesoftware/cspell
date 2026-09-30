interface OutputStream {
    columns?: number | undefined;
}

/**
 * The width to format output for.
 * `COLUMNS` wins when it is a positive integer, otherwise the width of the stream if it has one.
 */
export function getOutputWidth(
    stream: OutputStream = process.stdout,
    env: NodeJS.ProcessEnv = process.env,
): number | undefined {
    return parseColumns(env.COLUMNS) || stream.columns || undefined;
}

function parseColumns(value: string | undefined): number | undefined {
    if (!value || !/^\s*\d+\s*$/.test(value)) return undefined;
    return Number.parseInt(value, 10) || undefined;
}
