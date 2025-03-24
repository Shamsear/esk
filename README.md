# Eskimos Road to Glory Website

## Player Signing Auction Data Integration

The Player Signing page currently uses sample data but is designed to display auction results from the provided Excel sheet.

### Integration Options

To connect the Excel data properly, there are several options:

1. **Excel API Integration**
   - Use Microsoft Graph API to access the Excel file directly from OneDrive
   - Requires server-side code (Node.js, PHP, etc.) to authenticate and fetch data
   - Example implementation: [Microsoft Graph Excel API](https://docs.microsoft.com/en-us/graph/api/resources/excel)

2. **Export as CSV/JSON**
   - Export the Excel data as CSV or JSON
   - Host the exported file on the server
   - Update the player-auction.js file to fetch this data

3. **Google Sheets Integration**
   - Convert the Excel file to Google Sheets
   - Use Google Sheets API or publish the sheet to the web
   - Fetch the published data via JavaScript

### Implementation Steps

1. Choose one of the integration methods above
2. Update the `player-auction.js` file to fetch real data
3. Replace the sample data with the fetched data
4. Update the data structure to match the Excel columns

### Data Structure

The current implementation expects the following data structure:

```javascript
{
    name: "Player Name",
    position: "Position",  // Goalkeeper, Defender, Midfielder, Forward
    rating: 85,           // Player rating (number)
    winningTeam: "Team Name",
    bidAmount: 5000000,   // Bid amount in currency (number)
    reservePrice: 4000000 // Reserve price in currency (number)
}
```

### Excel OneDrive Link

Current Excel file: [Player Auction Excel Sheet](https://1drv.ms/x/s!Al82cgGcN1PEpnyCiAJNS9YXQpGQ?e=rI7oce)

## Pages Structure

- **index.html** - Home page with main navigation
- **career-mode.html** - Career mode options page
- **player-signing.html** - Auction results page
- **tournament-guide.html** - Guide for tournaments
- **manager-ranking.html** - Rankings for managers
- **trophy-cabinet.html** - Trophy display page
- **career-tournament.html** - Tournaments in career mode
- **registered-clubs.html** - List of registered clubs 