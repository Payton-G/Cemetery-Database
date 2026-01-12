# Memorial Park Cemetery Database

An HTML-based database system for tracking and managing cemetery records for the Memorial Park Cemetery cleanup and restoration project.

## 📁 Project Structure

```
html-database/
├── index.html          # Home page with statistics
├── data-entry.html     # Form for entering new records
├── view-records.html   # View all records with filtering
├── search.html         # Search functionality
├── css/
│   └── style.css      # Main stylesheet
├── js/
│   ├── main.js        # Core utilities and functions
│   ├── data-entry.js  # Data entry form handling
│   ├── view-records.js # Record display and management
│   ├── search.js      # Search functionality
│   └── stats.js       # Statistics calculations
├── data/              # Data storage (localStorage JSON)
├── docs/              # Documentation files
├── assets/
│   └── images/        # Images and media files
└── examples/          # Example files and templates
```

## 🚀 Getting Started

### For Users (14-18 year olds doing data entry)

1. **Open the Database**: Open `index.html` in a web browser
2. **Enter Data**: Click "Data Entry" in the navigation menu
3. **Fill the Form**: Complete all required fields (marked with *)
4. **Save**: Click "Save Record" - your data is automatically saved
5. **View Records**: Use "View Records" to see all entries
6. **Search**: Use "Search" to find specific records

### For Administrators

1. **Setup**: Upload all files to your web server or Google Sites
2. **Data Storage**: Data is stored in browser localStorage (see Google Sites integration below)
3. **Backup**: Regularly export data using the "Export Data" button
4. **Maintenance**: Check the `data/` folder for backup files

## 🔧 Google Sites Integration

### Method 1: Embed HTML Pages

1. **Upload Files**: Upload all files to Google Drive or a web hosting service
2. **Get Public URLs**: Make sure files are publicly accessible
3. **Embed in Google Sites**:
   - Go to your Google Site
   - Insert → Embed
   - Paste the URL to `index.html` or specific pages
   - Adjust size as needed

### Method 2: Use Google Sites Embed Code

1. **Create iframe Embed**:
   ```html
   <iframe src="YOUR_URL/index.html" width="100%" height="800px" frameborder="0"></iframe>
   ```
2. **Insert in Google Sites**: Use the HTML embed option

### Method 3: Google Sheets Integration (Recommended for Production)

For a more robust solution, consider integrating with Google Sheets:
- Data can be synced to Google Sheets using Google Apps Script
- Multiple users can access the same data
- Better for long-term data management

## 📝 Data Entry Guidelines

### Required Fields
- **Full Name**: The complete name as it appears on the marker
- **Entered By**: Your name or initials
- **Entry Date**: Date when you entered this record

### Optional but Important Fields
- Birth and Death Dates
- Veteran Status (if applicable, fill in Branch and War/Era)
- Cemetery Section and Plot Number
- Marker Condition (helps prioritize restoration work)
- Inscription/Epitaph text
- Additional Notes

### Tips for Accurate Data Entry
- Double-check spelling of names
- Take photos if possible (can be added to notes)
- Note any damage or restoration needs
- Be consistent with section naming (e.g., "Section A" vs "A")

## 💾 Data Management

### Current Storage
- Data is stored in browser **localStorage**
- Each browser/device has its own data
- Data persists until browser cache is cleared

### Exporting Data
- Use the "Export Data" button on the View Records page
- Exports as CSV file
- Can be opened in Excel or Google Sheets

### Backing Up Data
1. Regularly export data to CSV
2. Save CSV files in the `data/` folder
3. Consider syncing to Google Drive or cloud storage

## 🔒 Important Notes

### Browser Compatibility
- Works best in modern browsers (Chrome, Firefox, Edge, Safari)
- Requires JavaScript enabled
- localStorage must be enabled

### Data Limitations
- localStorage has size limits (~5-10MB depending on browser)
- For large datasets, consider Google Sheets integration
- Regular exports recommended for data safety

## 🛠️ Customization

### Changing Colors
Edit `css/style.css` and modify the CSS variables:
```css
:root {
    --primary-color: #2c5f7c;
    --secondary-color: #4a90a4;
    /* ... */
}
```

### Adding Fields
1. Add input field to `data-entry.html`
2. Update form handling in `js/data-entry.js`
3. Update display in `js/view-records.js` and `js/search.js`

## 📞 Support

For questions or issues:
1. Check the documentation in the `docs/` folder
2. Review example files in the `examples/` folder
3. Contact the project administrator

## 📄 License

This project is created for the Memorial Park Cemetery Restoration Project.

---

**Version**: 1.0  
**Last Updated**: 2025  
**Project**: Memorial Park Cemetery Cleanup and Restoration

