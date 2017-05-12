import { expect } from 'chai';
import * as fReader from './fileReader';
import * as Rx from 'rxjs/Rx';
import * as fs from 'fs';
import * as path from 'path';

describe('Validate the fileReader', () => {
    const fileCities = path.join(__dirname, '..', '..', 'samples', 'cities.txt');
    const sampleCities = [
        'New York',
        'New Amsterdam',
        'Las Angles',
        'San Francisco',
        'New Delhi',
        'Mexico City',
        'London',
        'Paris',
        ''
    ];

    it('tests stringsToLines', () => {
        const strings = Rx.Observable.of('a1\n2\n3\n4', '5\n6');
        return fReader.stringsToLinesRx(strings).toArray().toPromise().then((a) => {
            expect(a).to.be.deep.equal(['a1', '2', '3', '45', '6']);
        });
    });

    it('tests stringsToLines trailing new line', () => {
        const strings = Rx.Observable.of('a1\n2\n3\n4', '5\n6\n');
        return fReader.stringsToLinesRx(strings).toArray().toPromise().then((a) => {
            expect(a).to.be.deep.equal(['a1', '2', '3', '45', '6', '']);
        });
    });

    it('test the file reader', () => {
        return fReader.stringsToLinesRx(fReader.textFileStreamRx(__filename))
            .toArray()
            .toPromise()
            .then(lines => {
                const actual = lines.join('\n');
                const expected = fs.readFileSync(__filename, 'UTF-8');
                expect(actual).to.equal(expected);
            });
    });

    it('test the lineReaderRx', () => {
        return fReader.lineReaderRx(__filename)
            .toArray()
            .toPromise()
            .then(lines => {
                const expected = fs.readFileSync(__filename, 'UTF-8').split('\n');
                expect(lines).to.deep.equal(expected);
            });
    });

    it('tests reading the cities sample', () => {
        return fReader.lineReaderRx(fileCities)
            .toArray()
            .toPromise()
            .then(lines => {
                expect(lines).to.be.deep.equal(sampleCities);
            });
    });

    it('test missing file', () => {
        return fReader.lineReaderRx(__filename + 'not.found')
            .toArray()
            .toPromise()
            .then(
                () => {
                    expect('not to be here').to.be.true;
                },
                (e) => {
                    expect(e).to.be.instanceof(Error);
                    expect(e.code).to.be.equal('ENOENT');
                }
            );
    });

});
