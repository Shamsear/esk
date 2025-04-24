const fs = require('fs');

// Read the JSON file
const data = JSON.parse(fs.readFileSync('players.json', 'utf8'));

// Now we have the exact player names from the database
// Let's update them with the correct ratings and positions
const playersToUpdate = [
  {
    name: "ALEXANDR GOLOVIN", 
    star: 3,
    position: "AM"
  },
  {
    name: "SAVIO", 
    star: 4,
    position: "LW"
  },
  // Let's also search for Morata and Fullkrug more directly
  {
    name: "ALVARO MORATA",
    search: ["MORATA", "ALVARO"],
    star: 4,
    position: "ST"
  },
  {
    name: "NICLAS FULLKRUG",
    search: ["FULLKRUG", "FÜLLKRUG", "NIKLAS"],
    star: 3,
    position: "ST"
  }
];

let foundCount = 0;

// Update players that we now know by exact name
playersToUpdate.forEach(player => {
  // Try exact name first
  let foundPlayer = data.find(p => p.name === player.name);
  
  // If not found and search terms are provided, try those
  if (!foundPlayer && player.search) {
    for (const searchTerm of player.search) {
      foundPlayer = data.find(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      if (foundPlayer) break;
    }
  }
  
  if (foundPlayer) {
    // Found the player, update their star rating
    const oldStar = foundPlayer.star;
    
    // Map numerical star rating to the appropriate format
    if (player.star === 3) {
      foundPlayer.star = foundPlayer.star.includes('legend') ? '3-star-legend' : '3-star-standard';
    } else if (player.star === 4) {
      foundPlayer.star = foundPlayer.star.includes('legend') ? '4-star-legend' : '4-star-standard';
    } else if (player.star === 5) {
      foundPlayer.star = foundPlayer.star.includes('legend') ? '5-star-legend' : '5-star-standard';
    }
    
    foundPlayer.level = foundPlayer.star.includes('legend') ? 'LEGENDARY' : 'STANDARD';
    
    // Update position if needed
    if (player.position) {
      foundPlayer.position = player.position;
    }
    
    console.log(`Updated ${foundPlayer.name}: Star rating ${oldStar} -> ${foundPlayer.star}${player.position ? `, Position -> ${player.position}` : ''}`);
    foundCount++;
  } else {
    console.log(`Could not find player: ${player.name}`);
  }
});

if (foundCount > 0) {
  // Write the updated data back to the file
  fs.writeFileSync('players.json', JSON.stringify(data, null, 2));
  console.log(`\nFinal updates completed: ${foundCount} more players updated`);
} else {
  console.log('\nNo additional players were found to update.');
} 