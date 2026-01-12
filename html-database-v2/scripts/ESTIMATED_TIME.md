# Estimated Scraper Runtime

## Time Calculation

### Factors:
- **335 records** to extract
- **1 second delay** between each request (to be respectful to Find a Grave)
- **2 types of requests**:
  1. Search result pages (~20 records per page = ~17 pages)
  2. Individual memorial pages (335 pages)

### Minimum Time:
- 17 search pages × 1 second = 17 seconds
- 335 memorial pages × 1 second = 335 seconds (5.6 minutes)
- **Total minimum: ~6 minutes**

### Realistic Time:
- Network latency: +2-5 seconds per request
- Page processing: +0.5-1 second per page
- **Total realistic: 20-30 minutes**

### Maximum Time (if issues occur):
- Retries for failed requests: +5-10 seconds each
- Slow network: +10-20 seconds per request
- **Total maximum: 45-60 minutes**

## Progress Indicators

The scraper shows:
- Current page being processed
- Records extracted so far
- Percentage complete
- Auto-saves every 10 records

## What Affects Speed

**Faster:**
- Good internet connection
- Find a Grave responds quickly
- No errors/retries needed

**Slower:**
- Slow internet connection
- Find a Grave rate limiting
- Many retries needed
- HTML structure changes requiring more processing

## Check Progress

Run `check_status.bat` anytime to see:
- How many records extracted so far
- Estimated time remaining (based on current rate)
- Whether it's still running

## Typical Timeline

- **0-5 minutes**: Getting started, extracting first 50-100 records
- **5-15 minutes**: Middle section, extracting records 100-250
- **15-30 minutes**: Final records, 250-335
- **Done**: File created with all 335 records

