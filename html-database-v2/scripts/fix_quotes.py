#!/usr/bin/env python3
import json

# Read the JSON file
with open('findagrave_records_complete.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Write it back - this will normalize all quotes
with open('findagrave_records_complete.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=4, ensure_ascii=False)

print("Fixed!")
