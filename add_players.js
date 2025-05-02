const fs = require('fs');

// Read the manager_data.json file
let managerData = JSON.parse(fs.readFileSync('./manager_data.json', 'utf8'));

// Players data from the image
const playersToAdd = [
  { name: "FRANK LAMPARD", team: "RAYONG FC", value: 108, season: "SEASON 8" },
  { name: "NICOLO BARELLA", team: "REAL MADRID", value: 86, season: "SEASON 8" },
  { name: "FRANK ZAMBO ANGUISSA", team: "REAL MADRID", value: 54, season: "SEASON 8" },
  { name: "LEON GORETZKA", team: "REAL MADRID", value: 50, season: "SEASON 8" },
  { name: "RODRIGO BENTACUR", team: "REAL MADRID", value: 50, season: "SEASON 8" },
  { name: "GRANIT XHAKA", team: "SL BENFICA", value: 80, season: "SEASON 8" },
  { name: "ANDRE ALMEIDA", team: "SL BENFICA", value: 50, season: "SEASON 8" },
  { name: "FRENKIE DE JONG", team: "SS LAZIO", value: 82, season: "SEASON 8" },
  { name: "VITINHA", team: "SS LAZIO", value: 82, season: "SEASON 8" },
  { name: "KONRAD LAIMER", team: "SSC NAPOLI", value: 52, season: "SEASON 8" },
  { name: "MATEO KOVACIC", team: "SSC NAPOLI", value: 50, season: "SEASON 8" },
  { name: "CURTIS JONES", team: "SSC NAPOLI", value: 50, season: "SEASON 8" },
  { name: "GUTI", team: "TOTTENHAM HOTSPUR", value: 130, season: "SEASON 8" },
  { name: "TONI KROOS", team: "TOTTENHAM HOTSPUR", value: 50, season: "SEASON 8" },
  { name: "LUKA MODRIC", team: "TOTTENHAM HOTSPUR", value: 68, season: "SEASON 8" },
  { name: "BIXENTE LIZARAZU", team: "RAYONG FC", value: 78, season: "SEASON 8", type: "legend" }
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
    // Create the new player object
    const newPlayer = {
      "name": player.name,
      "position": "CM",
      "value": player.value,
      "contract": player.season,
      "salary": parseFloat(salary),
      "type": player.type || "standard"  // Use provided type or default to "standard"
    };
    
    // Ensure squad and players array exist
    if (!managerData.managers[managerIndex].squad) {
      managerData.managers[managerIndex].squad = { total_players: 0, players: [] };
    } else if (!managerData.managers[managerIndex].squad.players) {
      managerData.managers[managerIndex].squad.players = [];
      managerData.managers[managerIndex].squad.total_players = 0;
    }
    
    // Add the player to the squad
    managerData.managers[managerIndex].squad.players.push(newPlayer);
    
    // Update total_players count
    managerData.managers[managerIndex].squad.total_players += 1;
    
    // Update club_total_value
    managerData.managers[managerIndex].club_total_value += player.value;
    
    console.log(`Added ${player.name} to ${player.team}`);
  } else {
    // Create a new manager/team if it doesn't exist
    const newManager = {
      "name": "MANAGER",
      "age": null,
      "club": player.team,
      "overall": null,
      "r2g_coin_balance": 1000,
      "r2g_token_balance": 100,
      "club_total_value": player.value,
      "star_rating": 1,
      "manager_rating": 0,
      "trophies_awards": 0,
      "squad": {
        "total_players": 1,
        "players": [{
          "name": player.name,
          "position": "CM",
          "value": player.value,
          "contract": player.season,
          "salary": parseFloat(salary),
          "type": player.type || "standard"  // Use provided type or default to "standard"
        }]
      },
      "performance": {
        "formula": "Sum of all season_stats (excluding sp_tour_stats)",
        "matches": 0,
        "wins": 0,
        "draws": 0,
        "losses": 0,
        "goals_scored": 0,
        "goals_conceded": 0,
        "goal_difference": 0,
        "clean_sheets": 0
      },
      "seasons": [
        {
          "number": 8,
          "status": "ongoing",
          "manager_rank": "-",
          "rank_point": 0,
          "team_income": 0,
          "team_expense": 0,
          "team_profit": "-",
          "session_rewards": 0,
          "competitions": {
            "division": {
              "name": "DIVISION",
              "placement": "In progress"
            },
            "super_cup": {
              "name": "SUPER CUP",
              "stage": "Not started/In progress"
            },
            "uefa": {
              "name": "UEFA",
              "stage": "Not started/In progress"
            },
            "elite_cup": {
              "name": "ELITE CUP",
              "stage": "In progress"
            },
            "world_cup": {
              "name": "WORLD CUP",
              "stage": "Not started/In progress"
            },
            "authentic": {
              "name": "AUTHENTIC",
              "stage": "In progress"
            }
          },
          "sp_tour_stats": {
            "matches": 0,
            "wins": 0,
            "draws": 0,
            "losses": 0,
            "goals_scored": 0,
            "goals_conceded": 0,
            "goal_difference": 0,
            "clean_sheets": 0
          },
          "season_stats": {
            "matches": 0,
            "wins": 0,
            "draws": 0,
            "losses": 0,
            "goals_scored": 0,
            "goals_conceded": 0,
            "goal_difference": 0,
            "clean_sheets": 0
          }
        }
      ],
      "current_season": 8
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