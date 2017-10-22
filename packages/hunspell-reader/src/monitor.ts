
const counters = new Map<string, number>();

let isLoggingOn = true;

export function incCounter(name: string, count = 1) {
    counters.set(name, (counters.get(name) || 0) + count);
    return counters.get(name)!;
}

/* istanbul ignore next */
export function log(message: string) {
    if (isLoggingOn) {
        const logMessage = [...counters]
            .map(([name, value]) => name + ': ' + value)
            .join('; ') + ' ' + message;
        console.log(logMessage);
    }
}
