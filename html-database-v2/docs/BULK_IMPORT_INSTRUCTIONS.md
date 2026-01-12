# Bulk Import Instructions for Find a Grave Records

## Overview
This guide explains how to import all 335 Find a Grave records with images into the Memorial Park Cemetery database.

## Method 1: JSON Bulk Import (Recommended)

### Step 1: Prepare Your Data
Create a JSON file with all 335 records. The file should be an array of objects with the following structure:

```json
[
  {
    "name": "Paul William Addie",
    "birth": "1908-01-05",
    "death": "1990-02-07",
    "plot": "section 139B space 3",
    "imageUrl": "https://www.findagrave.com/memorial/12345/photo.jpg",
    "findAGraveUrl": "https://www.findagrave.com/memorial/12345",
    "memorialId": "12345"
  },
  {
    "name": "Thomas H. Alsbury",
    "birth": "1925-08-23",
    "death": "1994",
    "plot": null,
    "imageUrl": "https://www.findagrave.com/memorial/12346/photo.jpg",
    "findAGraveUrl": "https://www.findagrave.com/memorial/12346",
    "memorialId": "12346"
  }
]
```

### Step 2: Getting Image URLs from Find a Grave

1. Navigate to each memorial page on Find a Grave
2. Right-click on the memorial image
3. Select "Copy image address" or "Copy image URL"
4. Use this URL in the `imageUrl` field

**Note:** Find a Grave image URLs typically look like:
- `https://images.findagrave.com/photos/YYYY/MM/DD/memorial_XXXXX_XXXXX.jpg`

### Step 3: Import the JSON File

1. Log into the Admin panel (password required)
2. Go to **Import Records** tab
3. Click on **Bulk JSON Import** tab
4. Click "Choose File" and select your JSON file
5. Enter your name in "Entered By" field
6. Click "Import JSON File"
7. The system will:
   - Check for duplicates
   - Import all new records
   - Display a summary of imported vs skipped records

## Method 2: Using a Web Scraper

### Option A: Browser Extension
Use a browser extension like "Web Scraper" or "Data Miner" to extract data from Find a Grave:

1. Install the extension
2. Navigate to the Find a Grave search results page
3. Configure the scraper to extract:
   - Name
   - Birth date
   - Death date
   - Plot information
   - Image URL
   - Memorial URL
4. Export as JSON
5. Import using Method 1

### Option B: Python Script
Create a Python script using libraries like `requests` and `BeautifulSoup`:

```python
import requests
from bs4 import BeautifulSoup
import json

# Example structure - customize based on Find a Grave's HTML structure
records = []
# ... scraping logic ...
# Export to JSON
with open('findagrave_records.json', 'w') as f:
    json.dump(records, f, indent=2)
```

**Important:** Always respect Find a Grave's Terms of Service and robots.txt when scraping.

## Method 3: Manual Entry with Images

For individual records:

1. Go to **Data Entry** tab in Admin panel
2. Fill in all available information
3. In the **Image URL** field, paste the direct image URL from Find a Grave
4. In the **Find a Grave URL** field, paste the memorial page URL
5. Save the record

## Image URL Format

Find a Grave image URLs can be found by:
1. Opening the memorial page
2. Right-clicking the main photo
3. Selecting "Copy image address"

The URL will typically be:
- Direct image: `https://images.findagrave.com/photos/...`
- Or from the memorial page source code

## Tips

1. **Batch Processing**: Import in batches of 50-100 records to avoid browser timeouts
2. **Duplicate Checking**: The system automatically checks for duplicates by name
3. **Image Verification**: After import, verify images display correctly on the home page
4. **Backup**: Always create a backup before bulk imports (use Export feature)

## Troubleshooting

- **Images not displaying**: Check that image URLs are direct links (not page URLs)
- **Import fails**: Verify JSON format is correct (valid JSON array)
- **Duplicates found**: Review duplicate records in Database Management tab
- **Missing fields**: The system will use null for missing optional fields

## Support

For issues or questions, refer to the Database Management tab for:
- Duplicate checking
- Record editing
- Data export/backup

