# Excel Template for Manager Data

## Important: Sheet Name

Create a sheet named **"summary"** in your Excel file. This is where all manager data should be consolidated.

- ✅ You can have other sheets for individual data
- ✅ The "summary" sheet is what the application reads
- ✅ Sheet name is case-insensitive ("Summary", "SUMMARY", "summary" all work)

## Copy this structure to your "summary" sheet

### Row 1 (Headers)
```
Manager Name | Age/Rank | Club | Overall Rating | R2G Coin Balance | R2G Token Balance | Club Total Value | Star Rating | Trophies | Awards | Matches | Wins | Draws | Losses | Goals Scored | Goals Conceded | Goal Difference | Clean Sheets
```

### Example Data Rows

```
Fayis        | 1  | Arsenal           | 85 | 50000 | 250 | 450 | 4.5 | 5 | 3 | 38 | 25 | 8  | 5 | 75 | 30 | 45 | 15
DKM          | 2  | Al Nassar         | 83 | 45000 | 200 | 420 | 4.0 | 4 | 2 | 38 | 23 | 9  | 6 | 68 | 35 | 33 | 12
Shadow 4a    | 3  | Real Madrid       | 88 | 60000 | 300 | 500 | 5.0 | 7 | 5 | 38 | 28 | 6  | 4 | 85 | 25 | 60 | 18
Mubashir     | 4  | AC Milan          | 82 | 42000 | 180 | 400 | 3.5 | 3 | 1 | 38 | 20 | 10 | 8 | 65 | 40 | 25 | 10
Abu          | 5  | Brighton          | 80 | 38000 | 150 | 380 | 3.0 | 2 | 1 | 38 | 18 | 12 | 8 | 60 | 45 | 15 | 8
Fazi         | 6  | LOSC Lille        | 81 | 40000 | 170 | 390 | 3.5 | 3 | 2 | 38 | 19 | 11 | 8 | 62 | 42 | 20 | 9
Fayaz        | 7  | Borussia Dortmund | 84 | 48000 | 220 | 440 | 4.0 | 4 | 3 | 38 | 24 | 8  | 6 | 72 | 32 | 40 | 14
Sainu        | 8  | Atletico Madrid   | 83 | 46000 | 210 | 430 | 4.0 | 4 | 2 | 38 | 22 | 10 | 6 | 70 | 34 | 36 | 13
Siraj        | 9  | Sepahan SC        | 79 | 35000 | 140 | 360 | 3.0 | 2 | 1 | 38 | 17 | 13 | 8 | 58 | 48 | 10 | 7
Afsal        | 10 | Manchester City   | 87 | 58000 | 280 | 490 | 4.5 | 6 | 4 | 38 | 27 | 7  | 4 | 82 | 28 | 54 | 17
```

## Column Descriptions

| Column # | Name | Type | Description |
|----------|------|------|-------------|
| A | Manager Name | Text | Full name of the manager |
| B | Age/Rank | Number | Manager's current rank (1, 2, 3...) |
| C | Club | Text | Current club name |
| D | Overall Rating | Number | Overall rating (0-100) |
| E | R2G Coin Balance | Number | Current coin balance |
| F | R2G Token Balance | Number | Current token balance |
| G | Club Total Value | Number | Total club value in millions |
| H | Star Rating | Number | Star rating (0-5, can be decimal) |
| I | Trophies | Number | Total trophies won |
| J | Awards | Number | Total awards received |
| K | Matches | Number | Total matches played |
| L | Wins | Number | Total wins |
| M | Draws | Number | Total draws |
| N | Losses | Number | Total losses |
| O | Goals Scored | Number | Total goals scored |
| P | Goals Conceded | Number | Total goals conceded |
| Q | Goal Difference | Number | Goal difference (Scored - Conceded) |
| R | Clean Sheets | Number | Number of clean sheets |

## Tips

1. **Sheet Name** - Must be named "summary" (case-insensitive)
2. **Keep headers in Row 1** - Don't delete or move them
3. **Start data from Row 2** - First data row should be row 2
4. **No empty rows** - Empty rows will be skipped
5. **Consistent club names** - Use exact same spelling as in registered-clubs.html
6. **Numbers only** - Don't add currency symbols or units in number columns
7. **Save regularly** - OneDrive auto-saves, but manual save is safer
8. **Other sheets** - You can have other sheets, but only "summary" is read

## Validation Rules

- Manager Name: Required, must not be empty
- Age/Rank: Should be a number
- Club: Required, should match club names in the system
- All numeric fields: Should be numbers (no text)

## Common Mistakes to Avoid

❌ Not naming the sheet "summary"
❌ Adding extra columns in between
❌ Changing column order
❌ Deleting the header row
❌ Using formulas in data cells (use values only)
❌ Merging cells
❌ Having data in other sheets but not in "summary"

✅ Name the sheet "summary"
✅ Keep the structure exactly as shown
✅ Only edit data values in "summary" sheet
✅ Add new managers as new rows
✅ Use consistent formatting
✅ Save after each edit session
✅ You can have other sheets for reference/calculations
