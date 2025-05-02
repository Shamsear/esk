const fs = require('fs');

// Read the manager data file
const rawData = fs.readFileSync('manager_data.json');
const data = JSON.parse(rawData);

// Function to generate a random star rating between 1 and 5
function generateStarRating() {
  return Math.floor(Math.random() * 5) + 1;
}

// Counter to track how many managers had star ratings added
let addedCount = 0;

// Process each manager - fix the access to the managers array
if (data && data.managers && Array.isArray(data.managers)) {
  data.managers.forEach(manager => {
    // Check if manager doesn't have a star_rating
    if (!manager.hasOwnProperty('star_rating')) {
      // Add star rating
      manager.star_rating = generateStarRating();
      addedCount++;
    }
  });

  // Save the updated data
  fs.writeFileSync('manager_data.json', JSON.stringify(data, null, 2));

  console.log(`Added star ratings to ${addedCount} managers.`);
  console.log('Updated manager_data.json has been saved.'); 
} else {
  console.error('Invalid manager data structure: expected an object with "managers" array');
} 