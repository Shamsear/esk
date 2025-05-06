const fs = require('fs');

// Load players data
function loadPlayersData() {
  try {
    const data = fs.readFileSync('players.json', 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error loading players.json: ${error.message}`);
    process.exit(1);
  }
}

// Main validation function
async function validatePlayersJson() {
  console.log('Loading players data...');
  const players = loadPlayersData();
  console.log(`Loaded ${players.length} players. Starting validation...`);
  
  // Initialize results object
  const results = {
    duplicateIds: [],
    duplicateNames: [],
    similarNames: [],
    missingRequiredFields: [],
    invalidValues: [],
    statIssues: [],
    incompleteData: [],
    inconsistentData: []
  };
  
  // Track IDs and names for duplicate detection
  const ids = new Map();
  const names = new Map();
  const normalizedNames = new Map();
  
  // Required fields
  const requiredPlayerFields = ['id', 'name', 'position'];
  const requiredStatFields = ['season', 'team'];
  
  // Valid positions
  const validPositions = ['GK', 'CB', 'SW', 'FB', 'WB', 'DM', 'CM', 'WM', 'AM', 'SS', 'CF'];
  
  // Process each player
  players.forEach((player, index) => {
    // Check for missing required fields
    requiredPlayerFields.forEach(field => {
      if (!player[field] && player[field] !== 0) {
        results.missingRequiredFields.push({
          id: player.id || `Unknown (index ${index})`,
          name: player.name || `Unknown (index ${index})`,
          issue: `Missing required field: ${field}`
        });
      }
    });
    
    if (player.id !== undefined) {
      // Check for duplicate IDs
      if (ids.has(player.id)) {
        results.duplicateIds.push({
          id: player.id,
          name: player.name || 'Unknown',
          duplicateWith: ids.get(player.id)
        });
      } else {
        ids.set(player.id, player.name || 'Unknown');
      }
    }
    
    if (player.name) {
      // Check for duplicate names
      if (names.has(player.name)) {
        results.duplicateNames.push({
          id: player.id || `Unknown (index ${index})`,
          name: player.name,
          duplicateWith: names.get(player.name)
        });
      } else {
        names.set(player.name, player.id || `Unknown (index ${index})`);
      }
      
      // Check for similar names
      const normalizedName = normalizeName(player.name);
      for (const [existingName, existingId] of normalizedNames.entries()) {
        if (existingName !== normalizedName && areSimilarNames(existingName, normalizedName)) {
          results.similarNames.push({
            id: player.id || `Unknown (index ${index})`,
            name: player.name,
            similarTo: getNameById(players, existingId) || 'Unknown',
            similarToId: existingId
          });
        }
      }
      normalizedNames.set(normalizedName, player.id || `Unknown (index ${index})`);
    }
    
    // Check valid position
    if (player.position && !validPositions.includes(player.position)) {
      results.invalidValues.push({
        id: player.id || `Unknown (index ${index})`,
        name: player.name || 'Unknown',
        issue: `Invalid position: ${player.position}. Valid positions are: ${validPositions.join(', ')}`
      });
    }
    
    // Check for incomplete data
    if (!player.position || !player.level || player.value === undefined) {
      results.incompleteData.push({
        id: player.id || `Unknown (index ${index})`,
        name: player.name || 'Unknown',
        issue: `Incomplete player data. Missing: ${!player.position ? 'position, ' : ''}${!player.level ? 'level, ' : ''}${player.value === undefined ? 'value' : ''}`
      });
    }
    
    // Check stats array
    if (!player.stats) {
      results.statIssues.push({
        id: player.id || `Unknown (index ${index})`,
        name: player.name || 'Unknown',
        issue: 'Missing stats array'
      });
    } else if (!Array.isArray(player.stats)) {
      results.statIssues.push({
        id: player.id || `Unknown (index ${index})`,
        name: player.name || 'Unknown',
        issue: 'Stats is not an array'
      });
    } else if (player.stats.length === 0) {
      results.statIssues.push({
        id: player.id || `Unknown (index ${index})`,
        name: player.name || 'Unknown',
        issue: 'Empty stats array'
      });
    } else {
      // Check for season issues
      const seasons = new Set();
      
      player.stats.forEach(stat => {
        // Check required stat fields
        requiredStatFields.forEach(field => {
          if (!stat[field] && stat[field] !== 0) {
            results.statIssues.push({
              id: player.id || `Unknown (index ${index})`,
              name: player.name || 'Unknown',
              issue: `Stat missing required field: ${field}`
            });
          }
        });
        
        // Check season format
        if (stat.season) {
          if (!stat.season.includes('/')) {
            results.statIssues.push({
              id: player.id || `Unknown (index ${index})`,
              name: player.name || 'Unknown',
              issue: `Invalid season format: ${stat.season}`
            });
          } else {
            const [startYear, endYear] = stat.season.split('/').map(year => parseInt(year));
            if (isNaN(startYear) || isNaN(endYear)) {
              results.statIssues.push({
                id: player.id || `Unknown (index ${index})`,
                name: player.name || 'Unknown',
                issue: `Invalid season year format: ${stat.season}`
              });
            } else if (endYear <= startYear) {
              results.statIssues.push({
                id: player.id || `Unknown (index ${index})`,
                name: player.name || 'Unknown',
                issue: `Season end year (${endYear}) should be greater than start year (${startYear}): ${stat.season}`
              });
            }
            
            // Check for duplicate seasons
            if (seasons.has(stat.season)) {
              results.statIssues.push({
                id: player.id || `Unknown (index ${index})`,
                name: player.name || 'Unknown',
                issue: `Duplicate season: ${stat.season}`
              });
            }
            seasons.add(stat.season);
          }
        }
        
        // Check for negative values
        ['goals', 'apps', 'assists', 'yellows', 'reds'].forEach(statField => {
          if (stat[statField] !== undefined && (typeof stat[statField] !== 'number' || stat[statField] < 0)) {
            results.invalidValues.push({
              id: player.id || `Unknown (index ${index})`,
              name: player.name || 'Unknown',
              issue: `Invalid ${statField} value: ${stat[statField]}`
            });
          }
        });
      });
    }
    
    // Check for club/team inconsistency
    if (player.club && player.stats && player.stats.length > 0) {
      const latestStat = findLatestStat(player.stats);
      if (latestStat && latestStat.team && player.club !== "FREE AGENT" && player.club !== "FREE AGENTP") {
        // Check if current club matches the latest stat team
        const clubNormalized = normalizeName(player.club);
        const teamNormalized = normalizeName(latestStat.team);
        
        if (clubNormalized !== teamNormalized && !areRelatedTeams(clubNormalized, teamNormalized)) {
          results.inconsistentData.push({
            id: player.id || `Unknown (index ${index})`,
            name: player.name || 'Unknown',
            issue: `Current club (${player.club}) doesn't match latest stat team (${latestStat.team}) for season ${latestStat.season}`
          });
        }
      }
    }
  });
  
  // Generate report
  const report = generateReport(results, players.length);
  
  // Write the report to a file
  fs.writeFileSync('players_json_issues.txt', report);
  
  console.log(`Validation complete. Found issues:`);
  console.log(`- Duplicate IDs: ${results.duplicateIds.length}`);
  console.log(`- Duplicate names: ${results.duplicateNames.length}`);
  console.log(`- Similar names: ${results.similarNames.length}`);
  console.log(`- Missing required fields: ${results.missingRequiredFields.length}`);
  console.log(`- Invalid values: ${results.invalidValues.length}`);
  console.log(`- Stat issues: ${results.statIssues.length}`);
  console.log(`- Incomplete data: ${results.incompleteData.length}`);
  console.log(`- Inconsistent data: ${results.inconsistentData.length}`);
  console.log(`Report written to players_json_issues.txt`);
}

// Find the latest stat by season
function findLatestStat(stats) {
  if (!stats || stats.length === 0) return null;
  
  return stats.reduce((latest, current) => {
    if (!latest.season) return current;
    if (!current.season) return latest;
    
    const [latestStartYear] = latest.season.split('/').map(year => parseInt(year));
    const [currentStartYear] = current.season.split('/').map(year => parseInt(year));
    
    return currentStartYear > latestStartYear ? current : latest;
  }, stats[0]);
}

// Helper function to normalize names for comparison
function normalizeName(name) {
  if (!name) return '';
  return name.trim().toUpperCase()
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s]/g, '');
}

// Helper function to check if names are similar
function areSimilarNames(name1, name2) {
  if (name1 === name2) return false; // Already caught as exact duplicates
  
  // Simple similarity algorithm
  let similarity = 0;
  const longer = name1.length > name2.length ? name1 : name2;
  const shorter = name1.length > name2.length ? name2 : name1;
  
  if (shorter.length === 0) return false;
  
  // Check for substring
  if (longer.includes(shorter)) return true;
  
  // Check common characters
  for (let i = 0; i < shorter.length; i++) {
    if (longer.includes(shorter[i])) {
      similarity++;
    }
  }
  
  return similarity / shorter.length > 0.8;
}

// Helper function to check if teams might be related (main team and reserves for example)
function areRelatedTeams(team1, team2) {
  return team1.includes(team2) || team2.includes(team1);
}

// Helper function to get name by id
function getNameById(players, id) {
  const player = players.find(p => p.id === id || p.id === parseInt(id));
  return player ? player.name : null;
}

// Generate a detailed report
function generateReport(results, totalPlayers) {
  let report = `PLAYERS.JSON VALIDATION REPORT\n`;
  report += `================================\n\n`;
  report += `Total players analyzed: ${totalPlayers}\n\n`;
  
  // Summary of issues
  report += `SUMMARY OF ISSUES\n`;
  report += `-----------------\n`;
  report += `- Critical Issues:\n`;
  report += `  - Duplicate IDs: ${results.duplicateIds.length}\n`;
  report += `  - Missing required fields: ${results.missingRequiredFields.length}\n\n`;
  
  report += `- Data Quality Issues:\n`;
  report += `  - Duplicate names: ${results.duplicateNames.length}\n`;
  report += `  - Similar names (potential duplicates): ${results.similarNames.length}\n`;
  report += `  - Invalid values: ${results.invalidValues.length}\n`;
  report += `  - Stat issues: ${results.statIssues.length}\n`;
  report += `  - Incomplete data: ${results.incompleteData.length}\n`;
  report += `  - Inconsistent data: ${results.inconsistentData.length}\n\n`;
  
  // Detailed reports for each issue type
  if (results.duplicateIds.length > 0) {
    report += `DUPLICATE IDs (CRITICAL)\n`;
    report += `----------------------\n`;
    results.duplicateIds.forEach(issue => {
      report += `- ID ${issue.id}: "${issue.name}" duplicates with "${issue.duplicateWith}"\n`;
    });
    report += `\n`;
  }
  
  if (results.missingRequiredFields.length > 0) {
    report += `MISSING REQUIRED FIELDS (CRITICAL)\n`;
    report += `--------------------------------\n`;
    results.missingRequiredFields.forEach(issue => {
      report += `- ${issue.name} (ID: ${issue.id}): ${issue.issue}\n`;
    });
    report += `\n`;
  }
  
  if (results.duplicateNames.length > 0) {
    report += `DUPLICATE NAMES\n`;
    report += `--------------\n`;
    results.duplicateNames.forEach(issue => {
      report += `- "${issue.name}" (ID: ${issue.id}) duplicates with player ID: ${issue.duplicateWith}\n`;
    });
    report += `\n`;
  }
  
  if (results.similarNames.length > 0) {
    report += `SIMILAR NAMES (POTENTIAL DUPLICATES)\n`;
    report += `----------------------------------\n`;
    results.similarNames.forEach(issue => {
      report += `- "${issue.name}" (ID: ${issue.id}) is similar to "${issue.similarTo}" (ID: ${issue.similarToId})\n`;
    });
    report += `\n`;
  }
  
  if (results.invalidValues.length > 0) {
    report += `INVALID VALUES\n`;
    report += `-------------\n`;
    results.invalidValues.forEach(issue => {
      report += `- ${issue.name} (ID: ${issue.id}): ${issue.issue}\n`;
    });
    report += `\n`;
  }
  
  if (results.statIssues.length > 0) {
    report += `STAT ISSUES\n`;
    report += `-----------\n`;
    results.statIssues.forEach(issue => {
      report += `- ${issue.name} (ID: ${issue.id}): ${issue.issue}\n`;
    });
    report += `\n`;
  }
  
  if (results.incompleteData.length > 0) {
    report += `INCOMPLETE DATA\n`;
    report += `--------------\n`;
    results.incompleteData.forEach(issue => {
      report += `- ${issue.name} (ID: ${issue.id}): ${issue.issue}\n`;
    });
    report += `\n`;
  }
  
  if (results.inconsistentData.length > 0) {
    report += `INCONSISTENT DATA\n`;
    report += `----------------\n`;
    results.inconsistentData.forEach(issue => {
      report += `- ${issue.name} (ID: ${issue.id}): ${issue.issue}\n`;
    });
    report += `\n`;
  }
  
  report += `End of report. Generated on ${new Date().toLocaleString()}\n`;
  
  return report;
}

// Run the validation
validatePlayersJson().catch(err => {
  console.error('Error during validation:', err);
}); 