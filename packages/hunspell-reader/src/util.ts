

export function hrTimeToSeconds([seconds, nanoseconds]: number[]) {
    return seconds + nanoseconds / 1000000000;
}
