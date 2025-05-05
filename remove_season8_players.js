const fs = require('fs');

// Read the file
const data = JSON.parse(fs.readFileSync('manager_data.json', 'utf8'));

// Keep track of changes
let totalPlayersRemoved = 0;
let managersAffected = 0;

// Process each manager
data.managers.forEach(manager => {
  if (manager.squad && Array.isArray(manager.squad.players)) {
    const originalCount = manager.squad.players.length;
    
    // Filter out players with SEASON 8 contract
    manager.squad.players = manager.squad.players.filter(player => {
      return player.contract !== "SEASON 8";
    });
    
    const newCount = manager.squad.players.length;
    const removedCount = originalCount - newCount;
    
    if (removedCount > 0) {
      // Update the total_players count
      manager.squad.total_players = newCount;
      totalPlayersRemoved += removedCount;
      managersAffected++;
      
      console.log(`Removed ${removedCount} players from ${manager.name}'s squad`);
    }
  }
});

// Save the changes
fs.writeFileSync('manager_data.json', JSON.stringify(data, null, 2));

console.log(`\nSummary:`);
console.log(`- Total players removed: ${totalPlayersRemoved}`);
console.log(`- Managers affected: ${managersAffected}`);
console.log(`- Total managers: ${data.managers.length}`); 