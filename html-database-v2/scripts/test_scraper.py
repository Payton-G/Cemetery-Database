#!/usr/bin/env python3
"""
Test script to verify Find a Grave scraping works
Tests on a single memorial page first
"""

import requests
from bs4 import BeautifulSoup
import json

def test_single_memorial():
    """Test scraping a single memorial page"""
    # Test with a known Find a Grave memorial URL
    # You can replace this with an actual memorial URL from Memorial Park Cemetery
    test_url = "https://www.findagrave.com/memorial/12345"  # Replace with actual URL
    
    print("Testing Find a Grave scraping...")
    print(f"Test URL: {test_url}\n")
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
    
    try:
        response = requests.get(test_url, headers=headers, timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Test name extraction
            name = soup.find('h1')
            print(f"Name found: {name.get_text(strip=True) if name else 'NOT FOUND'}")
            
            # Test image extraction
            img = soup.find('img')
            if img:
                print(f"Image found: {img.get('src', 'No src')}")
            else:
                print("No image found")
            
            # Test meta tags
            meta_img = soup.find('meta', {'property': 'og:image'})
            if meta_img:
                print(f"Meta image: {meta_img.get('content', 'No content')}")
            
            print("\n✓ Scraping test successful!")
            print("The main scraper should work.")
            return True
        else:
            print(f"✗ Error: Status code {response.status_code}")
            return False
            
    except Exception as e:
        print(f"✗ Error: {e}")
        print("\nPossible issues:")
        print("1. Find a Grave may be blocking requests")
        print("2. URL may be incorrect")
        print("3. Internet connection issue")
        return False

if __name__ == "__main__":
    test_single_memorial()

