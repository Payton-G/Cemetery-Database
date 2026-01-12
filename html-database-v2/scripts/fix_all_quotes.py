#!/usr/bin/env python3

# Read the file
with open('findagrave_records_complete.json', 'r', encoding='utf-8') as f:
    content = f.read()

# Dictionary of names to fix (smart quotes to escaped straight quotes)
fixes = {
    chr(0x201C) + 'Billy' + chr(0x201D): '\\"Billy\\"',
    chr(0x201C) + 'Jack' + chr(0x201D): '\\"Jack\\"',
    chr(0x201C) + 'Chuck' + chr(0x201D): '\\"Chuck\\"',
    chr(0x201C) + 'Ken' + chr(0x201D): '\\"Ken\\"',
    chr(0x201C) + 'Dick' + chr(0x201D): '\\"Dick\\"',
    chr(0x201C) + 'Bill' + chr(0x201D): '\\"Bill\\"',
    chr(0x201C) + 'Swifty' + chr(0x201D): '\\"Swifty\\"',
    chr(0x201C) + 'Steve' + chr(0x201D): '\\"Steve\\"',
    chr(0x201C) + 'Bob' + chr(0x201D): '\\"Bob\\"',
    chr(0x201C) + 'Reggie' + chr(0x201D): '\\"Reggie\\"',
    chr(0x201C) + 'Fred' + chr(0x201D): '\\"Fred\\"',
    chr(0x201C) + 'Potsy' + chr(0x201D): '\\"Potsy\\"',
    chr(0x201C) + 'V. L.' + chr(0x201D): '\\"V. L.\\"',
    chr(0x201C) + 'Jim' + chr(0x201D): '\\"Jim\\"',
    chr(0x201C) + 'Pete' + chr(0x201D): '\\"Pete\\"',
    chr(0x201C) + 'Dave' + chr(0x201D): '\\"Dave\\"',
    chr(0x201C) + 'Bub' + chr(0x201D): '\\"Bub\\"',
    chr(0x201C) + 'Don' + chr(0x201D): '\\"Don\\"',
    chr(0x201C) + 'Lefty' + chr(0x201D): '\\"Lefty\\"',
    chr(0x201C) + 'Pops' + chr(0x201D): '\\"Pops\\"',
    chr(0x201C) + 'Ted' + chr(0x201D): '\\"Ted\\"',
    chr(0x201C) + 'Dub' + chr(0x201D): '\\"Dub\\"',
    chr(0x201C) + 'Billie' + chr(0x201D): '\\"Billie\\"',
    chr(0x201C) + 'Junior' + chr(0x201D): '\\"Junior\\"',
    chr(0x201C) + 'Chris' + chr(0x201D): '\\"Chris\\"',
    chr(0x201C) + 'Jr.' + chr(0x201D): '\\"Jr.\\"',
    chr(0x201C) + 'Les' + chr(0x201D): '\\"Les\\"',
    chr(0x201C) + 'Red' + chr(0x201D): '\\"Red\\"',
    chr(0x201C) + 'Eddie' + chr(0x201D): '\\"Eddie\\"',
}

count = 0
for old, new in fixes.items():
    if old in content:
        content = content.replace(old, new)
        count += 1

# Write back
with open('findagrave_records_complete.json', 'w', encoding='utf-8') as f:
    f.write(content)

print(f"Fixed {count} nickname quotes!")
