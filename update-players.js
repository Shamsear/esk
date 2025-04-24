const fs = require('fs');

// Read the JSON file
const data = JSON.parse(fs.readFileSync('players.json', 'utf8'));

// Players to update with their new values
const playersToUpdate = [
  { name: 'ROY MAKAAY', club: 'FREE AGENT', position: 'ST', value: 100 },
  { name: 'DIOGO DALOT', club: 'FREE AGENT', position: 'RB', value: 50 },
  { name: 'DESTINY UDOGIE', club: 'FREE AGENT', position: 'LB', value: 80 },
  { name: 'ROBERTO CARLOS', club: 'FREE AGENT', position: 'CB', value: 50 },
  { name: 'ANDREAS CHRISTENSEN', club: 'FREE AGENT', position: 'CB', value: 50 },
  { name: 'KOEN CASTEELS', club: 'FREE AGENT', position: 'GK', value: 50 },
  { name: 'LORENZO PELLEGRINI', club: 'FREE AGENT', position: 'AM', value: 50 },
  { name: 'HANS VANAKEN', club: 'FREE AGENT', position: 'AM', value: 50 },
  { name: 'RUI SILVA', club: 'FREE AGENT', position: 'GK', value: 40 },
  { name: 'WILFRED NDIDI', club: 'FREE AGENT', position: 'DM', value: 40 }
];

// Update each player
playersToUpdate.forEach(playerUpdate => {
  const playerIndex = data.findIndex(player => player.name === playerUpdate.name);
  if (playerIndex !== -1) {
    data[playerIndex].club = playerUpdate.club;
    data[playerIndex].position = playerUpdate.position;
    data[playerIndex].value = playerUpdate.value;
    console.log(`Updated ${playerUpdate.name}`);
  } else {
    console.log(`Player not found: ${playerUpdate.name}`);
  }
});

// Write the updated data back to the file
fs.writeFileSync('players.json', JSON.stringify(data, null, 2));
console.log('Updates completed and saved to players.json');