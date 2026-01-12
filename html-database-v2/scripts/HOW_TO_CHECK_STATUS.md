# How to Check Scraper Status

## Quick Method

**Double-click:** `check_status.bat`

This will show you:
- ✓ If the scraper is done
- ⏳ If it's still running
- 📊 How many records have been extracted
- 📷 How many have images
- 📝 Sample of extracted records

## Manual Method

1. **Open a terminal/command prompt** in the `scripts` folder
2. **Run:**
   ```bash
   python check_status.py
   ```

## What to Look For

### ✅ Scraper is DONE when:
- File `findagrave_records_complete.json` exists
- Shows "335 records extracted" (or close to it)
- Says "COMPLETE!"

### ⏳ Scraper is STILL RUNNING when:
- File doesn't exist yet, OR
- File exists but shows fewer than 335 records
- Says "IN PROGRESS"

### ⚠️ Scraper may have ERRORED when:
- File doesn't exist after 30+ minutes
- Check the Python console window for error messages

## Progress Indicators

The scraper shows progress as it runs:
- `[1/20] ✓ Record Name` - Processing record 1 of 20 on current page
- `💾 Progress saved: 50 records` - Auto-saves every 10 records
- `Progress: 150/335 records (44.8%)` - Overall progress

## Expected Timeline

- **10-30 minutes** for all 335 records
- Depends on network speed and Find a Grave response times

## If Scraper Stops Early

1. Check the console for error messages
2. The partial data is saved - you can import what's there
3. Re-run the scraper to get remaining records (it will skip duplicates)

## Tips

- **Don't close the Python window** while scraping
- **Check status periodically** using `check_status.bat`
- **Partial data is saved** - you can import even if not all 335 are done
- **The file updates in real-time** - you can watch it grow

