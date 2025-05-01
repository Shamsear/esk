const fs = require('fs');

// Read the manager_data.json file
let managerData = JSON.parse(fs.readFileSync('./manager_data.json', 'utf8'));

// Players data from the image
const playersToAdd = [
  { name: "PEPELU", team: "LEICESTER CITY", value: 62, season: "SEASON 8" },
  { name: "LEANDRO PAREDES", team: "LEICESTER CITY", value: 52, season: "SEASON 8" },
  { name: "SANDRO TONALI", team: "LIVERPOOL FC", value: 100, season: "SEASON 8" },
  { name: "ROMEO LAVIA", team: "LIVERPOOL FC", value: 62, season: "SEASON 8" },
  { name: "LOTHAR MATTHAUS", team: "LOSC LILLE", value: 120, season: "SEASON 8" },
  { name: "BRUNO GUIMARAES", team: "LOSC LILLE", value: 82, season: "SEASON 8" },
  { name: "ALEKSANDER PAVLOVIC", team: "LOSC LILLE", value: 106, season: "SEASON 8" },
  { name: "SOFYAN AMRABAT", team: "MANCHESTER CITY", value: 40, season: "SEASON 8" },
  { name: "XABI ALONSO", team: "MANCHESTER UNITED", value: 128, season: "SEASON 8" },
  { name: "SCOTT MCTOMINAY", team: "MANCHESTER UNITED", value: 62, season: "SEASON 8" },
  { name: "TOMAS SOUCEK", team: "MOHUN BAGAN SG", value: 50, season: "SEASON 8" },
  { name: "NICO GONZALEZ", team: "MOHUN BAGAN SG", value: 50, season: "SEASON 8" },
  { name: "TYLER ADAMS", team: "MUMBAI CITY", value: 40, season: "SEASON 8" },
  { name: "MARTIN ZUBIMENDI", team: "NEWCASTLE UNITED", value: 128, season: "SEASON 8" },
  { name: "EDSON ALVAREZ", team: "NEWCASTLE UNITED", value: 66, season: "SEASON 8" },
  { name: "JORGINHO", team: "PARIS SAINT-GERMAIN", value: 60, season: "SEASON 8" },
  { name: "MANUEL LOCATELLI", team: "PARIS SAINT-GERMAIN", value: 60, season: "SEASON 8" },
  { name: "GILBERTO SILVA", team: "RAYONG FC", value: 182, season: "SEASON 8" },
  { name: "SERGIO BUSQUETS", team: "REAL MADRID CF", value: 80, season: "SEASON 8" },
  { name: "WATARU ENDO", team: "SANTOS FC", value: 82, season: "SEASON 8" },
  { name: "MARC CASADO", team: "SANTOS FC", value: 58, season: "SEASON 8" },
  { name: "EDGAR DAVIDS", team: "SPORTING CP", value: 142, season: "SEASON 8" },
  { name: "THOMAS PARTEY", team: "SPORTING CP", value: 80, season: "SEASON 8" },
  { name: "MARCELO BROZOVIC", team: "SS LAZIO", value: 56, season: "SEASON 8" },
  { name: "CASEMIRO", team: "SS LAZIO", value: 102, season: "SEASON 8" },
  { name: "GUIDO RODRIGUEZ", team: "SSC NAPOLI", value: 50, season: "SEASON 8" },
  { name: "BENAT PRADOS", team: "SSC NAPOLI", value: 50, season: "SEASON 8" },
  { name: "N'GOLO KANTE", team: "TOTTENHAM HOTSPUR", value: 190, season: "SEASON 8" },
  { name: "JOAO PALHINHA", team: "WOLVES", value: 66, season: "SEASON 8" }
];

// Function to add players to the respective team
function addPlayerToTeam(player) {
  // Calculate salary as 5% of value
  const salary = (player.value * 0.05).toFixed(1);
  
  // Find the manager with the matching club
  const managerIndex = managerData.managers.findIndex(manager => 
    manager.club === player.team
  );
  
  if (managerIndex !== -1) {
    // If the team exists, add the player to their squad
    const newPlayer = {
      "name": player.name,
      "position": "DM",
      "value": player.value,
      "contract": player.season,
      "salary": parseFloat(salary),
      "type": "standard"
    };

    // Initialize squad if it doesn't exist
    if (!managerData.managers[managerIndex].squad) {
      managerData.managers[managerIndex].squad = {
        "total_players": 0,
        "players": []
      };
    }

    managerData.managers[managerIndex].squad.players.push(newPlayer);
    managerData.managers[managerIndex].squad.total_players = managerData.managers[managerIndex].squad.players.length;
    console.log(`Added ${player.name} to ${player.team}`);
  } else {
    // If the team doesn't exist, create a new team with the player
    const newManager = {
      "name": "TBD",
      "age": 0,
      "club": player.team,
      "overall_rating": 0,
      "r2g_coin_balance": 0,
      "r2g_token_balance": 0,
      "club_total_value": player.value,
      "manager_rating": 0,
      "trophies": 0,
      "awards": 0,
      "squad": {
        "total_players": 1,
        "players": [{
          "name": player.name,
          "position": "DM",
          "value": player.value,
          "contract": player.season,
          "salary": parseFloat(salary),
          "type": "standard"
        }]
      }
    };
    managerData.managers.push(newManager);
    console.log(`Created new team ${player.team} and added ${player.name}`);
  }
}

// Add each player to their respective team
playersToAdd.forEach(player => {
  addPlayerToTeam(player);
});

// Save the updated data back to manager_data.json
fs.writeFileSync('./manager_data.json', JSON.stringify(managerData, null, 2));

console.log('All players have been added successfully!'); 