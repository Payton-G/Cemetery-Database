# GitHub Pages Setup Guide

This guide will walk you through setting up GitHub Pages to host your Memorial Park Cemetery Database for free.

## What is GitHub Pages?

GitHub Pages is a free hosting service that lets you host static websites directly from your GitHub repository. Perfect for HTML/CSS/JavaScript projects like this database!

## Prerequisites

- A GitHub account (free - sign up at https://github.com)
- Your cemetery database files ready to upload

## Step-by-Step Setup

### Step 1: Create a GitHub Account (if you don't have one)

1. Go to https://github.com
2. Click "Sign up"
3. Follow the registration process

### Step 2: Create a New Repository

1. Log into GitHub
2. Click the **"+"** icon in the top right corner
3. Select **"New repository"**
4. Fill in the details:
   - **Repository name**: `cemetery-database` (or any name you prefer)
   - **Description**: "Memorial Park Cemetery Database"
   - **Visibility**: Choose **Public** (required for free GitHub Pages)
   - **DO NOT** check "Initialize with README" (we'll upload files manually)
5. Click **"Create repository"**

### Step 3: Upload Your Files

#### Option A: Using GitHub Web Interface (Easiest)

1. In your new repository, click **"uploading an existing file"** link
2. Drag and drop your entire `html-database-v2` folder contents OR:
   - Click "choose your files" and select all files from the `html-database-v2` folder
3. Scroll down and enter a commit message: "Initial upload of cemetery database"
4. Click **"Commit changes"**

#### Option B: Using GitHub Desktop (Recommended for updates)

1. Download GitHub Desktop: https://desktop.github.com
2. Install and sign in with your GitHub account
3. Click **"File" → "Add Local Repository"**
4. Navigate to your `html-database-v2` folder
5. If it's not a git repository yet, click **"Create a Repository"**
6. Click **"Publish repository"** to upload to GitHub

#### Option C: Using Command Line (For advanced users)

```bash
cd "C:\Users\Admin\Desktop\JROTC Veterans list\html-database-v2"
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

### Step 4: Enable GitHub Pages

1. In your repository, click the **"Settings"** tab (top menu)
2. Scroll down to **"Pages"** in the left sidebar
3. Under **"Source"**, select:
   - **Branch**: `main` (or `master` if that's your branch)
   - **Folder**: `/ (root)` or `/docs` if you put files in docs folder
4. Click **"Save"**

### Step 5: Get Your Website URL

After enabling GitHub Pages, your site will be available at:

```
https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/
```

**Example:**
- If your username is `johndoe` and repository is `cemetery-database`
- Your URL would be: `https://johndoe.github.io/cemetery-database/`

### Step 6: Wait for Deployment

- GitHub Pages usually takes 1-2 minutes to deploy
- You'll see a green checkmark when it's ready
- Refresh the Pages settings to see your live URL

### Step 7: Update Your Embed Code

Once you have your GitHub Pages URL, update the embed code:

```html
<iframe 
    src="https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/index.html" 
    width="100%" 
    height="800px" 
    frameborder="0"
    style="border: none; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);"
    allowfullscreen>
</iframe>
```

## Important Notes

### File Structure

Make sure your `index.html` is in the root of your repository (or in the `/docs` folder if using that option). GitHub Pages looks for `index.html` as the default page.

### Custom Domain (Optional)

If you have a custom domain (like `cemeterydatabase.com`), you can:
1. Go to repository **Settings** → **Pages**
2. Enter your custom domain
3. Follow DNS configuration instructions

### Updating Your Site

Every time you make changes:
- **GitHub Desktop**: Commit and push changes
- **Web Interface**: Upload new files and commit
- **Command Line**: `git add .`, `git commit -m "message"`, `git push`

Changes usually appear within 1-2 minutes.

## Troubleshooting

### Site Not Loading?

1. Check that repository is **Public** (Settings → General → Danger Zone)
2. Verify `index.html` exists in the root folder
3. Wait a few minutes for deployment
4. Check repository Settings → Pages for any error messages

### 404 Error?

- Make sure `index.html` is in the root directory
- Check file paths in your HTML (use relative paths like `css/style.css`)
- Clear browser cache

### Files Not Updating?

- Make sure you committed and pushed changes
- Wait 1-2 minutes for GitHub to rebuild
- Hard refresh browser (Ctrl+F5)

## Quick Reference

**Your GitHub Pages URL Format:**
```
https://[username].github.io/[repository-name]/
```

**Example Embed Code:**
```html
<iframe 
    src="https://[username].github.io/[repository-name]/index.html" 
    width="100%" 
    height="800px" 
    frameborder="0"
    style="border: none; border-radius: 8px;">
</iframe>
```

## Next Steps

1. ✅ Set up GitHub account
2. ✅ Create repository
3. ✅ Upload files
4. ✅ Enable GitHub Pages
5. ✅ Get your URL
6. ✅ Use embed code in Google Sites

---

**Need Help?**
- GitHub Pages Documentation: https://docs.github.com/en/pages
- GitHub Support: https://support.github.com
