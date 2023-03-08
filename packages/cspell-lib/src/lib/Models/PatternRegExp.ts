export class PatternRegExp extends RegExp {
    constructor(pattern: RegExp | string) {
        super(pattern);
    }

    toJSON() {
        return this.toString();
    }
}
