#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Test if we can access Find a Grave"""

import requests
import sys
import codecs

if sys.platform == 'win32':
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')

print("Testing Find a Grave access...")
print()

# Test the search page
url = "https://www.findagrave.com/cemetery/635639/memorial-search?isVeteran=true&page=1"
print(f"Testing URL: {url}")

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}

try:
    response = requests.get(url, headers=headers, timeout=10)
    print(f"Status Code: {response.status_code}")
    print(f"Response Length: {len(response.text)} bytes")
    
    if response.status_code == 200:
        print("SUCCESS: Can access Find a Grave")
        print(f"Page contains 'memorial' mentions: {response.text.lower().count('memorial')}")
        print(f"Page contains 'veteran' mentions: {response.text.lower().count('veteran')}")
        
        # Check if we're being redirected or blocked
        if 'blocked' in response.text.lower() or 'captcha' in response.text.lower():
            print("\nWARNING: Page may be blocking access (captcha/block detected)")
        elif len(response.text) < 1000:
            print("\nWARNING: Response is very short - may be an error page")
        else:
            print("\nPage looks accessible")
    else:
        print(f"ERROR: Got status code {response.status_code}")
        print("Find a Grave may be blocking the request")
        
except requests.exceptions.RequestException as e:
    print(f"ERROR: {e}")
    print("Cannot access Find a Grave - check internet connection")

print()
input("Press Enter to exit...")

