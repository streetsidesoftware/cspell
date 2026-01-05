let debuggerIsAttached = false;

export function setDebuggerAttached(attached: boolean): boolean {
    debuggerIsAttached = attached;
    return debuggerIsAttached;
}

export function isDebuggerAttached(): boolean {
    return debuggerIsAttached;
}
