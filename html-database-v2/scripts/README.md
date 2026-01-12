# Find a Grave Scraper

This script scrapes all 335 veteran records with images from Find a Grave for Memorial Park Cemetery.

## Setup

1. **Install Python** (3.7 or higher)

2. **Install required packages:**
   ```bash
   pip install -r requirements.txt
   ```

## Usage

1. **Run the scraper:**
   ```bash
   python scrape_findagrave.py
   ```

2. **Wait for completion** - This may take 10-30 minutes depending on:
   - Number of records (335)
   - Network speed
   - Find a Grave response times

3. **Output file:** `findagrave_records_complete.json`

4. **Import the data:**
   - Open the Admin panel
   - Go to Import Records → Bulk JSON Import
   - Upload the generated JSON file
   - Click "Import JSON File"

## Important Notes

⚠️ **Respect Find a Grave's Terms of Service**
- The script includes delays between requests
- Don't run multiple instances simultaneously
- Use responsibly

⚠️ **HTML Structure Changes**
- Find a Grave may update their HTML structure
- If scraping fails, you may need to update the selectors in the script

## Troubleshooting

**No records extracted:**
- Check your internet connection
- Verify Find a Grave is accessible
- The HTML structure may have changed - inspect the page and update selectors

**Missing images:**
- Some memorials may not have photos
- Image URLs are extracted when available
- You can manually add images later through the edit function

**Rate limiting:**
- If you get blocked, increase the DELAY value in the script
- Wait a few hours before trying again

## Alternative: Manual Collection

If the scraper doesn't work, you can manually collect data:
1. Visit each memorial page
2. Copy the image URL (right-click → Copy image address)
3. Add to the JSON file manually
4. Use the Bulk JSON Import feature

