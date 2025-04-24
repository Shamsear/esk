const fs = require('fs');

// Read the JSON file
const data = JSON.parse(fs.readFileSync('players.json', 'utf8'));

// Special case for players with different names in the database
const specialCases = [
  { 
    search: ['JOÃO PEDRO', 'JOAO PEDRO', 'J. PEDRO'], 
    club: 'FREE AGENT', 
    position: 'ST', 
    value: 50 
  },
  { 
    search: ['SOL CAMPBELL'], 
    club: 'FREE AGENT', 
    position: 'CB', 
    value: 100 
  },
  { 
    search: ['MOISE KEAN', 'R KEAN', 'R. KEAN'], 
    club: 'FREE AGENT', 
    position: 'ST', 
    value: 60 
  },
  { 
    search: ['RUI SILVA', 'RUI PATRICIO'], 
    club: 'FREE AGENT', 
    position: 'GK', 
    value: 40 
  },
  { 
    search: ['WILFRED NDIDI', 'NDIDI'], 
    club: 'FREE AGENT', 
    position: 'DM', 
    value: 40 
  },
  { 
    search: ['PELLERGHINI', 'PELLEGRINI'], 
    club: 'FREE AGENT', 
    position: 'AM', 
    value: 50 
  },
  { 
    search: ['SEMENDO', 'SEMEDO', 'NELSON SEMEDO'], 
    club: 'FREE AGENT', 
    position: 'RB', 
    value: 40 
  }
];

// Process each special case
specialCases.forEach(specialCase => {
  let playerFound = false;
  
  // Try each possible name variant
  for (const name of specialCase.search) {
    // First try exact match
    let playerIndex = data.findIndex(player => player.name === name);
    
    // If not found, try partial match
    if (playerIndex === -1) {
      playerIndex = data.findIndex(player => player.name.includes(name));
    }
    
    // If a match is found, update the player
    if (playerIndex !== -1) {
      data[playerIndex].club = specialCase.club;
      data[playerIndex].position = specialCase.position;
      data[playerIndex].value = specialCase.value;
      console.log(`Updated ${data[playerIndex].name} (searched as ${name})`);
      playerFound = true;
      break;
    }
  }
  
  if (!playerFound) {
    console.log(`Could not find any player matching: ${specialCase.search.join(', ')}`);
  }
});

// Write the updated data back to the file
fs.writeFileSync('players.json', JSON.stringify(data, null, 2));
console.log('Special case updates completed and saved to players.json'); 