# "summary" Sheet Guide

## 🎯 Overview

The application reads manager data from a sheet named **"summary"** in your Excel file. This allows you to:

- ✅ Have multiple sheets for organizing individual data
- ✅ Use formulas and calculations in other sheets
- ✅ Consolidate all final data into one "summary" sheet
- ✅ Keep your data organized while the app reads from one place

## 📋 Why "summary" Sheet?

Since you mentioned having multiple sheets with individual data, the "summary" sheet acts as:

1. **Central Hub** - All manager data consolidated in one place
2. **Clean Data** - Final calculated values without formulas
3. **App Interface** - What the application reads and displays
4. **Flexibility** - Other sheets can be used for any purpose

## 🏗️ Excel File Structure Example

```
Your Excel File:
│
├── 📊 summary (REQUIRED - App reads this)
│   ├── Row 1: Headers
│   ├── Row 2: Fayis data
│   ├── Row 3: DKM data
│   └── Row 4+: More managers...
│
├── 📈 Individual Stats (Optional)
│   ├── Detailed player statistics
│   ├── Match-by-match data
│   └── Performance metrics
│
├── 📅 Season Data (Optional)
│   ├── Season 1 data
│   ├── Season 2 data
│   └── Historical records
│
├── 🧮 Calculations (Optional)
│   ├── Formulas for aggregations
│   ├── Pivot tables
│   └── Charts
│
└── 📝 Notes (Optional)
    └── Any other information
```

## 🔄 Workflow Example

### Scenario: You have individual sheets for each manager

**Step 1: Individual Sheets**
```
Sheet: "Fayis_Stats"
- Detailed match data
- Player performance
- Financial records
```

**Step 2: Calculations**
```
Sheet: "Calculations"
- Aggregate stats from individual sheets
- Calculate totals, averages
- Use formulas like =SUM(), =AVERAGE()
```

**Step 3: Summary Sheet**
```
Sheet: "summary"
- Pull final values from calculations
- One row per manager
- Clean data (values, not formulas)
- This is what the app reads
```

## 📊 "summary" Sheet Structure

### Required Format

| Column | Name | Source Example |
|--------|------|----------------|
| A | Manager Name | Direct entry or =Fayis_Stats!A1 |
| B | Age/Rank | Direct entry or =Calculations!B2 |
| C | Club | Direct entry or =Fayis_Stats!B1 |
| D | Overall Rating | =Calculations!C2 |
| E | R2G Coin Balance | =Fayis_Stats!D10 |
| F | R2G Token Balance | =Fayis_Stats!E10 |
| G | Club Total Value | =SUM(Fayis_Stats!F2:F20) |
| H | Star Rating | =Calculations!D2 |
| I | Trophies | =COUNTA(Fayis_Stats!G:G) |
| J | Awards | =COUNTA(Fayis_Stats!H:H) |
| K | Matches | =COUNTA(Fayis_Stats!I:I) |
| L | Wins | =COUNTIF(Fayis_Stats!J:J,"Win") |
| M | Draws | =COUNTIF(Fayis_Stats!J:J,"Draw") |
| N | Losses | =COUNTIF(Fayis_Stats!J:J,"Loss") |
| O | Goals Scored | =SUM(Fayis_Stats!K:K) |
| P | Goals Conceded | =SUM(Fayis_Stats!L:L) |
| Q | Goal Difference | =O2-P2 |
| R | Clean Sheets | =COUNTIF(Fayis_Stats!L:L,0) |

**Important:** While you can use formulas to populate the "summary" sheet, the application will read the calculated VALUES, not the formulas themselves.

## ✅ Best Practices

### 1. Use Formulas in "summary" Sheet
```excel
✅ Good: =Individual_Stats!A1
✅ Good: =SUM(Season_Data!B:B)
✅ Good: =VLOOKUP(A2,Calculations!A:Z,5,FALSE)
```

This way, when you update individual sheets, the "summary" sheet updates automatically!

### 2. Keep "summary" Sheet Clean
- Only final values
- One row per manager
- No merged cells
- No extra formatting that might interfere

### 3. Name Your Sheets Clearly
```
✅ Good naming:
- summary
- Fayis_Individual_Stats
- Season_2024_Data
- Calculations_Helper

❌ Avoid:
- Sheet1, Sheet2, Sheet3
- Temp, Test, Old
```

### 4. Protect Other Sheets (Optional)
You can protect other sheets from accidental edits while keeping "summary" editable:
1. Right-click sheet tab
2. Protect Sheet
3. Set password (optional)

## 🔄 Update Workflow

### When Individual Data Changes:

1. **Update Individual Sheet**
   ```
   Sheet: "Fayis_Stats"
   - Add new match data
   - Update player stats
   ```

2. **Formulas Auto-Calculate**
   ```
   Sheet: "Calculations"
   - Formulas recalculate automatically
   - Aggregations update
   ```

3. **Summary Updates**
   ```
   Sheet: "summary"
   - Pulls new calculated values
   - Updates automatically if using formulas
   ```

4. **Refresh Website**
   ```
   - Open managers.html
   - Press F5 to refresh
   - See updated data
   ```

## 🎨 Example Setup

### Sheet 1: "summary" (Required)
```
| Manager Name | Age/Rank | Club    | Overall | ... |
|--------------|----------|---------|---------|-----|
| Fayis        | 1        | Arsenal | 85      | ... |
| DKM          | 2        | Al Nassr| 83      | ... |
```

### Sheet 2: "Fayis_Individual" (Optional)
```
| Match | Date | Goals | Assists | Result |
|-------|------|-------|---------|--------|
| 1     | ...  | 2     | 1       | Win    |
| 2     | ...  | 1     | 2       | Win    |
```

### Sheet 3: "DKM_Individual" (Optional)
```
| Match | Date | Goals | Assists | Result |
|-------|------|-------|---------|--------|
| 1     | ...  | 3     | 0       | Win    |
| 2     | ...  | 0     | 1       | Draw   |
```

### Sheet 4: "Calculations" (Optional)
```
| Manager | Total Goals | Total Assists | Win Rate |
|---------|-------------|---------------|----------|
| Fayis   | =SUM(...)   | =SUM(...)     | =...     |
| DKM     | =SUM(...)   | =SUM(...)     | =...     |
```

## 🚨 Common Issues

### Issue 1: "summary" sheet not found
**Solution:** Make sure the sheet is named exactly "summary" (case-insensitive)

### Issue 2: Formulas showing instead of values
**Solution:** This shouldn't happen - the app reads calculated values. If you see formulas on the website, check the Excel file.

### Issue 3: Data not updating
**Solution:** 
1. Check if formulas in "summary" are calculating
2. Press F9 in Excel to force recalculation
3. Save the file
4. Refresh the website

### Issue 4: Wrong data displayed
**Solution:**
1. Verify "summary" sheet has correct column order
2. Check row 1 has headers
3. Check data starts from row 2
4. Verify formulas are pulling from correct sheets

## 💡 Pro Tips

1. **Use Named Ranges**
   ```excel
   Define name: "FayisGoals" = Fayis_Stats!K:K
   Then use: =SUM(FayisGoals)
   ```

2. **Color Code Sheets**
   - Right-click sheet tab → Tab Color
   - Green for "summary"
   - Blue for individual data
   - Yellow for calculations

3. **Add Data Validation**
   - In "summary" sheet
   - Restrict club names to valid list
   - Prevent typos

4. **Use Comments**
   - Add comments to cells explaining formulas
   - Helps team understand data sources

5. **Version Control**
   - OneDrive keeps version history
   - File → Info → Version History
   - Can restore previous versions

## 📞 Quick Reference

| Task | Action |
|------|--------|
| Add new manager | Add row in "summary" sheet |
| Update stats | Update individual sheet (if using formulas) or "summary" directly |
| Change club | Edit "summary" sheet, column C |
| See changes on website | Save Excel, refresh managers.html |
| Check what app reads | Look at "summary" sheet |
| Organize data | Use other sheets as needed |

---

**Key Takeaway:** The "summary" sheet is your interface to the application. Everything else in your Excel file is for your organization and calculations. Keep "summary" clean and properly formatted, and you can structure the rest of your Excel file however you want!
