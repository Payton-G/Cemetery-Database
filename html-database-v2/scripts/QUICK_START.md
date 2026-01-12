# Quick Start Guide - Find a Grave Scraper

## Easy Method (Windows)

1. **Double-click** `run_scraper.bat`
2. Wait for completion (10-30 minutes)
3. Find the file: `findagrave_records_complete.json`
4. Import using Admin → Import Records → Bulk JSON Import

## Manual Method

### Step 1: Install Python
- Download from https://www.python.org/downloads/
- Make sure to check "Add Python to PATH" during installation

### Step 2: Install Packages
Open a terminal/command prompt in this folder and run:
```bash
pip install -r requirements.txt
```

### Step 3: Run Scraper
```bash
python scrape_findagrave.py
```

### Step 4: Import Data
1. Open the website Admin panel
2. Go to Import Records → Bulk JSON Import
3. Upload `findagrave_records_complete.json`
4. Click "Import JSON File"

## Troubleshooting

**"Python not found"**
- Install Python from python.org
- Make sure "Add to PATH" is checked during installation

**"Module not found"**
- Run: `pip install requests beautifulsoup4 lxml`

**Scraper fails or gets blocked**
- Find a Grave may have updated their HTML structure
- Try increasing the DELAY value in scrape_findagrave.py (line 20)
- Wait a few hours and try again

**No images extracted**
- Some memorials may not have photos
- You can manually add images later using the Edit function

## Alternative: Manual Collection

If the scraper doesn't work, you can:
1. Visit each Find a Grave memorial page
2. Right-click the image → Copy image address
3. Add to a JSON file manually
4. Use Bulk JSON Import

