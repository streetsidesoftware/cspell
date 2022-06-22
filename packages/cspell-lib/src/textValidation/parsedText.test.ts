import { mapRangeBackToOriginalPos, mapRangeToLocal } from './parsedText';

describe('parsedText', () => {
    test.each`
        start | end   | map                     | expected
        ${0}  | ${0}  | ${[]}                   | ${[0, 0]}
        ${5}  | ${10} | ${[]}                   | ${[5, 10]}
        ${5}  | ${10} | ${undefined}            | ${[5, 10]}
        ${6}  | ${11} | ${[5, 5, 9, 6, 19, 16]} | ${[6, 14]}
        ${6}  | ${17} | ${[5, 5, 9, 6, 19, 16]} | ${[6, 20]}
        ${0}  | ${17} | ${[5, 5, 9, 6, 19, 16]} | ${[0, 20]}
    `('mapRangeBackToOriginalPos $start $end $map', ({ start, end, map, expected }) => {
        expect(mapRangeBackToOriginalPos([start, end], map)).toEqual(expected);
    });

    test.each`
        start | end   | map                           | expected
        ${0}  | ${0}  | ${[]}                         | ${[0, 0]}
        ${5}  | ${10} | ${[]}                         | ${[5, 10]}
        ${5}  | ${10} | ${undefined}                  | ${[5, 10]}
        ${6}  | ${14} | ${[5, 5, 9, 6, 19, 16]}       | ${[6, 11]}
        ${6}  | ${20} | ${[5, 5, 9, 6, 19, 16]}       | ${[6, 17]}
        ${0}  | ${20} | ${[5, 5, 9, 6, 19, 16]}       | ${[0, 17]}
        ${6}  | ${14} | ${[0, 0, 5, 5, 9, 6, 19, 16]} | ${[6, 11]}
        ${6}  | ${20} | ${[0, 0, 5, 5, 9, 6, 19, 16]} | ${[6, 17]}
        ${0}  | ${30} | ${[0, 0, 5, 5, 9, 6, 19, 16]} | ${[0, 27]}
    `('mapRangeBackToOriginalPos $start $end $map', ({ start, end, map, expected }) => {
        expect(mapRangeToLocal([start, end], map)).toEqual(expected);
    });
});
