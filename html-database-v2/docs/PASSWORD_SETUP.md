# Password Protection Setup

## Overview

The Data Entry page is password protected to prevent unauthorized access on public terminals. Only authorized users can enter new records.

## Default Password

**Default Password**: `jrotc2025`

⚠️ **IMPORTANT**: Change this password before deploying to production!

## How to Change the Password

1. Open `html-database/js/data-entry.js`
2. Find the line near the top:
   ```javascript
   const DATA_ENTRY_PASSWORD = 'jrotc2025';
   ```
3. Change `'jrotc2025'` to your desired password
4. Save the file

## How It Works

- **Session-Based**: Authentication persists for the browser session
- **Automatic Logout**: Users are logged out when the browser is closed
- **Manual Logout**: Authorized users can click the "Logout" button
- **Public Access**: Other pages (View Records, Search) remain publicly accessible

## Security Notes

- The password is stored in JavaScript (client-side)
- This provides basic protection for public terminals
- For higher security needs, consider server-side authentication
- The password is visible in the source code, so use a method appropriate for your security needs

## User Experience

1. User visits Data Entry page
2. Login screen appears requesting password
3. After correct password, form is displayed
4. User can enter records
5. Logout button available in the header
6. Session persists until browser closes or user logs out

## For Public Terminals

- Password protects data entry from public access
- Viewing and searching records remains public
- Session automatically expires when browser closes
- Perfect for kiosk/dumb terminal setups

---

**Last Updated**: 2025

