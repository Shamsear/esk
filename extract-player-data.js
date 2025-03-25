// Script to extract player data from player-status.html and save as JSON
const fs = require('fs');
const path = require('path');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

// Read the HTML file
const htmlFilePath = path.join(__dirname, 'player-status.html');
const htmlContent = fs.readFileSync(htmlFilePath, 'utf-8');

// Parse HTML
const dom = new JSDOM(htmlContent);
const document = dom.window.document;

// Select all player cards
const playerCards = document.querySelectorAll('.player-card');

// Array to hold all player data
const players = [];

// Extract data from each player card
playerCards.forEach(card => {
  try {
    const player = {
      name: card.getAttribute('data-name'),
      star: card.getAttribute('data-star'),
      level: card.getAttribute('data-level'),
      club: card.getAttribute('data-club'),
      position: card.getAttribute('data-position'),
      value: parseInt(card.getAttribute('data-value')),
      gamesPlayed: parseInt(card.getAttribute('data-games-played')),
      stats: JSON.parse(card.getAttribute('data-stats')),
      imagePath: card.querySelector('img').getAttribute('src')
    };
    
    players.push(player);
  } catch (error) {
    console.error(`Error extracting data for player: ${card.getAttribute('data-name')}`, error);
  }
});

// Save data as JSON
const jsonFilePath = path.join(__dirname, 'players.json');
fs.writeFileSync(jsonFilePath, JSON.stringify(players, null, 2), 'utf-8');

console.log(`Extracted data for ${players.length} players and saved to players.json`); 