# Quick Start: Excel Integration

## What Changed?

Your managers.html page now fetches data from your OneDrive Excel file instead of the Supabase database.

## Important: Sheet Name

The application reads from a sheet named **"summary"** in your Excel file.

- ✅ You can have multiple sheets in your Excel file
- ✅ Create one sheet named "summary" (case-insensitive)
- ✅ Put all consolidated manager data in the "summary" sheet
- ✅ Other sheets will be ignored

## Excel File URL

Currently configured: 
```
https://onedrive.live.com/:x:/g/personal/C453379C0172365F/s!Al82cgGcN1PEpn6612xvHz2ksboe?resid=C453379C0172365F!4990&ithint=file%2Cxlsx&e=4fx0yz&migratedtospo=true&redeem=aHR0cHM6Ly8xZHJ2Lm1zL3gvcyFBbDgyY2dHY04xUEVwbjY2MTJ4dkh6MmtzYm9lP2U9NGZ4MHl6
```

## Required Excel Columns (in "summary" sheet, in order)

1. **Manager Name** - e.g., "Fayis"
2. **Age/Rank** - e.g., 1, 2, 3...
3. **Club** - e.g., "Arsenal"
4. **Overall Rating** - e.g., 85
5. **R2G Coin Balance** - e.g., 50000
6. **R2G Token Balance** - e.g., 250
7. **Club Total Value** - e.g., 450 (in millions)
8. **Star Rating** - e.g., 4.5
9. **Trophies** - e.g., 5
10. **Awards** - e.g., 3
11. **Matches** - e.g., 38
12. **Wins** - e.g., 25
13. **Draws** - e.g., 8
14. **Losses** - e.g., 5
15. **Goals Scored** - e.g., 75
16. **Goals Conceded** - e.g., 30
17. **Goal Difference** - e.g., 45
18. **Clean Sheets** - e.g., 15

## Testing

1. Open `test-excel.html` in your browser
2. Click "Test Fetch Excel Data"
3. Verify your data displays correctly

## How to Update Data

1. Open your Excel file in OneDrive
2. Go to the "summary" sheet
3. Edit the data
4. Save
5. Refresh managers.html page

## Files Changed

- ✅ `managers.html` - Now uses Excel
- ✅ `manager-detail.html` - Now uses Excel
- ✅ `js/excel-fetcher.js` - NEW file for Excel parsing
- ✅ `test-excel.html` - NEW test page

## Important Notes

- Sheet must be named "summary" (case-insensitive)
- First row should be headers
- Data starts from row 2
- Multiple people can edit simultaneously
- Changes appear after page refresh
- CORS proxy is used automatically if needed
- Other sheets in the Excel file are ignored

## Need Help?

Check the browser console (F12) for error messages or see EXCEL-SETUP-README.md for detailed documentation.
