# Excel Data Integration for Managers

This document explains how the managers.html page fetches data from your OneDrive Excel file.

## Overview

The application now fetches manager data directly from your OneDrive Excel file instead of the Supabase database. This allows multiple people to update the Excel file online, and the changes will be reflected in the application automatically.

## Important: Sheet Name

The application reads data from a sheet named **"summary"** (case-insensitive). 

- ✅ Your Excel can have multiple sheets with individual data
- ✅ Consolidate all manager data into one sheet named "summary"
- ✅ The "summary" sheet should contain the aggregated/consolidated data
- ✅ Other sheets will be ignored

If the "summary" sheet is not found, the application will fall back to reading the first sheet.

## Excel File Structure

Your Excel file can have multiple sheets, but the application will read from a sheet named **"summary"**.

### Summary Sheet Structure

The "summary" sheet should have the following columns (in order):

| Column | Field Name | Description | Example |
|--------|------------|-------------|---------|
| A | Manager Name | Full name of the manager | "Fayis" |
| B | Age/Rank | Manager's rank or age | 1 |
| C | Club | Club name | "Arsenal" |
| D | Overall Rating | Overall rating (0-100) | 85 |
| E | R2G Coin Balance | Coin balance | 50000 |
| F | R2G Token Balance | Token balance | 250 |
| G | Club Total Value | Total club value in millions | 450 |
| H | Star Rating | Star rating (0-5) | 4.5 |
| I | Trophies | Number of trophies | 5 |
| J | Awards | Number of awards | 3 |
| K | Matches | Total matches played | 38 |
| L | Wins | Total wins | 25 |
| M | Draws | Total draws | 8 |
| N | Losses | Total losses | 5 |
| O | Goals Scored | Total goals scored | 75 |
| P | Goals Conceded | Total goals conceded | 30 |
| Q | Goal Difference | Goal difference | 45 |
| R | Clean Sheets | Number of clean sheets | 15 |

### Example Excel Structure

**Sheet: "summary"**

```
| Manager Name | Age/Rank | Club           | Overall Rating | R2G Coin | R2G Token | Club Value | Star Rating | Trophies | Awards | Matches | Wins | Draws | Losses | Goals Scored | Goals Conceded | Goal Diff | Clean Sheets |
|--------------|----------|----------------|----------------|----------|-----------|------------|-------------|----------|--------|---------|------|-------|--------|--------------|----------------|-----------|--------------|
| Fayis        | 1        | Arsenal        | 85             | 50000    | 250       | 450        | 4.5         | 5        | 3      | 38      | 25   | 8     | 5      | 75           | 30             | 45        | 15           |
| DKM          | 2        | Al Nassar      | 83             | 45000    | 200       | 420        | 4.0         | 4        | 2      | 38      | 23   | 9     | 6      | 68           | 35             | 33        | 12           |
| Shadow 4a    | 3        | Real Madrid    | 88             | 60000    | 300       | 500        | 5.0         | 7        | 5      | 38      | 28   | 6     | 4      | 85           | 25             | 60        | 18           |
```

**Note:** You can have other sheets (e.g., "Individual Stats", "Season Data", etc.) but only the "summary" sheet will be read by the application.

## OneDrive URL Configuration

The Excel file URL is configured in both `managers.html` and `manager-detail.html`:

```javascript
const EXCEL_URL = 'https://onedrive.live.com/:x:/g/personal/C453379C0172365F/s!Al82cgGcN1PEpn6612xvHz2ksboe?resid=C453379C0172365F!4990&ithint=file%2Cxlsx&e=4fx0yz&migratedtospo=true&redeem=aHR0cHM6Ly8xZHJ2Lm1zL3gvcyFBbDgyY2dHY04xUEVwbjY2MTJ4dkh6MmtzYm9lP2U9NGZ4MHl6';
```

## How It Works

1. **Multiple Sheets**: Your Excel file can have multiple sheets for organizing individual data
2. **Summary Sheet**: Create a sheet named "summary" that consolidates all manager data
3. **Fetching**: The application fetches the Excel file from OneDrive
4. **Parsing**: The SheetJS library reads specifically the "summary" sheet
5. **Display**: The parsed data is displayed in the managers list and detail pages
6. **Real-time Updates**: When someone updates the "summary" sheet, changes appear on next page load

## Testing

A test page has been created at `test-excel.html` to verify the Excel file can be fetched and parsed correctly.

To test:
1. Open `test-excel.html` in your browser
2. Click "Test Fetch Excel Data"
3. Check if the data is displayed correctly

## Troubleshooting

### CORS Issues

If you encounter CORS (Cross-Origin Resource Sharing) errors:

1. **Option 1**: Make sure the OneDrive file sharing settings allow public access
2. **Option 2**: Use the "Test with CORS Proxy" button in test-excel.html
3. **Option 3**: Update the excel-fetcher.js to use a CORS proxy

### File Not Found

If the file cannot be found:
1. Verify the OneDrive URL is correct
2. Check that the file is shared publicly
3. Try accessing the URL directly in your browser

### Data Not Displaying

If data doesn't display correctly:
1. Check the browser console for errors (F12)
2. Verify the Excel column structure matches the expected format
3. Ensure the first row contains headers
4. Make sure there are no empty rows at the top

## Updating the Excel File

To update manager data:
1. Open the Excel file in OneDrive
2. Edit the data directly in the browser
3. Save the changes
4. Refresh the managers.html page to see updates

## Important Notes

- The first row of the Excel file should contain column headers
- Empty rows will be skipped automatically
- The application caches data briefly for performance
- Multiple people can edit the Excel file simultaneously through OneDrive
- Changes are reflected immediately after saving and refreshing the page

## Files Modified

The following files have been updated to use Excel data:

1. `managers.html` - Main managers list page
2. `manager-detail.html` - Individual manager detail page
3. `js/excel-fetcher.js` - Excel fetching and parsing logic (NEW)
4. `test-excel.html` - Testing page (NEW)

## Reverting to Database

If you need to revert back to using the Supabase database:

1. Replace the script imports in managers.html:
   ```html
   <!-- Replace this -->
   <script src="https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js"></script>
   <script type="module" src="js/excel-fetcher.js"></script>
   
   <!-- With this -->
   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
   <script type="module" src="manager-client.js"></script>
   ```

2. Update the import statement:
   ```javascript
   // Replace this
   import { getManagersFromExcel } from './js/excel-fetcher.js';
   
   // With this
   import { getManagers } from './manager-client.js';
   ```

3. Update the function call:
   ```javascript
   // Replace this
   const managers = await getManagersFromExcel(EXCEL_URL);
   
   // With this
   const managers = await getManagers();
   ```

## Support

If you encounter any issues, check:
1. Browser console for error messages (F12)
2. Network tab to see if the Excel file is being fetched
3. The test-excel.html page to verify the file structure
