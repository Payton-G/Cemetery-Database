# Google Sites Integration Guide

This guide explains how to integrate the Memorial Park Cemetery Database with Google Sites.

## Prerequisites

- Google Sites account
- All HTML database files uploaded to a web server or Google Drive
- Public access to the files

## Integration Methods

### Method 1: Direct Embed (Simplest)

**Step 1: Host Your Files**
- Upload all files to a web hosting service (GitHub Pages, Netlify, etc.)
- OR upload to Google Drive and make files publicly viewable

**Step 2: Get Public URL**
- Note the public URL to your `index.html` file
- Example: `https://yoursite.com/html-database/index.html`

**Step 3: Embed in Google Sites**
1. Open your Google Site
2. Click "Insert" → "Embed"
3. Paste your URL
4. Adjust the size (recommended: 100% width, 800px height)
5. Click "Insert"

### Method 2: iframe Embed (More Control)

**Step 1: Create Embed Code**
```html
<iframe 
    src="YOUR_URL/index.html" 
    width="100%" 
    height="800px" 
    frameborder="0"
    style="border: none;">
</iframe>
```

**Step 2: Insert in Google Sites**
1. Open your Google Site
2. Click "Insert" → "Embed" → "Embed code"
3. Paste the iframe code above (replace YOUR_URL)
4. Click "Insert"

### Method 3: Google Sheets Integration (Recommended for Production)

For a production system with multiple users, consider syncing data to Google Sheets.

**Benefits:**
- Centralized data storage
- Multiple users can access same data
- Better for long-term management
- Built-in backup and versioning

**Setup Steps:**
1. Create a Google Sheet with columns matching your database fields
2. Use Google Apps Script to sync localStorage data to Sheets
3. Create a web app from the script
4. Integrate the web app with your HTML forms

## Important Considerations

### Data Storage Limitations

**Current System (localStorage):**
- Data stored in each user's browser
- Not shared between users
- Lost if browser cache is cleared
- Limited storage size (~5-10MB)

**For Public Use:**
- Consider Google Sheets backend
- OR use a cloud database service
- OR implement server-side storage

### Security

- Make sure sensitive data is handled appropriately
- Consider authentication for data entry
- Regular backups are essential

### Performance

- For large datasets, pagination may be needed
- Consider lazy loading for records display
- Optimize images and assets

## Troubleshooting

### Files Not Loading
- Check file permissions (must be publicly accessible)
- Verify URLs are correct
- Check browser console for errors

### Data Not Saving
- Ensure JavaScript is enabled
- Check localStorage is available
- Verify browser compatibility

### Display Issues
- Check iframe size settings
- Verify CSS files are loading
- Test in different browsers

## Next Steps

1. **Test Integration**: Embed a test page first
2. **User Training**: Train data entry users
3. **Backup Strategy**: Set up regular data exports
4. **Monitor Usage**: Track how the system is being used
5. **Gather Feedback**: Improve based on user needs

## Support Resources

- Google Sites Help: https://support.google.com/sites
- Google Apps Script: https://developers.google.com/apps-script
- HTML/CSS/JavaScript documentation: MDN Web Docs

---

**Note**: For a production system with multiple concurrent users, strongly consider implementing Google Sheets or a cloud database backend instead of relying solely on localStorage.

