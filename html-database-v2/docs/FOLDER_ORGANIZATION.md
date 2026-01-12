# Folder Organization Guide

This document explains the folder structure and organization of the Memorial Park Cemetery Database project.

## 📂 Current Structure

```
html-database/
│
├── index.html              # Main home page
├── data-entry.html         # Data entry form
├── view-records.html       # View all records page
├── search.html            # Search page
│
├── css/                   # Stylesheets
│   └── style.css         # Main stylesheet (all styles)
│
├── js/                    # JavaScript files
│   ├── main.js           # Core utilities (data storage, helpers)
│   ├── data-entry.js     # Form handling and validation
│   ├── view-records.js   # Record display and filtering
│   ├── search.js         # Search functionality
│   └── stats.js          # Statistics calculations
│
├── data/                  # Data storage and backups
│   └── (CSV exports will be saved here)
│
├── docs/                  # Documentation
│   ├── README.md
│   ├── GOOGLE_SITES_SETUP.md
│   ├── USER_GUIDE.md
│   └── FOLDER_ORGANIZATION.md (this file)
│
├── assets/                # Media and static files
│   └── images/           # Images, logos, photos
│
└── examples/             # Example files and templates
    └── (example data, templates, etc.)
```

## 🎯 Organization Principles

### 1. **Separation of Concerns**
- **HTML**: Structure and content (in root)
- **CSS**: All styling (in `css/` folder)
- **JavaScript**: All functionality (in `js/` folder)
- **Data**: Storage and backups (in `data/` folder)

### 2. **Easy Navigation**
- Main pages in root for easy access
- Related files grouped in folders
- Clear, descriptive folder names

### 3. **Scalability**
- Easy to add new pages
- Easy to add new features
- Easy to maintain and update

## 📁 Folder Purposes

### Root Directory (`html-database/`)
**Purpose**: Main HTML pages that users interact with
- Keep main pages here for easy access
- These are the entry points to the application

### `css/` Folder
**Purpose**: All stylesheets
- Currently: `style.css` (all styles in one file)
- **Future**: Could split into `base.css`, `components.css`, `layout.css` if needed

### `js/` Folder
**Purpose**: All JavaScript functionality
- Each file handles a specific feature
- `main.js` contains shared utilities used by other files
- Easy to find and update specific features

### `data/` Folder
**Purpose**: Data storage and backups
- CSV exports from the database
- Backup files
- Example data files
- **Note**: Actual data is stored in browser localStorage, but exports go here

### `docs/` Folder
**Purpose**: All documentation
- User guides
- Setup instructions
- Technical documentation
- Keeps documentation organized and easy to find

### `assets/` Folder
**Purpose**: Static media files
- Images, logos, photos
- Could expand to include fonts, icons, etc.
- Organized by type in subfolders

### `examples/` Folder
**Purpose**: Example files and templates
- Sample data
- Template forms
- Reference materials
- Helps users understand how to use the system

## 🔄 Maintenance Recommendations

### Regular Tasks

1. **Weekly**:
   - Export data to CSV (saves to `data/` folder)
   - Review and organize exported files
   - Check for duplicate entries

2. **Monthly**:
   - Archive old CSV files
   - Review documentation for updates needed
   - Clean up `examples/` folder if needed

3. **As Needed**:
   - Add new images to `assets/images/`
   - Update documentation in `docs/`
   - Add example files to `examples/`

### File Naming Conventions

- **HTML files**: lowercase with hyphens (`data-entry.html`)
- **CSS files**: lowercase with hyphens (`style.css`)
- **JS files**: lowercase with hyphens (`data-entry.js`)
- **Data files**: descriptive with dates (`cemetery_records_2025-11-21.csv`)
- **Documentation**: UPPERCASE with underscores (`USER_GUIDE.md`)

## 🚀 Future Expansion

### If the Project Grows

**Consider adding:**
- `js/utils/` - Utility functions
- `js/components/` - Reusable components
- `css/themes/` - Different color themes
- `data/archives/` - Archived data files
- `docs/api/` - API documentation (if backend added)
- `tests/` - Test files (if testing is added)

### Integration Considerations

**For Google Sheets Integration:**
- Add `scripts/` folder for Google Apps Script
- Add `config/` folder for configuration files

**For Backend Integration:**
- Add `api/` folder for API endpoints
- Add `config/` folder for server configuration

## ✅ Best Practices

1. **Keep it organized**: Put files in appropriate folders
2. **Use clear names**: Name files so their purpose is obvious
3. **Document changes**: Update this file if structure changes
4. **Regular cleanup**: Remove unused files
5. **Version control**: Consider using Git for tracking changes

## 📝 Notes for Administrators

- The current structure is designed for simplicity
- Easy for young users (14-18) to understand
- Easy for administrators to maintain
- Can be expanded as needs grow
- All paths are relative, so files can be moved as a unit

---

**Last Updated**: 2025  
**Maintained By**: Project Administrator

