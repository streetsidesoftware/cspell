"""Roman Numbers"""
import re

class OutOfRangeError(ValueError): pass
class NotIntegerError(ValueError): pass
class InvalidRomanNumeral(ValueError): pass

romanNumeralValues = {
    'I': 1,
    'V': 5,
    'X': 10,
    'L': 50,
    'C': 100,
    'D': 500,
    'M': 1000,
    'II': 2,
    'III': 3,
    'IV': 4,
    'IX': 9,
    'XX': 20,
    'XXX': 30,
    'XL': 40,
    'XC': 90,
    'CC': 200,
    'CCC': 300,
    'CD': 400,
    'CM': 900,
    'MM': 2000,
    'MMM': 3000,
    'MMMM': 4000,
}

ordered = sorted([(a[1], a[0]) for a in romanNumeralValues.items()], reverse=True)

def to_roman(number):
    if not isinstance(number, int):
        raise NotIntegerError('Non-integers cannot be converted.')

    if not (0 < number < 5000):
        raise OutOfRangeError('Valid numbers are 1 to 4999, got {0}'.format(number))

    r = ''
    for (num, numeral) in ordered:
        if num <= number:
            number -= num
            r += numeral
    return r

# Match against the numerals required for each digit
reMatchRoman = re.compile(r'''
    ^
    (M{0,4})?           # thousands
    (CM|CD|D?C{0,3})?   # hundreds
    (XC|XL|L?X{0,3})?   # tens
    (IX|IV|V?I{0,3})?   # ones
    $
    ''', re.VERBOSE)

# Split numerals up so we can look them up in romanNumeralValues
reSplitNumerals = re.compile(r"CM|D|CD|XC|L|XL|IX|V|IV|M+|C+|X+|I+")

def is_valid(roman):
    return reMatchRoman.match(roman) != None

def to_number(roman):
    if not isinstance(roman, str):
        raise InvalidRomanNumeral('Only valid roman numerals are allowed.')

    roman = roman.upper().strip()
    if not roman:
        raise InvalidRomanNumeral('Only valid roman numerals are allowed.')

    match = reMatchRoman.match(roman.upper())
    if match == None:
        raise InvalidRomanNumeral('Only valid roman numerals are allowed.')
    value = 0
    for digit in match.groups():
        for numeral in reSplitNumerals.findall(digit):
            value += romanNumeralValues[numeral]
    return value


if __name__ == '__main__':
    print(to_roman(1984))
    print(is_valid(to_roman(1999)))
    print(is_valid('hello'))
    print(to_roman(1492))
    print(to_number(to_roman(1492)))
    print(to_roman(1888))
    print(to_number(to_roman(1888)))
    for n in range(1, 4999):
        # print(to_roman(n))
        is_valid(to_roman(n))
        if n != to_number(to_roman(n)):
            raise ValueError('Failed on %d' % n)
    print('Done.')

'''
Deliberate misspelling for testing purposes: garbbage.

Django terms:
bbcontains
bboverlaps
createsuperuser
dbshell
'''
