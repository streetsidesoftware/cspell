import 'mocha';

export function testEach<T extends object>(cases: T[]): (title: string, fn: (arg: T) => void) => void {
    function fixTitle(title: string, testData: T) {
        const parts = title.split(/\b/g);
        for (let i = parts.length - 1; i >= 0; i--) {
            const prev = parts[i - 1];
            if (prev && prev.endsWith('$')) {
                parts[i - 1] = prev.slice(0, -1);
                parts[i] = '$' + parts[i];
            }
        }

        const map = new Map<string, string>(Object.entries(testData).map(([key, value]) => ['$' + key, `"${value}"`]));

        return parts.map((part) => map.get(part) ?? part).join('');
    }

    return (title, fn) => {
        for (const c of cases) {
            it(fixTitle(title, c), () => fn(c));
        }
    };
}
