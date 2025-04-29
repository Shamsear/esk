const fs = require('fs');

// Read the manager_data.json file
const managerData = JSON.parse(fs.readFileSync('./manager_data.json', 'utf8'));

// Players to verify
const playersToVerify = [
  { name: "CAFU", team: "AL NASSR FC" },
  { name: "EMERSON ROYAL", team: "ARSENAL FC" },
  { name: "LILIAN THURAM", team: "BORUSSIA DORTMUND" },
  { name: "MATTY CASH", team: "CRYSTAL PALACE" },
  { name: "ALBERT FERRER", team: "FC BAYERN MUNICH" },
  { name: "DANILO", team: "FENERBAHCE" },
  { name: "NELSON SEMEDO", team: "FEYENOORD" }
];

// Verify each player
playersToVerify.forEach(player => {
  const manager = managerData.managers.find(m => m.club === player.team);
  
  if (manager) {
    const foundPlayer = manager.squad.players.find(p => p.name === player.name);
    
    if (foundPlayer) {
      console.log(`✅ ${player.name} found in ${player.team}`);
      console.log(`   Position: ${foundPlayer.position}, Value: ${foundPlayer.value}, Salary: ${foundPlayer.salary}`);
    } else {
      console.log(`❌ ${player.name} NOT found in ${player.team}`);
    }
  } else {
    console.log(`❌ Team ${player.team} not found in data`);
  }
});

// Count total teams and players
const totalTeams = managerData.managers.length;
const totalPlayers = managerData.managers.reduce((sum, manager) => {
  return sum + (manager.squad && manager.squad.players ? manager.squad.players.length : 0);
}, 0);

console.log(`\nTotal teams: ${totalTeams}`);
console.log(`Total players: ${totalPlayers}`); 