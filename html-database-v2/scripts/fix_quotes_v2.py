#!/usr/bin/env python3

# Read the file
with open('findagrave_records_complete.json', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace all smart quotes (curly quotes) with escaped straight quotes
# U+201C = left double quotation mark (")
# U+201D = right double quotation mark (")
content = content.replace('\u201c', '\\"')
content = content.replace('\u201d', '\\"')

# Write back
with open('findagrave_records_complete.json', 'w', encoding='utf-8') as f:
    f.write(content)

print("All smart quotes fixed!")
