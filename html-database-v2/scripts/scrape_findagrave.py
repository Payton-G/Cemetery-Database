#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Find a Grave Web Scraper for Memorial Park Cemetery
Extracts all 335 veteran records with images from Find a Grave
"""

import requests
from bs4 import BeautifulSoup
import json
import time
import re
from urllib.parse import urljoin, urlparse
import sys
import codecs

# Fix Windows console encoding
if sys.platform == 'win32':
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')

# Configuration
CEMETERY_ID = "635639"  # Memorial Park Cemetery, Moberly, MO
BASE_URL = "https://www.findagrave.com"
SEARCH_URL = f"{BASE_URL}/cemetery/{CEMETERY_ID}/memorial-search"
VETERAN_FILTER = "?isVeteran=true"
DELAY = 1  # Delay between requests (seconds) - be respectful!

def get_page(url, retries=3):
    """Fetch a page with retry logic"""
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    for attempt in range(retries):
        try:
            response = requests.get(url, headers=headers, timeout=10)
            response.raise_for_status()
            return response
        except requests.RequestException as e:
            if attempt < retries - 1:
                time.sleep(2 ** attempt)  # Exponential backoff
            else:
                print(f"Error fetching {url}: {e}")
                return None
    return None

def extract_memorial_data(memorial_url):
    """Extract data from a single memorial page"""
    print(f"  Scraping: {memorial_url}")
    
    response = get_page(memorial_url)
    if not response:
        return None
    
    soup = BeautifulSoup(response.text, 'html.parser')
    
    record = {
        'name': None,
        'birth': None,
        'death': None,
        'plot': None,
        'imageUrl': None,
        'findAGraveUrl': memorial_url,
        'memorialId': None
    }
    
    # Extract memorial ID from URL
    match = re.search(r'/memorial/(\d+)', memorial_url)
    if match:
        record['memorialId'] = match.group(1)
    
    # Extract name - try multiple selectors
    name_elem = (soup.find('h1', class_='memorial-name') or 
                 soup.find('h1', {'itemprop': 'name'}) or
                 soup.find('h1', id='memorial-name') or
                 soup.find('h1'))
    if name_elem:
        record['name'] = name_elem.get_text(strip=True)
        # Clean up name (remove extra whitespace, etc.)
        record['name'] = ' '.join(record['name'].split())
    
    # Extract dates - try multiple methods
    # Method 1: Structured data
    birth_elem = (soup.find('time', {'itemprop': 'birthDate'}) or 
                  soup.find('span', {'itemprop': 'birthDate'}) or
                  soup.find('time', class_='birth-date'))
    if birth_elem:
        birth_text = birth_elem.get_text(strip=True)
        record['birth'] = parse_date(birth_text)
    
    death_elem = (soup.find('time', {'itemprop': 'deathDate'}) or 
                  soup.find('span', {'itemprop': 'deathDate'}) or
                  soup.find('time', class_='death-date'))
    if death_elem:
        death_text = death_elem.get_text(strip=True)
        record['death'] = parse_date(death_text)
    
    # Method 2: Look for date patterns in text
    if not record['birth'] or not record['death']:
        date_text = soup.get_text()
        # Look for "Born: X" or "Birth: X" patterns
        birth_match = re.search(r'(?:born|birth)[:\s]+([^–\n]+)', date_text, re.I)
        if birth_match:
            record['birth'] = parse_date(birth_match.group(1))
        
        death_match = re.search(r'(?:died|death)[:\s]+([^\n]+)', date_text, re.I)
        if death_match:
            record['death'] = parse_date(death_match.group(1))
    
    # Extract plot information
    plot_elem = (soup.find('div', class_='memorial-plot') or 
                 soup.find('span', class_='plot') or
                 soup.find('div', class_='plot-info') or
                 soup.find('span', string=re.compile(r'plot|section', re.I)))
    if plot_elem:
        plot_text = plot_elem.get_text(strip=True)
        if plot_text:
            record['plot'] = plot_text
    
    # Extract image URL - try multiple methods
    img_elem = None
    
    # Method 1: Direct img tags
    img_elem = (soup.find('img', class_='memorial-photo') or 
                soup.find('img', {'itemprop': 'image'}) or
                soup.find('img', id='memorial-photo') or
                soup.find('img', class_=re.compile(r'photo|image', re.I)))
    
    # Method 2: Look in container divs
    if not img_elem:
        photo_container = soup.find('div', class_=re.compile(r'photo|image', re.I))
        if photo_container:
            img_elem = photo_container.find('img')
    
    # Method 3: Look for main image
    if not img_elem:
        all_imgs = soup.find_all('img')
        for img in all_imgs:
            src = img.get('src', '')
            if 'memorial' in src.lower() or 'grave' in src.lower() or 'photo' in src.lower():
                img_elem = img
                break
    
    if img_elem:
        img_src = img_elem.get('src') or img_elem.get('data-src') or img_elem.get('data-lazy-src')
        if img_src:
            # Convert relative URLs to absolute
            if img_src.startswith('//'):
                record['imageUrl'] = 'https:' + img_src
            elif img_src.startswith('/'):
                record['imageUrl'] = BASE_URL + img_src
            elif not img_src.startswith('http'):
                record['imageUrl'] = urljoin(memorial_url, img_src)
            else:
                record['imageUrl'] = img_src
    
    # Method 4: Look for image in meta tags (Open Graph, Twitter Card)
    if not record['imageUrl']:
        meta_img = (soup.find('meta', {'property': 'og:image'}) or 
                   soup.find('meta', {'name': 'twitter:image'}) or
                   soup.find('meta', {'property': 'og:image:url'}))
        if meta_img and meta_img.get('content'):
            record['imageUrl'] = meta_img['content']
    
    # Method 5: Look in JSON-LD structured data
    if not record['imageUrl']:
        json_scripts = soup.find_all('script', type='application/ld+json')
        for script in json_scripts:
            try:
                data = json.loads(script.string)
                if isinstance(data, dict) and 'image' in data:
                    record['imageUrl'] = data['image']
                    break
            except:
                pass
    
    time.sleep(DELAY)  # Be respectful
    return record

def parse_date(date_str):
    """Parse date string to YYYY-MM-DD format"""
    if not date_str:
        return None
    
    # Remove extra whitespace
    date_str = date_str.strip()
    
    # Try to match common date formats
    # Format: "5 Jan 1908" or "January 5, 1908"
    patterns = [
        r'(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})',  # "5 Jan 1908"
        r'([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})',  # "January 5, 1908"
        r'(\d{4})-(\d{2})-(\d{2})',  # "1908-01-05"
    ]
    
    month_map = {
        'jan': '01', 'january': '01',
        'feb': '02', 'february': '02',
        'mar': '03', 'march': '03',
        'apr': '04', 'april': '04',
        'may': '05',
        'jun': '06', 'june': '06',
        'jul': '07', 'july': '07',
        'aug': '08', 'august': '08',
        'sep': '09', 'september': '09',
        'oct': '10', 'october': '10',
        'nov': '11', 'november': '11',
        'dec': '12', 'december': '12'
    }
    
    for pattern in patterns:
        match = re.match(pattern, date_str, re.IGNORECASE)
        if match:
            groups = match.groups()
            if len(groups) == 3:
                if groups[0].isdigit() and len(groups[0]) <= 2:  # Day first
                    day = groups[0].zfill(2)
                    month_name = groups[1].lower()[:3]
                    year = groups[2]
                elif groups[0].isdigit() and len(groups[0]) == 4:  # Year first (ISO)
                    return date_str  # Already in correct format
                else:  # Month first
                    month_name = groups[0].lower()[:3]
                    day = groups[1].zfill(2)
                    year = groups[2]
                
                month = month_map.get(month_name)
                if month:
                    return f"{year}-{month}-{day}"
    
    # If just a year, return as-is (will be handled by import script)
    if re.match(r'^\d{4}$', date_str):
        return date_str
    
    return None

def get_memorial_links_from_search(page_num=1):
    """Get memorial links from search results page"""
    url = f"{SEARCH_URL}{VETERAN_FILTER}&page={page_num}"
    print(f"Fetching search page {page_num}: {url}")
    
    response = get_page(url)
    if not response:
        return []
    
    soup = BeautifulSoup(response.text, 'html.parser')
    links = []
    
    # Find all memorial links - try multiple selectors
    # Method 1: Direct links with /memorial/ pattern
    memorial_links = soup.find_all('a', href=re.compile(r'/memorial/\d+'))
    
    # Method 2: Look for memorial cards/items
    if not memorial_links:
        memorial_links = soup.find_all('a', class_=re.compile(r'memorial|grave|person', re.I))
    
    # Method 3: Look in data attributes
    if not memorial_links:
        memorial_links = soup.find_all('a', {'data-memorial-id': True})
    
    # Method 4: Look for any link containing memorial ID pattern
    if not memorial_links:
        all_links = soup.find_all('a', href=True)
        for link in all_links:
            href = link.get('href', '')
            if re.search(r'/memorial/\d+', href):
                memorial_links.append(link)
    
    for link in memorial_links:
        href = link.get('href')
        if href:
            # Clean up the URL
            if href.startswith('/'):
                full_url = BASE_URL + href
            elif href.startswith('http'):
                full_url = href
            else:
                full_url = urljoin(BASE_URL, href)
            
            # Extract just the memorial URL (remove fragments, query params)
            match = re.search(r'(/memorial/\d+)', full_url)
            if match:
                clean_url = BASE_URL + match.group(1)
                if clean_url not in links:
                    links.append(clean_url)
    
    print(f"  Found {len(links)} unique memorial links")
    time.sleep(DELAY)
    return links

def scrape_all_records():
    """Scrape all records from Find a Grave"""
    print("Starting Find a Grave scraper...")
    print(f"Target: Memorial Park Cemetery (ID: {CEMETERY_ID})")
    print(f"Filter: Veterans only\n")
    
    all_records = []
    page = 1
    max_pages = 50  # Safety limit
    output_file = "findagrave_records_complete.json"
    
    # Save progress periodically
    def save_progress():
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(all_records, f, indent=2, ensure_ascii=False)
        print(f"\n[SAVED] Progress saved: {len(all_records)} records so far")
    
    while page <= max_pages:
        print(f"\n{'='*60}")
        print(f"=== Page {page} ===")
        print(f"{'='*60}")
        memorial_links = get_memorial_links_from_search(page)
        
        if not memorial_links:
            print("No more memorials found. Stopping.")
            break
        
        print(f"Found {len(memorial_links)} memorials on this page")
        print(f"Progress: {len(all_records)}/335 records extracted ({len(all_records)/335*100:.1f}%)\n")
        
        for i, link in enumerate(memorial_links, 1):
            print(f"[{i}/{len(memorial_links)}] ", end='', flush=True)
            record = extract_memorial_data(link)
            if record and record.get('name'):
                all_records.append(record)
                img_status = "[IMG]" if record.get('imageUrl') else "[   ]"
                print(f"{img_status} OK {record['name']}")
            else:
                print(f"FAILED - Could not extract data")
            
            # Save progress every 10 records
            if len(all_records) % 10 == 0:
                save_progress()
        
        # Save progress after each page
        save_progress()
        
        # Check if there's a next page
        # You may need to adjust this based on Find a Grave's pagination
        if len(memorial_links) < 20:  # Assuming ~20 per page
            break
        
        page += 1
    
    # Final save
    save_progress()
    
    print(f"\n\n{'='*60}")
    print(f"=== SCRAPING COMPLETE ===")
    print(f"{'='*60}")
    print(f"Total records extracted: {len(all_records)}")
    print(f"Records with images: {sum(1 for r in all_records if r.get('imageUrl'))}")
    print(f"Output file: {output_file}")
    print(f"\n✓ All done! You can now import the data.")
    
    return all_records

def main():
    """Main function"""
    print("=" * 60)
    print("Find a Grave Scraper - Memorial Park Cemetery")
    print("=" * 60)
    print("\nThis script will scrape all veteran records from Find a Grave.")
    print("Please be respectful and patient - this may take a while.\n")
    
    # Scrape all records
    records = scrape_all_records()
    
    if not records:
        print("\nNo records were extracted. Please check:")
        print("1. Internet connection")
        print("2. Find a Grave website accessibility")
        print("3. HTML structure may have changed")
        sys.exit(1)
    
    # Final save (already done in scrape_all_records, but ensure it's saved)
    output_file = "findagrave_records_complete.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(records, f, indent=2, ensure_ascii=False)
    
    print(f"\n{'='*60}")
    print(f"FINAL SUMMARY")
    print(f"{'='*60}")
    print(f"✓ Records saved to: {output_file}")
    print(f"✓ Total records: {len(records)}")
    print(f"✓ Records with images: {sum(1 for r in records if r.get('imageUrl'))}")
    print(f"\nNext steps:")
    print(f"1. Review the JSON file: {output_file}")
    print(f"2. Go to Admin → Import Records → Bulk JSON Import")
    print(f"3. Upload the JSON file and import")
    print(f"4. Verify images display correctly on the website")
    print(f"\nTo check status anytime, run: python check_status.py")

if __name__ == "__main__":
    main()

