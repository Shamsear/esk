// Script to find free agent players with seasons ending more than 6
const fs = require('fs');

// Read players.json
try {
    const playersData = JSON.parse(fs.readFileSync('players.json', 'utf8'));
    
    // Array to store results
    const freeAgentResults = [];
    
    // Loop through all players
    playersData.forEach(player => {
        // Check if player is a free agent
        if (player.club === 'FREE AGENT' || player.club === 'FREE AGENTP') {
            
            // Check if player has stats
            if (player.stats && player.stats.length > 0) {
                
                // Check each stats entry for seasons ending more than 6
                const hasLongSeasons = player.stats.some(stat => {
                    if (!stat.season) return false;
                    
                    // Parse the season range
                    const seasonParts = stat.season.split('-');
                    if (seasonParts.length === 2) {
                        const endSeason = parseFloat(seasonParts[1]);
                        return endSeason > 6;
                    }
                    return false;
                });
                
                // If player has seasons ending more than 6, add to results
                if (hasLongSeasons) {
                    // Format the player information
                    const playerInfo = {
                        id: player.id,
                        name: player.name,
                        position: player.position,
                        level: player.level,
                        star: player.star,
                        value: player.value,
                        stats: player.stats.map(stat => ({
                            season: stat.season,
                            team: stat.team,
                            value: stat.value
                        }))
                    };
                    
                    freeAgentResults.push(playerInfo);
                }
            }
        }
    });
    
    // Format results for output
    let outputText = `==== FREE AGENT PLAYERS WITH SEASON ENDING > 6 ====\n\n`;
    outputText += `Total Players Found: ${freeAgentResults.length}\n\n`;
    
    // Sort results by player name
    freeAgentResults.sort((a, b) => a.name.localeCompare(b.name));
    
    // Add each player to the output
    freeAgentResults.forEach(player => {
        outputText += `ID: ${player.id}\n`;
        outputText += `Name: ${player.name}\n`;
        outputText += `Position: ${player.position}\n`;
        outputText += `Level: ${player.level}\n`;
        outputText += `Star Rating: ${player.star}\n`;
        outputText += `Value: ${player.value}\n`;
        outputText += `Stats:\n`;
        
        // Add stats information
        player.stats.forEach(stat => {
            if (stat.season) {
                const endSeason = parseFloat(stat.season.split('-')[1]);
                const highlight = endSeason > 6 ? ' *** LONG SEASON ***' : '';
                outputText += `  - Season: ${stat.season}${highlight}, Team: ${stat.team}, Value: ${stat.value}\n`;
            }
        });
        
        outputText += `\n----------------------------\n\n`;
    });
    
    // Write results to file
    fs.writeFileSync('free_agents_long_seasons.txt', outputText);
    
    console.log(`Found ${freeAgentResults.length} free agent players with seasons ending > 6`);
    console.log('Results saved to free_agents_long_seasons.txt');
    
} catch (error) {
    console.error('Error processing players.json:', error);
} 