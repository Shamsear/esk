# Fix OneDrive File Sharing

## Problem

The Excel file is returning HTML (2579 bytes) instead of the actual Excel file. This means OneDrive is redirecting to a permission or login page.

## Solution: Make File Publicly Downloadable

### Step 1: Open OneDrive
1. Go to https://onedrive.live.com
2. Sign in with your Microsoft account
3. Find your Excel file

### Step 2: Share Settings
1. Right-click on the Excel file
2. Click "Share" or "Manage access"
3. Look for sharing settings

### Step 3: Set to Public
You need to set the file so "Anyone with the link" can download it:

1. Click "Anyone with the link can view"
2. Make sure it says "**Can view**" (not "Can edit")
3. **IMPORTANT**: Look for an option like "Allow download" or "Download" and make sure it's ENABLED

### Step 4: Get the Correct Link
After setting permissions:
1. Click "Copy link"
2. The link should look like: `https://1drv.ms/x/...`
3. Provide this new link

## Alternative: Use "Embed" Link

If the above doesn't work, try getting an embed link:

1. Right-click the file in OneDrive
2. Look for "Embed" option
3. Copy the embed code
4. Extract the URL from the embed code
5. It should look like: `https://onedrive.live.com/embed?...`

## Test the Link

To verify the link works:

1. Open a **private/incognito browser window**
2. Paste your OneDrive link
3. You should be able to download the file WITHOUT logging in
4. If it asks you to log in, the permissions are not set correctly

## Current Issue

Your current link returns HTML instead of Excel file, which means:
- ❌ File is not publicly downloadable
- ❌ OneDrive is showing a permission/login page
- ❌ Need to update sharing settings

## What Should Happen

When properly shared:
- ✅ Link opens file directly
- ✅ No login required
- ✅ File can be downloaded
- ✅ Returns Excel file (not HTML)

## Next Steps

1. Follow the steps above to make file publicly downloadable
2. Get the new sharing link
3. Test in incognito window
4. Provide the new link to update the code

---

**Once you have the correct public link, provide it and I'll update the code.**
