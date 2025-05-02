const fs = require('fs');

// Read the JSON file
const data = JSON.parse(fs.readFileSync('players.json', 'utf8'));

// Helper function to update a player's star rating
function updatePlayerStarRating(playerName, newStarRating, newPosition = null, fuzzyNames = []) {
  // Try exact match first
  let playerIndex = data.findIndex(player => player.name === playerName);
  
  // If not found and fuzzy names provided, try them
  if (playerIndex === -1 && fuzzyNames.length > 0) {
    for (const fuzzyName of fuzzyNames) {
      playerIndex = data.findIndex(player => 
        player.name === fuzzyName || 
        player.name.includes(fuzzyName) || 
        fuzzyName.includes(player.name)
      );
      if (playerIndex !== -1) break;
    }
  }
  
  // If still not found, try partial match with original name
  if (playerIndex === -1) {
    playerIndex = data.findIndex(player => 
      player.name.includes(playerName) || 
      playerName.includes(player.name)
    );
  }
  
  if (playerIndex !== -1) {
    // Found the player, update star rating
    const player = data[playerIndex];
    const oldStar = player.star;
    
    // Map numerical star rating to the appropriate format
    if (newStarRating === 3) {
      // Check if it's a legend or standard card
      if (player.star.includes('legend')) {
        player.star = '3-star-legend';
      } else {
        player.star = '3-star-standard';
      }
      player.level = player.star.includes('legend') ? 'LEGENDARY' : 'STANDARD';
    } else if (newStarRating === 4) {
      // Check if it's a legend or standard card
      if (player.star.includes('legend')) {
        player.star = '4-star-legend';
      } else {
        player.star = '4-star-standard';
      }
      player.level = player.star.includes('legend') ? 'LEGENDARY' : 'STANDARD';
    } else if (newStarRating === 5) {
      // Check if it's a legend or standard card
      if (player.star.includes('legend')) {
        player.star = '5-star-legend';
      } else {
        player.star = '5-star-standard';
      }
      player.level = player.star.includes('legend') ? 'LEGENDARY' : 'STANDARD';
    }
    
    // Update position if specified
    if (newPosition) {
      player.position = newPosition;
    }
    
    console.log(`Updated ${player.name}: Star rating ${oldStar} -> ${player.star}${newPosition ? `, Position -> ${newPosition}` : ''}`);
    return true;
  } else {
    console.log(`Player not found: ${playerName}`);
    return false;
  }
}

// GOALKEEPERS
console.log("\n===== UPDATING GOALKEEPERS =====");
updatePlayerStarRating("DAVID RAYA", 5);
updatePlayerStarRating("EMILIANO MARTINEZ", 5);
updatePlayerStarRating("JOSE SA", 3);
updatePlayerStarRating("KASPER SCHMEICHEL", 3);
updatePlayerStarRating("DAVID OSPINA", 3);
updatePlayerStarRating("PETER GULACSI", 3);
updatePlayerStarRating("ALVARO VALLES", 3);
updatePlayerStarRating("KEYLOR NAVAS", 4, null, ["KEILOR NAVAS"]);

// CENTER BACKS
console.log("\n===== UPDATING CENTER BACKS =====");
updatePlayerStarRating("DAVID ALABA", 4);
updatePlayerStarRating("KIM MIN-JAE", 4);
updatePlayerStarRating("MATTHIJS DE LIGT", 4);
updatePlayerStarRating("NATHAN AKE", 4);
updatePlayerStarRating("JAN VERTONGHEN", 3);
updatePlayerStarRating("TOBY ALDERWEIRELD", 3);
updatePlayerStarRating("YERAY", 4, null, ["YERAY ALVAREZ"]); // Name update
updatePlayerStarRating("DIEGO CARLOS", 3);
updatePlayerStarRating("NICOLAS OTAMENDI", 3);
updatePlayerStarRating("VICTOR LINDELOF", 3);
updatePlayerStarRating("PEPE", 3);
updatePlayerStarRating("DANILO PEREIRA", 3);
updatePlayerStarRating("SAM BEUKEMA", 3);
updatePlayerStarRating("BAFODE DIAKITE", 4);

// RIGHT BACKS
console.log("\n===== UPDATING RIGHT BACKS =====");
updatePlayerStarRating("REECE JAMES", 4);
updatePlayerStarRating("KYLE WALKER", 4);
updatePlayerStarRating("JURRIEN TIMBER", 4);

// LEFT BACKS
console.log("\n===== UPDATING LEFT BACKS =====");
updatePlayerStarRating("KIERAN TIERNEY", 3);
updatePlayerStarRating("BEN CHILWELL", 3);
updatePlayerStarRating("TYRELL MALACIA", 3, null, ["DAVID MALACIA"]);
updatePlayerStarRating("MARCOS ACUNA", 4);
updatePlayerStarRating("NUNO TAVARES", 4);

// DEFENSIVE MIDFIELDERS
console.log("\n===== UPDATING DEFENSIVE MIDFIELDERS =====");
updatePlayerStarRating("ALEKSANDER PAVLOVIC", 5);
updatePlayerStarRating("JERDY SCHOUTEN", 3);
updatePlayerStarRating("SOFYAN AMRABAT", 3);
updatePlayerStarRating("DENIS ZAKARIA", 4);
updatePlayerStarRating("JOSHUA KIMMICH", 5, "DM"); // Position change from RB to DM

// CENTER MIDFIELDERS
console.log("\n===== UPDATING CENTER MIDFIELDERS =====");
updatePlayerStarRating("DOUGLAS LUIZ", 4);
updatePlayerStarRating("TONI KROOS", 4);
updatePlayerStarRating("LUKA MODRIC", 4);
updatePlayerStarRating("ILKAY GUNDOGAN", 4);
updatePlayerStarRating("MIKEL MERINO", 4);
updatePlayerStarRating("TIJJANI REIJNDERS", 5);
updatePlayerStarRating("RYAN GRAVENBERCH", 5);
updatePlayerStarRating("ZAMBO ANGUISSA", 4, null, ["FRANK ANGUISSA", "FRANK ZAMBO ANGUISSA"]);
updatePlayerStarRating("GRANIT XHAKA", 5);
updatePlayerStarRating("BITELLO", 3);
updatePlayerStarRating("PAUL POGBA", 3);
updatePlayerStarRating("JAMES WARD-PROWSE", 3, null, ["JAMES WARD PROWSE"]);
updatePlayerStarRating("EVER BANEGA", 3);
updatePlayerStarRating("MATTEO PESSINA", 3);
updatePlayerStarRating("MARCEL SABITZER", 4);

// ATTACKING MIDFIELDERS
console.log("\n===== UPDATING ATTACKING MIDFIELDERS =====");
updatePlayerStarRating("DE ARRASCAETA", 3, null, ["G. DE ARRASCAETA", "GIORGIAN DE ARRASCAETA"]);
updatePlayerStarRating("ALEKSANDR GOLOVIN", 3, null, ["ALEXANDER GOLOVIN"]);
updatePlayerStarRating("ALAN LESCANO", 3);
updatePlayerStarRating("HAMED TRAORE", 3);
updatePlayerStarRating("SEBASTIAN DRIUSSI", 3);
updatePlayerStarRating("JUSTIN KLUIVERT", 4);

// Position changes to AM
updatePlayerStarRating("MATHEUS CUNHA", 4, "AM"); // from ST to AM
updatePlayerStarRating("JULIAN BRANDT", 4, "AM"); // from RW to AM
updatePlayerStarRating("EMILE SMITH ROWE", 4, "AM"); // from LW to AM

// RIGHT WINGERS
console.log("\n===== UPDATING RIGHT WINGERS =====");
updatePlayerStarRating("LEROY SANE", 4);
updatePlayerStarRating("FELIPE ANDERSON", 3);
updatePlayerStarRating("FEDERICO BERNARDESCHI", 3, null, ["F. BERNARDESCHI"]);
updatePlayerStarRating("PABLO SOLARI", 3);
updatePlayerStarRating("ANDERS DREYER", 3);
updatePlayerStarRating("MARCUS EDWARDS", 3);

// Position changes to RW
updatePlayerStarRating("MARCOS LLORENTE", 4, "RW"); // from CM to RW
updatePlayerStarRating("YEREMY PINO", 4, "RW"); // from LW to RW
updatePlayerStarRating("LEE KANG-IN", 4, "RW"); // from LW to RW

// LEFT WINGERS
console.log("\n===== UPDATING LEFT WINGERS =====");
updatePlayerStarRating("FEDERICO CHIESA", 4);
updatePlayerStarRating("FERRAN TORRES", 4);
updatePlayerStarRating("SAVINHO", 4);
updatePlayerStarRating("BRADLEY BARCOLA", 5);
updatePlayerStarRating("RAHEEM STERLING", 3);
updatePlayerStarRating("ROBIN GOSENS", 3);
updatePlayerStarRating("YANNICK CARRASCO", 3);
updatePlayerStarRating("STEPHY MAVIDIDI", 3);
updatePlayerStarRating("RYAN SESSEGNON", 3);

// Position changes to LW
updatePlayerStarRating("MATHYS TEL", 4, "LW"); // from ST to LW
updatePlayerStarRating("JADON SANCHO", 4, "LW"); // from RW to LW
updatePlayerStarRating("RAPHINHA", 5, "LW"); // from RW to LW
updatePlayerStarRating("SERGE GNABRY", 4, "LW"); // from RW to LW
updatePlayerStarRating("CRYSENCIO SUMMERVILLE", 4, "LW", ["C. SUMMERVILLE"]); // from RW to LW
updatePlayerStarRating("ALEX BAENA", 5, "LW"); // from AM to LW
updatePlayerStarRating("SON HEUNG-MIN", 5, "LW"); // from ST to LW
updatePlayerStarRating("CODY GAKPO", 5, "LW"); // from ST to LW

// STRIKERS
console.log("\n===== UPDATING STRIKERS =====");
updatePlayerStarRating("PAULO DYBALA", 4);
updatePlayerStarRating("ALVARO MORATA", 4);
updatePlayerStarRating("GABRIEL JESUS", 4);
updatePlayerStarRating("BENJAMIN SESKO", 5);
updatePlayerStarRating("VIKTOR GYOKERES", 5);
updatePlayerStarRating("NICOLAS JACKSON", 5);
updatePlayerStarRating("LOIS OPENDA", 5);
updatePlayerStarRating("LUUK DE JONG", 3);
updatePlayerStarRating("SEBASTIEN HALLER", 3);
updatePlayerStarRating("MAXIMILIAN BEIER", 3);
updatePlayerStarRating("ELYE WAHI", 3);
updatePlayerStarRating("ODSONNE EDOUARD", 3);
updatePlayerStarRating("GERARD DEULOFEU", 3);
updatePlayerStarRating("MEHDI TAREMI", 3);
updatePlayerStarRating("ANDREA PINAMONTI", 3);
updatePlayerStarRating("ANDREJ KRAMARIC", 3);
updatePlayerStarRating("ARMANDO BROJA", 3);
updatePlayerStarRating("ENES UNAL", 3);
updatePlayerStarRating("NICLAS FULLKRUG", 3);
updatePlayerStarRating("TIQUINHO SOARES", 3);
updatePlayerStarRating("OMAR MARMOUSH", 4);
updatePlayerStarRating("PIERRE-EMERICK AUBAMEYANG", 4, null, ["PIERRE AUBAMEYANG", "AUBAMEYANG"]);

// Position changes to ST
updatePlayerStarRating("AMINE GOUIRI", 4, "ST"); // from LW to ST
updatePlayerStarRating("PAULINHO", 4, "ST"); // from LW to ST
updatePlayerStarRating("MARCO ASENSIO", 4, "ST"); // from RW to ST
updatePlayerStarRating("DIOGO JOTA", 4, "ST"); // from LW to ST
updatePlayerStarRating("KAI HAVERTZ", 5, "ST"); // from AM to ST

// Write the updated data back to the file
fs.writeFileSync('players.json', JSON.stringify(data, null, 2));
console.log('\nAll player updates completed and saved to players.json');

// Count the number of successful updates
const successCount = console.log.toString().match(/Updated/g)?.length || 0;
console.log(`Successfully updated ${successCount} players.`); 