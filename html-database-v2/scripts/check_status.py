#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Check scraper status and progress
"""

import os
import json
import time
import sys
from datetime import datetime

# Fix Windows console encoding
if sys.platform == 'win32':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')

OUTPUT_FILE = "findagrave_records_complete.json"

def check_status():
    """Check if scraper is done and show progress"""
    print("=" * 60)
    print("Find a Grave Scraper Status Checker")
    print("=" * 60)
    print()
    
    if os.path.exists(OUTPUT_FILE):
        # File exists - check its contents
        try:
            with open(OUTPUT_FILE, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            file_size = os.path.getsize(OUTPUT_FILE)
            file_time = datetime.fromtimestamp(os.path.getmtime(OUTPUT_FILE))
            time_since_update = datetime.now() - file_time
            
            print("✓ OUTPUT FILE FOUND!")
            print(f"  File: {OUTPUT_FILE}")
            print(f"  Size: {file_size:,} bytes ({file_size/1024:.1f} KB)")
            print(f"  Last updated: {file_time.strftime('%Y-%m-%d %H:%M:%S')}")
            print(f"  Time since update: {time_since_update}")
            print()
            print(f"  Total records extracted: {len(data)}")
            print()
            
            # Count records with images
            with_images = sum(1 for r in data if r.get('imageUrl'))
            print(f"  Records with images: {with_images} ({with_images/len(data)*100:.1f}%)")
            print(f"  Records without images: {len(data) - with_images}")
            print()
            
            # Show sample records
            print("  Sample records:")
            for i, record in enumerate(data[:5], 1):
                name = record.get('name', 'Unknown')
                has_img = "[IMG]" if record.get('imageUrl') else "[NO IMG]"
                print(f"    {i}. {has_img} {name}")
            
            if len(data) > 5:
                print(f"    ... and {len(data) - 5} more")
            print()
            
            # Check if complete (335 records)
            if len(data) >= 335:
                print("  *** COMPLETE! All 335 records extracted! ***")
                print()
                print("  Next steps:")
                print("  1. Review the JSON file")
                print("  2. Go to Admin -> Import Records -> Bulk JSON Import")
                print("  3. Upload this file and import")
            elif len(data) > 0:
                print(f"  *** IN PROGRESS: {len(data)}/335 records extracted ***")
                print(f"     Scraper may still be running...")
                print()
                print("  To check again, run this script in a few minutes")
            else:
                print("  *** File exists but is empty - scraper may have just started ***")
            
        except json.JSONDecodeError:
            print("*** File exists but contains invalid JSON ***")
            print("   Scraper may still be writing to the file...")
        except Exception as e:
            print(f"*** Error reading file: {e} ***")
    else:
        print("*** SCRAPER STILL RUNNING ***")
        print()
        print(f"  Output file not found: {OUTPUT_FILE}")
        print("  This means:")
        print("    - Scraper is still running, OR")
        print("    - Scraper hasn't started yet, OR")
        print("    - Scraper encountered an error")
        print()
        print("  Check the Python console window for progress messages")
        print("  Run this script again in a few minutes to check status")

if __name__ == "__main__":
    check_status()
    print()
    try:
        input("Press Enter to exit...")
    except (EOFError, KeyboardInterrupt):
        pass  # Allow script to exit when run non-interactively

