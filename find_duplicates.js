const fs = require('fs');

// Read the manager data file
const managerData = JSON.parse(fs.readFileSync('./manager_data.json', 'utf8'));

function findDuplicates() {
    const duplicates = {
        exactNameDuplicates: {}, // Players with exact same names
        similarNameDuplicates: {}, // Players with similar names
        playersByName: {}, // All players grouped by name
        nameVariations: {} // Track name variations
    };

    // Process each manager's squad
    managerData.managers.forEach(manager => {
        if (!manager.squad || !manager.squad.players) return;

        manager.squad.players.forEach(player => {
            const playerName = player.name.trim().toUpperCase();
            
            // Initialize player stats if not exists
            if (!duplicates.playersByName[playerName]) {
                duplicates.playersByName[playerName] = [];
            }

            // Add occurrence
            duplicates.playersByName[playerName].push({
                name: player.name,
                position: player.position,
                team: manager.club,
                value: player.value,
                contract: player.contract,
                type: player.type || 'standard'
            });

            // Check for similar names using various methods
            Object.keys(duplicates.playersByName).forEach(existingName => {
                if (playerName !== existingName) {
                    // Check for similar names (Levenshtein distance <= 2)
                    if (levenshteinDistance(playerName, existingName) <= 2) {
                        const key = [playerName, existingName].sort().join(' <-> ');
                        if (!duplicates.similarNameDuplicates[key]) {
                            duplicates.similarNameDuplicates[key] = {
                                names: [playerName, existingName],
                                occurrences: []
                            };
                        }
                        // Add both players' occurrences
                        duplicates.similarNameDuplicates[key].occurrences = [
                            ...duplicates.playersByName[playerName],
                            ...duplicates.playersByName[existingName]
                        ];
                    }
                }
            });
        });
    });

    // Find exact duplicates (same name, different positions/teams)
    Object.entries(duplicates.playersByName).forEach(([name, occurrences]) => {
        if (occurrences.length > 1) {
            duplicates.exactNameDuplicates[name] = occurrences;
        }
    });

    return duplicates;
}

// Levenshtein distance calculation for finding similar names
function levenshteinDistance(str1, str2) {
    const track = Array(str2.length + 1).fill(null).map(() =>
        Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) track[0][i] = i;
    for (let j = 0; j <= str2.length; j++) track[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
        for (let i = 1; i <= str1.length; i++) {
            const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
            track[j][i] = Math.min(
                track[j][i - 1] + 1,
                track[j - 1][i] + 1,
                track[j - 1][i - 1] + indicator
            );
        }
    }

    return track[str2.length][str1.length];
}

// Run the analysis
const results = findDuplicates();

// Create a detailed report
let report = '=== Player Name Analysis Report ===\n\n';

// 1. Exact Name Duplicates
report += '1. Exact Name Duplicates:\n';
report += '========================\n\n';
Object.entries(results.exactNameDuplicates).forEach(([name, occurrences]) => {
    report += `${name} - Found ${occurrences.length} times:\n`;
    occurrences.forEach(occ => {
        report += `  - Team: ${occ.team}, Position: ${occ.position}, Value: ${occ.value}, Contract: ${occ.contract}, Type: ${occ.type}\n`;
    });
    report += '\n';
});

// 2. Similar Names (Possible Typos/Variations)
report += '\n2. Similar Names (Possible Typos/Variations):\n';
report += '=======================================\n\n';
Object.entries(results.similarNameDuplicates).forEach(([key, data]) => {
    report += `Similar Names: ${data.names.join(' <-> ')}\n`;
    report += 'Occurrences:\n';
    data.occurrences.forEach(occ => {
        report += `  - Name: ${occ.name}, Team: ${occ.team}, Position: ${occ.position}, Value: ${occ.value}\n`;
    });
    report += '\n';
});

// 3. Summary Statistics
report += '\n3. Summary Statistics:\n';
report += '====================\n\n';
report += `Total unique player names: ${Object.keys(results.playersByName).length}\n`;
report += `Names with exact duplicates: ${Object.keys(results.exactNameDuplicates).length}\n`;
report += `Possible name variations found: ${Object.keys(results.similarNameDuplicates).length}\n`;

// Write the report to a file
fs.writeFileSync('player_names_report.txt', report);

console.log('Analysis complete! Check player_names_report.txt for the full report.');

// Output critical findings to console
console.log('\nCritical Findings:');
console.log('=================');
console.log(`Found ${Object.keys(results.exactNameDuplicates).length} names with exact duplicates`);
console.log(`Found ${Object.keys(results.similarNameDuplicates).length} possible name variations/typos`);

// Output some examples of duplicates
const exactDuplicateExamples = Object.entries(results.exactNameDuplicates).slice(0, 3);
if (exactDuplicateExamples.length > 0) {
    console.log('\nExample duplicates:');
    exactDuplicateExamples.forEach(([name, occurrences]) => {
        console.log(`- "${name}" appears ${occurrences.length} times`);
    });
}

// Output some examples of similar names
const similarNameExamples = Object.entries(results.similarNameDuplicates).slice(0, 3);
if (similarNameExamples.length > 0) {
    console.log('\nExample similar names:');
    similarNameExamples.forEach(([key, data]) => {
        console.log(`- Similar: ${data.names.join(' <-> ')}`);
    });
} 