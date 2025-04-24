const fs = require('fs');

// Read the JSON file
const data = JSON.parse(fs.readFileSync('players.json', 'utf8'));

// Count how many Free Agent players we're updating
let updatedCount = 0;

// Update Free Agent player values based on star rating
data.forEach(player => {
  // Only modify FREE AGENT players
  if (player.club === "FREE AGENT") {
    const oldValue = player.value;
    
    // Set value based on star rating
    if (player.star === "3-star-standard") {
      player.value = 40;
    } else if (player.star === "4-star-standard") {
      player.value = 50;
    } else if (player.star === "5-star-standard") {
      player.value = 80;
    } else if (player.star === "4-star-legend") {
      player.value = 60;
    } else if (player.star === "5-star-legend") {
      player.value = 100;
    }
    
    // Only count as updated if the value actually changed
    if (oldValue !== player.value) {
      updatedCount++;
      console.log(`Updated ${player.name}: Value ${oldValue} -> ${player.value} (${player.star}, ${player.club})`);
    }
  }
});

// Write the updated data back to the file
fs.writeFileSync('players.json', JSON.stringify(data, null, 2));
console.log(`\nUpdated values for ${updatedCount} FREE AGENT players.`); 