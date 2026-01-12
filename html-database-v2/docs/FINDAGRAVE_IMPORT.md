# Importing Records from Find a Grave

This guide explains how to import veteran records from Find a Grave into the Memorial Park Cemetery Database.

## Find a Grave Source

**Memorial Park Cemetery Veterans:**
https://www.findagrave.com/cemetery/635639/memorial-search?firstname=&middlename=&lastname=&cemeteryName=Memorial+Park+Cemetery&birthyear=&birthyearfilter=&deathyear=&deathyearfilter=&bio=&linkedToName=&plot=&memorialid=&mcid=&datefilter=&orderby=r&isVeteran=true&page=1

**Total Records:** 335+ veterans (infinite scroll)

## Method 1: Paste Records (Easiest)

### Step 1: Copy Records from Find a Grave

1. Go to the Find a Grave page
2. Scroll through the records (infinite scroll - keep scrolling to load more)
3. Copy the text for each record. Format should be:
   ```
   Name | Birth Date | Death Date | Plot Info (if available)
   ```

### Step 2: Format for Import

Example format:
```
Paul William Addie | 5 Jan 1908 | 7 Feb 1990 | Section A, Plot 1
Thomas H. Alsbury | 23 Aug 1925 | 1994
Floyd Turner Alverson | 14 Feb 1918 | 29 Jan 2020 | section 139B space 3
```

**Notes:**
- Use `|` (pipe) to separate fields
- Dates can be in various formats (the system will try to parse them)
- Plot info is optional but helpful
- One record per line

### Step 3: Import

1. Go to **Import** page in the database
2. Click **"Paste Records"** tab
3. Paste your formatted records
4. Enter your name in "Entered By"
5. Click **"Parse and Import Records"**

## Method 2: CSV Import

### Step 1: Create CSV File

Create a CSV file with these columns:
- Full Name (required)
- Birth Date
- Death Date
- Veteran Status (yes/no/unknown)
- Branch
- War/Era
- Section
- Plot Number
- Marker Condition
- Marker Type
- Inscription
- Notes

### Step 2: Import

1. Go to **Import** page
2. Click **"CSV Import"** tab
3. Select your CSV file
4. Enter your name in "Entered By"
5. Click **"Import CSV File"**

## Method 3: Manual Bulk Entry

Use the **"Manual Entry"** tab to enter multiple records one at a time with a form interface.

## Tips for Find a Grave Data

### Date Formats Accepted
- "5 Jan 1908" → Will be parsed
- "23 Aug 1925" → Will be parsed
- "1994" (year only) → Will be noted but date may be incomplete
- "2020-01-29" (ISO format) → Will be parsed

### Location Parsing
The system automatically extracts:
- **Section** from text like "Section A", "section 139B"
- **Plot** from text like "Plot 1", "space 3"

Examples that work:
- "Section A, Plot 1" → Section: A, Plot: 1
- "section 139B space 3" → Section: 139B, Plot: 3
- "Plot 5" → Plot: 5 (no section)

### What Gets Imported

For each record:
- ✅ Full Name (required)
- ✅ Birth Date (if available)
- ✅ Death Date (if available)
- ✅ Veteran Status (set to "yes" for Find a Grave veteran search)
- ✅ Section (if found in location text)
- ✅ Plot Number (if found in location text)
- ✅ Notes: "Imported from Find a Grave"
- ✅ Entered By: Your name
- ✅ Entry Date: Today's date

**Not imported (can be added later):**
- Branch of Service
- War/Era
- GPS Coordinates
- Marker Condition
- Marker Type
- Inscription

## Batch Processing

Since Find a Grave has 335+ records with infinite scroll:

1. **Copy in batches** - Copy 20-50 records at a time
2. **Import each batch** - Import, verify, then continue
3. **Check results** - Review imported records in View Records page
4. **Add missing data** - Use individual data entry to add Branch, War/Era, GPS, etc.

## Example: Copying from Find a Grave

When you see a record like:
```
Paul William Addie
Veteran
5 Jan 1908 – 7 Feb 1990
```

Copy it and format as:
```
Paul William Addie | 5 Jan 1908 | 7 Feb 1990
```

If there's plot info:
```
Norman David Barrett
Veteran
27 Nov 1920 – 17 May 2006
Plot info: section 139B space 3
```

Format as:
```
Norman David Barrett | 27 Nov 1920 | 17 May 2006 | section 139B space 3
```

## Troubleshooting

### Records Not Importing
- Check format: Use `|` to separate fields
- Ensure Name is first field
- Check that "Entered By" is filled in

### Dates Not Parsing
- Try different date formats
- Year-only dates may not create full dates
- Use format: "Day Month Year" (e.g., "5 Jan 1908")

### Location Not Extracting
- Make sure location text includes "Section" or "Plot"
- Try: "Section A, Plot 1" format
- Or: "section 139B space 3" format

## After Import

1. **Verify Records** - Check View Records page
2. **Add Missing Data** - Use Data Entry to add:
   - Branch of Service
   - War/Era
   - GPS Coordinates (if visiting graves)
   - Marker Condition
   - Additional notes

3. **Check Grid Map** - Records with Section/Plot will appear on the map

---

**Note:** The import feature automatically marks all records as veterans since they come from the Find a Grave veteran search. You can update individual records later if needed.

