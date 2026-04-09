# Visual Excel Guide

## 🎯 Important: Sheet Name

Your Excel file should have a sheet named **"summary"** containing all manager data.

```
Excel File Structure:
├── summary        ← This sheet is read by the application
├── Individual Stats (optional)
├── Season Data (optional)
└── Other sheets (optional, ignored by app)
```

## 📊 How Your "summary" Sheet Should Look

### Excel View (Simplified)

```
┌─────────────────┬──────────┬─────────────────┬────────────────┬──────────────────┬───────────────────┬──────────────────┬─────────────┬──────────┬────────┐
│  Manager Name   │ Age/Rank │      Club       │ Overall Rating │ R2G Coin Balance │ R2G Token Balance │ Club Total Value │ Star Rating │ Trophies │ Awards │
├─────────────────┼──────────┼─────────────────┼────────────────┼──────────────────┼───────────────────┼──────────────────┼─────────────┼──────────┼────────┤
│ Fayis           │    1     │ Arsenal         │       85       │      50000       │        250        │       450        │     4.5     │    5     │   3    │
│ DKM             │    2     │ Al Nassar       │       83       │      45000       │        200        │       420        │     4.0     │    4     │   2    │
│ Shadow 4a       │    3     │ Real Madrid     │       88       │      60000       │        300        │       500        │     5.0     │    7     │   5    │
│ Mubashir        │    4     │ AC Milan        │       82       │      42000       │        180        │       400        │     3.5     │    3     │   1    │
│ Abu             │    5     │ Brighton        │       80       │      38000       │        150        │       380        │     3.0     │    2     │   1    │
└─────────────────┴──────────┴─────────────────┴────────────────┴──────────────────┴───────────────────┴──────────────────┴─────────────┴──────────┴────────┘

┌─────────┬──────┬───────┬────────┬──────────────┬────────────────┬────────────────┬──────────────┐
│ Matches │ Wins │ Draws │ Losses │ Goals Scored │ Goals Conceded │ Goal Difference│ Clean Sheets │
├─────────┼──────┼───────┼────────┼──────────────┼────────────────┼────────────────┼──────────────┤
│   38    │  25  │   8   │   5    │      75      │       30       │       45       │      15      │
│   38    │  23  │   9   │   6    │      68      │       35       │       33       │      12      │
│   38    │  28  │   6   │   4    │      85      │       25       │       60       │      18      │
│   38    │  20  │  10   │   8    │      65      │       40       │       25       │      10      │
│   38    │  18  │  12   │   8    │      60      │       45       │       15       │       8      │
└─────────┴──────┴───────┴────────┴──────────────┴────────────────┴────────────────┴──────────────┘
```

## 🎯 Column Reference

### Columns A-J (Manager Info)
```
A: Manager Name    → Text (e.g., "Fayis")
B: Age/Rank        → Number (e.g., 1, 2, 3...)
C: Club            → Text (e.g., "Arsenal")
D: Overall Rating  → Number (e.g., 85)
E: R2G Coin        → Number (e.g., 50000)
F: R2G Token       → Number (e.g., 250)
G: Club Value      → Number (e.g., 450)
H: Star Rating     → Number (e.g., 4.5)
I: Trophies        → Number (e.g., 5)
J: Awards          → Number (e.g., 3)
```

### Columns K-R (Performance Stats)
```
K: Matches         → Number (e.g., 38)
L: Wins            → Number (e.g., 25)
M: Draws           → Number (e.g., 8)
N: Losses          → Number (e.g., 5)
O: Goals Scored    → Number (e.g., 75)
P: Goals Conceded  → Number (e.g., 30)
Q: Goal Difference → Number (e.g., 45)
R: Clean Sheets    → Number (e.g., 15)
```

## 📝 Step-by-Step Setup

### Step 1: Create/Open "summary" Sheet
1. Go to OneDrive
2. Open your Excel file in browser
3. Look for a sheet tab named "summary" at the bottom
4. If it doesn't exist, create it (right-click on sheet tabs → Insert → Worksheet)
5. Rename it to "summary"

### Step 2: Set Up Headers (Row 1)
In the "summary" sheet, copy these headers into Row 1:

| A | B | C | D | E | F | G | H | I | J | K | L | M | N | O | P | Q | R |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Manager Name | Age/Rank | Club | Overall Rating | R2G Coin Balance | R2G Token Balance | Club Total Value | Star Rating | Trophies | Awards | Matches | Wins | Draws | Losses | Goals Scored | Goals Conceded | Goal Difference | Clean Sheets |

### Step 3: Add Data (Starting Row 2)
In the "summary" sheet, example for Row 2:

| A | B | C | D | E | F | G | H | I | J | K | L | M | N | O | P | Q | R |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Fayis | 1 | Arsenal | 85 | 50000 | 250 | 450 | 4.5 | 5 | 3 | 38 | 25 | 8 | 5 | 75 | 30 | 45 | 15 |

### Step 4: Continue Adding Managers
Each manager gets one row:

```
Row 2: Fayis
Row 3: DKM
Row 4: Shadow 4a
Row 5: Mubashir
... and so on
```

## ✅ Checklist Before Testing

- [ ] Sheet is named "summary" (case-insensitive)
- [ ] Row 1 has all 18 headers in "summary" sheet
- [ ] Headers are spelled exactly as shown
- [ ] Data starts from Row 2 in "summary" sheet
- [ ] No empty rows between data
- [ ] All numbers are numbers (not text)
- [ ] Club names match registered-clubs.html
- [ ] File is saved
- [ ] File sharing is enabled

## 🎨 Formatting Tips

### Good Formatting ✅
```
Manager Name: Fayis
Age/Rank: 1
Club: Arsenal
Overall Rating: 85
```

### Bad Formatting ❌
```
Manager Name: "Fayis" (no quotes needed)
Age/Rank: #1 (no symbols)
Club: arsenal (inconsistent capitalization)
Overall Rating: 85% (no percentage sign)
```

## 🔍 Visual Indicators

### What You Should See in Excel:

```
┌─────────────────────────────────────────────────────────┐
│ File: Manager_Data.xlsx                                 │
├─────────────────────────────────────────────────────────┤
│ summary (active) │ Stats │ Season │ Other │            │ ← Sheet tabs
├─────────────────────────────────────────────────────────┤
│   A    │   B    │   C    │   D    │   E    │ ...       │
├────────┼────────┼────────┼────────┼────────┼───────────┤
│ Manager│Age/Rank│  Club  │Overall │ R2G    │ ...       │ ← Row 1 (Headers)
│  Name  │        │        │ Rating │ Coin   │           │
├────────┼────────┼────────┼────────┼────────┼───────────┤
│ Fayis  │   1    │Arsenal │   85   │ 50000  │ ...       │ ← Row 2 (Data)
├────────┼────────┼────────┼────────┼────────┼───────────┤
│  DKM   │   2    │Al Nassr│   83   │ 45000  │ ...       │ ← Row 3 (Data)
├────────┼────────┼────────┼────────┼────────┼───────────┤
│Shadow  │   3    │Real    │   88   │ 60000  │ ...       │ ← Row 4 (Data)
│  4a    │        │Madrid  │        │        │           │
└────────┴────────┴────────┴────────┴────────┴───────────┘
```

**Note:** The "summary" sheet tab should be visible at the bottom. Other sheets can exist but won't be read.

## 🚀 Quick Test

After setting up your Excel:

1. Save the file (Ctrl+S)
2. Open `test-excel.html` in browser
3. Click "Test Fetch Excel Data"
4. You should see your data displayed

## 📱 Mobile Editing

You can also edit from mobile:
1. Open OneDrive app
2. Find your Excel file
3. Tap to open
4. Edit directly
5. Changes sync automatically

## 👥 Team Collaboration

Multiple people can edit:
1. Share the OneDrive link with team
2. Everyone can edit simultaneously
3. Changes save automatically
4. No conflicts or overwrites
5. See who's editing in real-time

## 🎯 Common Scenarios

### Adding a New Manager
1. Go to "summary" sheet
2. Go to next empty row
3. Fill in all 18 columns
4. Save
5. Refresh managers.html

### Updating Stats
1. Go to "summary" sheet
2. Find the manager's row
3. Update the stat columns (K-R)
4. Save
5. Refresh managers.html

### Changing Club
1. Go to "summary" sheet
2. Find the manager's row
3. Update column C (Club)
4. Make sure club name matches exactly
5. Save
6. Refresh managers.html

---

**Remember:** 
- The Excel file can have multiple sheets for organizing data
- Only the "summary" sheet is read by the application
- Whatever is in the "summary" sheet will appear on the website after refresh!
- Other sheets can be used for calculations, individual stats, etc.
