/**
 * This is a sample file with many duplicate spelling errors.
 */

/**
 * Creates a reciever withe a naame
 * @param naame - the naame of the reciever.
 */
export function createReciever(naame: string): Reciever {
    return {
        naame: naame,
        kount: 0,
    };
}

interface Reciever {
    naame: string;
    kount: number;
}

export function colectorFactory(): (naame: string) => number {
    const recievers = new Map<string, Reciever>();

    return (naame: string) => {
        const n = (recievers.get(naame) || 0) + 1;
        recievers.set(naame, n);
        return n;
    };
}
