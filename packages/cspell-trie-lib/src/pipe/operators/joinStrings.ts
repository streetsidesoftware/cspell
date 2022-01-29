import { toArray } from '../helpers';
import { toPipeFn } from '../helpers/util';

export function opJoinStringsAsync(
    joinCharacter = ','
): (iter: AsyncIterable<AsyncIterable<string> | Iterable<string>>) => AsyncIterable<string> {
    async function* fn(iter: Iterable<Iterable<string>> | AsyncIterable<AsyncIterable<string> | Iterable<string>>) {
        for await (const v of iter) {
            const a = await toArray(v);
            yield a.join(joinCharacter);
        }
    }

    return fn;
}

export function opJoinStringsSync(joinCharacter = ','): (iter: Iterable<Iterable<string>>) => Iterable<string> {
    function* fn(iter: Iterable<Iterable<string>>) {
        for (const v of iter) {
            const a = toArray(v);
            yield a.join(joinCharacter);
        }
    }

    return fn;
}

export const opJoinStrings = (joinCharacter = ',') =>
    toPipeFn(opJoinStringsSync(joinCharacter), opJoinStringsAsync(joinCharacter));
