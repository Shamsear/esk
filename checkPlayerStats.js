// Script to check for mistakes in player stats
const fs = require('fs');

// Read players.json
try {
    const playersData = JSON.parse(fs.readFileSync('players.json', 'utf8'));
    
    // Arrays to store different types of issues
    const missingStats = [];
    const emptyStats = [];
    const invalidSeasonFormat = [];
    const seasonEndBeforeStart = [];
    const teamMismatches = [];
    const duplicateStats = [];
    const invalidValues = [];
    const missingFields = [];
    
    // Loop through all players
    playersData.forEach(player => {
        const playerIdentifier = `${player.name} (ID: ${player.id})`;
        
        // Check if player has stats
        if (!player.stats || !Array.isArray(player.stats)) {
            missingStats.push(playerIdentifier);
            return;
        }
        
        // Check if stats array is empty but should have stats
        if (player.stats.length === 0) {
            emptyStats.push(playerIdentifier);
            return;
        }
        
        // Check current club matches latest stat
        if (player.club && player.club !== 'FREE AGENT' && player.club !== 'FREE AGENTP') {
            // Sort stats by season end date to find the latest
            const sortedStats = [...player.stats].sort((a, b) => {
                if (!a.season || !b.season) return 0;
                const aEnd = parseFloat(a.season.split('-')[1] || 0);
                const bEnd = parseFloat(b.season.split('-')[1] || 0);
                return bEnd - aEnd;
            });
            
            // Check if latest team matches current club
            if (sortedStats[0] && sortedStats[0].team && sortedStats[0].team !== player.club) {
                teamMismatches.push({
                    player: playerIdentifier,
                    club: player.club,
                    latestTeam: sortedStats[0].team,
                    latestSeason: sortedStats[0].season
                });
            }
        }
        
        // Set to track duplicate seasons
        const seasonSet = new Set();
        
        // Check each stat entry
        player.stats.forEach(stat => {
            // Check for missing required fields
            if (!stat.team || !stat.season) {
                missingFields.push({
                    player: playerIdentifier,
                    missing: !stat.team ? 'team' : 'season',
                    stat: JSON.stringify(stat)
                });
                return;
            }
            
            // Check season format (should be x-y where x and y are numbers)
            const seasonRegex = /^\d+(\.\d+)?-\d+(\.\d+)?$/;
            if (!seasonRegex.test(stat.season)) {
                invalidSeasonFormat.push({
                    player: playerIdentifier,
                    invalidSeason: stat.season
                });
            } else {
                // Check if start season is greater than end season
                const [startSeason, endSeason] = stat.season.split('-').map(Number);
                if (startSeason >= endSeason) {
                    seasonEndBeforeStart.push({
                        player: playerIdentifier,
                        season: stat.season,
                        startSeason,
                        endSeason
                    });
                }
                
                // Check for duplicate seasons
                if (seasonSet.has(stat.season)) {
                    duplicateStats.push({
                        player: playerIdentifier,
                        season: stat.season,
                        team: stat.team
                    });
                } else {
                    seasonSet.add(stat.season);
                }
            }
            
            // Check if value is valid (should be a number or string representing a number)
            if (stat.value) {
                const numValue = parseFloat(stat.value);
                if (isNaN(numValue)) {
                    invalidValues.push({
                        player: playerIdentifier,
                        season: stat.season,
                        team: stat.team,
                        value: stat.value
                    });
                }
            }
        });
        
        // Check for overlapping seasons
        const seasons = player.stats
            .filter(stat => stat.season && stat.season.includes('-'))
            .map(stat => {
                const [start, end] = stat.season.split('-').map(Number);
                return { 
                    start, 
                    end, 
                    season: stat.season,
                    team: stat.team 
                };
            });
        
        // Sort seasons by start date
        seasons.sort((a, b) => a.start - b.start);
        
        // Check for overlapping seasons
        const overlappingSeasons = [];
        for (let i = 0; i < seasons.length - 1; i++) {
            for (let j = i + 1; j < seasons.length; j++) {
                // Check if seasons overlap
                if (seasons[i].end > seasons[j].start) {
                    overlappingSeasons.push({
                        player: playerIdentifier,
                        season1: `${seasons[i].season} (${seasons[i].team})`,
                        season2: `${seasons[j].season} (${seasons[j].team})`
                    });
                }
            }
        }
        
        // Add overlapping seasons to team mismatches if not already there
        if (overlappingSeasons.length > 0) {
            // Check if player already has a team mismatch
            const hasTeamMismatch = teamMismatches.some(m => m.player === playerIdentifier);
            
            if (!hasTeamMismatch) {
                overlappingSeasons.forEach(overlap => {
                    teamMismatches.push({
                        player: playerIdentifier,
                        issue: 'Overlapping seasons',
                        details: `${overlap.season1} overlaps with ${overlap.season2}`
                    });
                });
            }
        }
    });
    
    // Write results to file
    let outputText = `==== PLAYER STATS ISSUES REPORT ====\n\n`;
    
    // Summary of issues found
    outputText += `SUMMARY OF ISSUES FOUND:\n`;
    outputText += `- Players missing stats array: ${missingStats.length}\n`;
    outputText += `- Players with empty stats: ${emptyStats.length}\n`;
    outputText += `- Stats with invalid season format: ${invalidSeasonFormat.length}\n`;
    outputText += `- Stats with season end before start: ${seasonEndBeforeStart.length}\n`;
    outputText += `- Team mismatches with latest stat: ${teamMismatches.length}\n`;
    outputText += `- Duplicate season entries: ${duplicateStats.length}\n`;
    outputText += `- Invalid value entries: ${invalidValues.length}\n`;
    outputText += `- Missing required fields: ${missingFields.length}\n\n`;
    
    // Add details for each issue type
    if (missingStats.length > 0) {
        outputText += `\n==== PLAYERS MISSING STATS ARRAY ====\n`;
        missingStats.forEach(player => {
            outputText += `- ${player}\n`;
        });
    }
    
    if (emptyStats.length > 0) {
        outputText += `\n==== PLAYERS WITH EMPTY STATS ====\n`;
        emptyStats.forEach(player => {
            outputText += `- ${player}\n`;
        });
    }
    
    if (invalidSeasonFormat.length > 0) {
        outputText += `\n==== INVALID SEASON FORMAT ====\n`;
        invalidSeasonFormat.forEach(issue => {
            outputText += `- ${issue.player}: Invalid season format "${issue.invalidSeason}"\n`;
        });
    }
    
    if (seasonEndBeforeStart.length > 0) {
        outputText += `\n==== SEASON END BEFORE OR EQUAL TO START ====\n`;
        seasonEndBeforeStart.forEach(issue => {
            outputText += `- ${issue.player}: Season ${issue.season} has start (${issue.startSeason}) >= end (${issue.endSeason})\n`;
        });
    }
    
    if (teamMismatches.length > 0) {
        outputText += `\n==== TEAM MISMATCHES ====\n`;
        teamMismatches.forEach(issue => {
            if (issue.issue) {
                outputText += `- ${issue.player}: ${issue.issue} - ${issue.details}\n`;
            } else {
                outputText += `- ${issue.player}: Current club "${issue.club}" doesn't match latest team in stats "${issue.latestTeam}" (Season ${issue.latestSeason})\n`;
            }
        });
    }
    
    if (duplicateStats.length > 0) {
        outputText += `\n==== DUPLICATE SEASON ENTRIES ====\n`;
        duplicateStats.forEach(issue => {
            outputText += `- ${issue.player}: Duplicate season "${issue.season}" for team "${issue.team}"\n`;
        });
    }
    
    if (invalidValues.length > 0) {
        outputText += `\n==== INVALID VALUE ENTRIES ====\n`;
        invalidValues.forEach(issue => {
            outputText += `- ${issue.player}: Season ${issue.season}, Team ${issue.team} has invalid value "${issue.value}"\n`;
        });
    }
    
    if (missingFields.length > 0) {
        outputText += `\n==== MISSING REQUIRED FIELDS ====\n`;
        missingFields.forEach(issue => {
            outputText += `- ${issue.player}: Missing ${issue.missing} in stat entry ${issue.stat}\n`;
        });
    }
    
    // Write results to file
    fs.writeFileSync('player_stats_issues.txt', outputText);
    
    console.log(`Player stats analysis complete. Issues found in the following categories:`);
    console.log(`- Missing stats array: ${missingStats.length}`);
    console.log(`- Empty stats: ${emptyStats.length}`);
    console.log(`- Invalid season format: ${invalidSeasonFormat.length}`);
    console.log(`- Season end before start: ${seasonEndBeforeStart.length}`);
    console.log(`- Team mismatches: ${teamMismatches.length}`);
    console.log(`- Duplicate stats: ${duplicateStats.length}`);
    console.log(`- Invalid values: ${invalidValues.length}`);
    console.log(`- Missing fields: ${missingFields.length}`);
    console.log('Detailed results saved to player_stats_issues.txt');
    
} catch (error) {
    console.error('Error processing players.json:', error);
} 