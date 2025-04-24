const fs = require('fs');

// Read the JSON file
const data = JSON.parse(fs.readFileSync('players.json', 'utf8'));

// Fix the incorrect Morata match (we need to undo the change to ALVARO VALLES)
const vallesPlayer = data.find(p => p.name === "ALVARO VALLES");
if (vallesPlayer && vallesPlayer.position === "ST") {
  console.log(`Fixing ALVARO VALLES - reverting to GK from ST`);
  vallesPlayer.position = "GK";
}

// Search for actual Morata player
const morataSearch = data.find(p => 
  p.name.toLowerCase() === "morata" || 
  p.name.toLowerCase().includes("morata") && p.name !== "ALVARO VALLES"
);
if (morataSearch) {
  console.log(`Found Morata: ${morataSearch.name}`);
  morataSearch.star = "4-star-standard";
  morataSearch.position = "ST";
  morataSearch.level = "STANDARD";
}

// Fix ALEXANDR GOLOVIN
const golovinPlayer = data.find(p => p.name === "ALEXANDR GOLOVIN");
if (golovinPlayer) {
  console.log(`Updating ALEXANDR GOLOVIN to 3-star`);
  golovinPlayer.star = "3-star-standard";
  golovinPlayer.position = "AM";
  golovinPlayer.level = "STANDARD";
}

// Write the updated data back to the file
fs.writeFileSync('players.json', JSON.stringify(data, null, 2));
console.log('Fixed Golovin and Morata issues'); 