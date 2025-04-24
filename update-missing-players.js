const fs = require('fs');

// Read the JSON file
const data = JSON.parse(fs.readFileSync('players.json', 'utf8'));

// Players that weren't found in the first update with alternative name possibilities
const missingPlayers = [
  { 
    search: ['BAFODE DIAKITE', 'DIAKITE', 'BAFODÉ DIAKITÉ'],
    star: 4,
    position: 'CB'
  },
  { 
    search: ['ALEKSANDR GOLOVIN', 'ALEXANDER GOLOVIN', 'GOLOVIN', 'ALEKSANDAR GOLOVIN'],
    star: 3,
    position: 'AM'
  },
  { 
    search: ['SAVINHO', 'SAVIO', 'SÁVIO'],
    star: 4,
    position: 'LW'
  },
  { 
    search: ['ALVARO MORATA', 'MORATA'],
    star: 4,
    position: 'ST'
  },
  { 
    search: ['NICLAS FULLKRUG', 'NICLAS FÜLLKRUG', 'FULLKRUG', 'FÜLLKRUG'],
    star: 3,
    position: 'ST'
  }
];

let foundCount = 0;

// Process each missing player
missingPlayers.forEach(player => {
  let playerFound = false;
  let foundPlayer = null;
  
  // Try each possible name variant with different matching strategies
  for (const searchName of player.search) {
    // 1. Try exact match (case insensitive)
    let playerIndex = data.findIndex(p => 
      p.name.toLowerCase() === searchName.toLowerCase()
    );
    
    // 2. Try substring match
    if (playerIndex === -1) {
      playerIndex = data.findIndex(p => 
        p.name.toLowerCase().includes(searchName.toLowerCase()) || 
        searchName.toLowerCase().includes(p.name.toLowerCase())
      );
    }
    
    // 3. Try similar looking characters (if still not found)
    if (playerIndex === -1) {
      const normalizedSearchName = searchName
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, ""); // Remove diacritics
        
      playerIndex = data.findIndex(p => {
        const normalizedPlayerName = p.name
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "");
        
        return normalizedPlayerName.includes(normalizedSearchName) ||
               normalizedSearchName.includes(normalizedPlayerName);
      });
    }
    
    // If a match is found, update the player
    if (playerIndex !== -1) {
      foundPlayer = data[playerIndex];
      playerFound = true;
      break;
    }
  }
  
  if (playerFound && foundPlayer) {
    const oldStar = foundPlayer.star;
    
    // Map numerical star rating to the appropriate format
    if (player.star === 3) {
      // Check if it's a legend or standard card
      if (foundPlayer.star.includes('legend')) {
        foundPlayer.star = '3-star-legend';
      } else {
        foundPlayer.star = '3-star-standard';
      }
      foundPlayer.level = foundPlayer.star.includes('legend') ? 'LEGENDARY' : 'STANDARD';
    } else if (player.star === 4) {
      // Check if it's a legend or standard card
      if (foundPlayer.star.includes('legend')) {
        foundPlayer.star = '4-star-legend';
      } else {
        foundPlayer.star = '4-star-standard';
      }
      foundPlayer.level = foundPlayer.star.includes('legend') ? 'LEGENDARY' : 'STANDARD';
    } else if (player.star === 5) {
      // Check if it's a legend or standard card
      if (foundPlayer.star.includes('legend')) {
        foundPlayer.star = '5-star-legend';
      } else {
        foundPlayer.star = '5-star-standard';
      }
      foundPlayer.level = foundPlayer.star.includes('legend') ? 'LEGENDARY' : 'STANDARD';
    }
    
    // Update position if needed
    if (player.position) {
      foundPlayer.position = player.position;
    }
    
    console.log(`Updated ${foundPlayer.name}: Star rating ${oldStar} -> ${foundPlayer.star}${player.position ? `, Position -> ${player.position}` : ''}`);
    foundCount++;
  } else {
    console.log(`Still cannot find player matching: ${player.search.join(', ')}`);
  }
});

if (foundCount > 0) {
  // Write the updated data back to the file
  fs.writeFileSync('players.json', JSON.stringify(data, null, 2));
  console.log(`\nAdditional updates completed: ${foundCount} missing players updated`);
} else {
  console.log('\nNo additional players were found to update.');
} 