const fs = require('fs');

// Read the manager data file
const rawData = fs.readFileSync('manager_data.json');
const data = JSON.parse(rawData);

// Define player type lists
const legendPlayers = [
  'PARK JI-SUNG', 'SOL CAMPBELL', 'DENNIS BERGKAMP', 'DENIS LAW', 'LUDOVIC GIULY',
  'RYAN GIGGS', 'DWIGHT YORKE', 'JAN KOLLER', 'ALESSANDRO NESTA', 'STEVEN GERRARD',
  'SAMUEL ETO', 'JULIO CESAR', 'DIDA', 'ADRIANO', 'DIEGO MARADONA', 'TONY ADAMS',
  'RAFAEL VAN DER VAART', 'ROBERTO BAGGIO', 'IKER CASILLAS', 'RUUD VAN NISTELROOIJ',
  'GIOVANE ELBER', 'PETER SCHMEICHEL', 'FRANZ BECKENBAUER', 'DIDIER DROGBA',
  'FRANCO BARESI', 'GABRIEL BATISTUTA', 'DANIEL VAN BUYTEN', 'HEINZ RUMMENIGGE',
  'JOHAN CRUYFF', 'CLAUDE MAKELELE', 'DENILSON', 'VITOR BAIA', 'PAUL SCHOLES',
  'PETR CECH', 'DAVID SEAMAN', 'MICHAEL OWEN', 'CARLES PUYOL', 'PAOLO MALDINI',
  'ANDY COLE', 'PEP GUARDIOLA', 'FILIPPO INZAGHI', 'FRANCESCO TOTTI', 'DAVID VILLA',
  'JAVIER SAVIOLA', 'A. COSTACURTA', 'ULI HOENEB', 'ALESSANDRO DEL PIERO',
  'FERNANDO MORIENTES', 'DIMITAR BERBATOV', 'ROBBIE KEANE', 'MARCO VAN BASTEN',
  'ERIC CANTONA', 'ROBERT PIREZ', 'EMMANUEL PETIT', 'ROMARIO'
];

const primeLegendPlayers = [
  'TOMAS ROSICKY', 'FERNANDO TORRES', 'ANDRIY SHEVCHENKO', 'PATRICK VIEIRA',
  'RONALDINHO GAUCHO', 'ANDREA PIRLO', 'DIEGO FORLAN', 'HRISTO STOICHKOV',
  'RAUL', 'ANDRES INIESTA'
];

const primePlayers = [
  'RODRIGO DE PAUL', 'ALEXANDER ISAK', 'LUIS SUAREZ', 'ROBERT ANDRICH',
  'RAPHAEL VARANE', 'JOACHIM ANDERSEN', 'MOISES CAICEDO', 'MARTIN ODEGAARD',
  'RAPHINHA', 'LIONEL MESSI', 'INAKI WILLIAMS'
];

// Counters to track changes
let counters = {
  total: 0,
  updated: 0,
  legend: 0,
  primeLegend: 0,
  prime: 0,
  standard: 0,
  noTypeAdded: 0
};

// Process each manager's squad
if (data && data.managers && Array.isArray(data.managers)) {
  data.managers.forEach(manager => {
    // Check if the manager has a squad property with players
    if (manager.squad) {
      // Handle different squad structures - some use 'players' array, others are direct arrays
      const players = manager.squad.players || manager.squad;
      
      if (Array.isArray(players)) {
        players.forEach(player => {
          counters.total++;
          
          // Check and update player type if not already set
          if (!player.type) {
            if (legendPlayers.includes(player.name)) {
              player.type = 'legend';
              counters.legend++;
              counters.updated++;
            } else if (primeLegendPlayers.includes(player.name)) {
              player.type = 'prime legend';
              counters.primeLegend++;
              counters.updated++;
            } else if (primePlayers.includes(player.name)) {
              player.type = 'prime';
              counters.prime++;
              counters.updated++;
            } else {
              player.type = 'standard';
              counters.standard++;
              counters.updated++;
            }
            counters.noTypeAdded++;
          } else {
            // If player already has a type, verify it matches our lists
            if (legendPlayers.includes(player.name) && player.type !== 'legend') {
              player.type = 'legend';
              counters.legend++;
              counters.updated++;
            } else if (primeLegendPlayers.includes(player.name) && player.type !== 'prime legend') {
              player.type = 'prime legend';
              counters.primeLegend++;
              counters.updated++;
            } else if (primePlayers.includes(player.name) && player.type !== 'prime') {
              player.type = 'prime';
              counters.prime++;
              counters.updated++;
            }
          }
        });
      }
    }
  });

  // Save the updated data
  fs.writeFileSync('manager_data.json', JSON.stringify(data, null, 2));

  console.log(`Processed ${counters.total} players.`);
  console.log(`Updated ${counters.updated} player types.`);
  console.log(`Added type to ${counters.noTypeAdded} players that didn't have a type.`);
  console.log(`Legend players: ${counters.legend}`);
  console.log(`Prime legend players: ${counters.primeLegend}`);
  console.log(`Prime players: ${counters.prime}`);
  console.log(`Standard players: ${counters.standard}`);
  console.log('Updated manager_data.json has been saved.');
} else {
  console.error('Invalid manager data structure: expected an object with "managers" array');
} 