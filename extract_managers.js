// Script to extract manager names and clubs from manager_data.json
const fs = require('fs');

try {
  // Read the JSON file
  const data = fs.readFileSync('manager_data.json', 'utf8');
  const jsonData = JSON.parse(data);
  
  // Extract names and clubs
  const managers = jsonData.managers.map(manager => ({
    name: manager.name || "N/A",
    club: manager.club || "N/A"
  }));
  
  // Format and print the output
  console.log("NAME | CLUB");
  console.log("--- | ---");
  
  managers.forEach(manager => {
    console.log(`${manager.name} | ${manager.club}`);
  });
  
  // Save to a text file
  const outputText = managers.map(manager => `${manager.name} | ${manager.club}`).join('\n');
  fs.writeFileSync('managers_and_clubs.txt', "NAME | CLUB\n--- | ---\n" + outputText, 'utf8');
  
  console.log("\nData has been saved to managers_and_clubs.txt");
} catch (err) {
  console.error("Error processing the file:", err);
} 