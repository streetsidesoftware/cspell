import { ansiWidth, fragmentString } from './ansi.js';

interface Fragment {
    type: 'text' | 'sep';
    text: string;
}

const wrapSep = /\s+|(?<=,)|\.(?=\w)/g;

export function wordWrapAnsiText(str: string, maxWidth: number, indent: string = '', sep: RegExp = wrapSep): string {
    if (!maxWidth || maxWidth <= 0) return str;
    if (str.length <= maxWidth) return str;
    if (str.includes('\n')) {
        return str
            .split('\n')
            .map((line) => wordWrapAnsiText(line, maxWidth, indent))
            .join('\n');
    }

    const fragments: Fragment[] = fragmentString(str, sep, 'sep');

    const lines: string[] = [];
    let line = '';

    for (const text of joinFragments(fragments)) {
        const lineWidth = ansiWidth(line);
        const textWidth = ansiWidth(text);
        if (line && lineWidth + textWidth > maxWidth) {
            if (line) {
                lines.push(line);
            }
            line = indent + text.trimStart();
            continue;
        }
        line += text;
    }

    if (line) {
        lines.push(line);
    }

    return lines.join('\n');
}

function* joinFragments(fragments: Fragment[]): Generator<string> {
    let last: Fragment | undefined;

    for (const frag of fragments) {
        if (frag.type === 'sep') {
            if (last) {
                yield last.text;
            }
            last = frag;
            continue;
        }
        yield last ? last.text + frag.text : frag.text;
        last = undefined;
    }
    if (last) {
        yield last.text;
    }
}
