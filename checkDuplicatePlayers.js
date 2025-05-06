// Script to check for duplicate players in players.json
const fs = require('fs');

// Read players.json
try {
    const playersData = JSON.parse(fs.readFileSync('players.json', 'utf8'));
    
    // Arrays to store different types of duplicates
    const exactNameDuplicates = [];
    const exactNameDifferentIdDuplicates = [];
    const similarNameDuplicates = [];
    const sameNamePositionDuplicates = [];
    
    // Maps to track player names and IDs
    const nameMap = new Map();
    const idMap = new Map();
    const namePositionMap = new Map();
    
    // Function to normalize names for comparison
    function normalizeName(name) {
        return name.trim().toLowerCase()
            .replace(/\s+/g, ' ')           // Replace multiple spaces with single space
            .replace(/\./g, '')             // Remove periods
            .replace(/[^\w\s]/g, '');       // Remove other special characters
    }
    
    // Function to check if names are similar (potential misspellings)
    function areSimilarNames(name1, name2) {
        // Simple similarity check - at least 80% of characters match
        const normalizedName1 = normalizeName(name1);
        const normalizedName2 = normalizeName(name2);
        
        // Skip short names as they can lead to false positives
        if (normalizedName1.length < 5 || normalizedName2.length < 5) {
            return false;
        }
        
        // Count matching characters
        let matchCount = 0;
        const len1 = normalizedName1.length;
        const len2 = normalizedName2.length;
        const maxLength = Math.max(len1, len2);
        const minLength = Math.min(len1, len2);
        
        // If length difference is too big, not similar
        if (maxLength > minLength * 1.5) {
            return false;
        }
        
        // Check first 3 characters - if they don't match, likely not the same player
        if (normalizedName1.substring(0, 3) !== normalizedName2.substring(0, 3)) {
            return false;
        }
        
        // Compare each character
        for (let i = 0; i < minLength; i++) {
            if (normalizedName1[i] === normalizedName2[i]) {
                matchCount++;
            }
        }
        
        const similarity = matchCount / maxLength;
        return similarity > 0.8; // 80% similarity threshold
    }
    
    // Process each player
    playersData.forEach(player => {
        if (!player.name || !player.id) {
            return; // Skip players without name or ID
        }
        
        const playerIdentifier = `${player.name} (ID: ${player.id})`;
        const originalName = player.name;
        const normalizedName = normalizeName(originalName);
        const namePositionKey = `${normalizedName}-${player.position || 'unknown'}`;
        
        // Check for exact name duplicates
        if (nameMap.has(originalName)) {
            exactNameDuplicates.push({
                name: originalName,
                players: [
                    { id: nameMap.get(originalName).id, details: nameMap.get(originalName).details },
                    { id: player.id, details: playerIdentifier }
                ]
            });
        } else {
            nameMap.set(originalName, { id: player.id, details: playerIdentifier });
        }
        
        // Check for same name, different ID
        if (nameMap.has(originalName) && nameMap.get(originalName).id !== player.id) {
            exactNameDifferentIdDuplicates.push({
                name: originalName,
                players: [
                    { id: nameMap.get(originalName).id, details: nameMap.get(originalName).details },
                    { id: player.id, details: playerIdentifier }
                ]
            });
        }
        
        // Check for duplicate IDs
        if (idMap.has(player.id)) {
            // This is a severe error - IDs should be unique
            console.error(`DUPLICATE ID FOUND: ${player.id} used by "${idMap.get(player.id)}" and "${originalName}"`);
        } else {
            idMap.set(player.id, originalName);
        }
        
        // Check for same name and position
        if (namePositionMap.has(namePositionKey)) {
            sameNamePositionDuplicates.push({
                name: originalName,
                position: player.position || 'unknown',
                players: [
                    { id: namePositionMap.get(namePositionKey).id, details: namePositionMap.get(namePositionKey).details },
                    { id: player.id, details: playerIdentifier }
                ]
            });
        } else {
            namePositionMap.set(namePositionKey, { id: player.id, details: playerIdentifier });
        }
        
        // Check for similar names (potential duplicates with misspellings)
        for (const [existingName, existingData] of nameMap.entries()) {
            // Skip exact matches (already handled)
            if (existingName === originalName) continue;
            
            // Check if names are similar
            if (areSimilarNames(existingName, originalName)) {
                similarNameDuplicates.push({
                    name1: existingName,
                    name2: originalName,
                    players: [
                        { id: existingData.id, details: existingData.details },
                        { id: player.id, details: playerIdentifier }
                    ]
                });
            }
        }
    });
    
    // Write results to file
    let outputText = `==== DUPLICATE PLAYERS REPORT ====\n\n`;
    
    // Summary of duplicates found
    outputText += `SUMMARY OF DUPLICATES FOUND:\n`;
    outputText += `- Exact name duplicates: ${exactNameDuplicates.length}\n`;
    outputText += `- Same name with different IDs: ${exactNameDifferentIdDuplicates.length}\n`;
    outputText += `- Similar name duplicates (potential misspellings): ${similarNameDuplicates.length}\n`;
    outputText += `- Same name and position duplicates: ${sameNamePositionDuplicates.length}\n\n`;
    
    // Add details for each duplicate type
    if (exactNameDuplicates.length > 0) {
        outputText += `\n==== EXACT NAME DUPLICATES ====\n`;
        exactNameDuplicates.forEach(duplicate => {
            outputText += `- "${duplicate.name}":\n`;
            duplicate.players.forEach(player => {
                outputText += `  * ${player.details}\n`;
            });
            outputText += `\n`;
        });
    }
    
    if (exactNameDifferentIdDuplicates.length > 0) {
        outputText += `\n==== SAME NAME WITH DIFFERENT IDs ====\n`;
        exactNameDifferentIdDuplicates.forEach(duplicate => {
            outputText += `- "${duplicate.name}":\n`;
            duplicate.players.forEach(player => {
                outputText += `  * ${player.details}\n`;
            });
            outputText += `\n`;
        });
    }
    
    if (similarNameDuplicates.length > 0) {
        outputText += `\n==== SIMILAR NAME DUPLICATES (POTENTIAL MISSPELLINGS) ====\n`;
        similarNameDuplicates.forEach(duplicate => {
            outputText += `- "${duplicate.name1}" vs "${duplicate.name2}":\n`;
            duplicate.players.forEach(player => {
                outputText += `  * ${player.details}\n`;
            });
            outputText += `\n`;
        });
    }
    
    if (sameNamePositionDuplicates.length > 0) {
        outputText += `\n==== SAME NAME AND POSITION DUPLICATES ====\n`;
        sameNamePositionDuplicates.forEach(duplicate => {
            outputText += `- "${duplicate.name}" (${duplicate.position}):\n`;
            duplicate.players.forEach(player => {
                outputText += `  * ${player.details}\n`;
            });
            outputText += `\n`;
        });
    }
    
    // Write results to file
    fs.writeFileSync('duplicate_players.txt', outputText);
    
    console.log(`Duplicate player analysis complete. Duplicates found in the following categories:`);
    console.log(`- Exact name duplicates: ${exactNameDuplicates.length}`);
    console.log(`- Same name with different IDs: ${exactNameDifferentIdDuplicates.length}`);
    console.log(`- Similar name duplicates (potential misspellings): ${similarNameDuplicates.length}`);
    console.log(`- Same name and position duplicates: ${sameNamePositionDuplicates.length}`);
    console.log('Detailed results saved to duplicate_players.txt');
    
} catch (error) {
    console.error('Error processing players.json:', error);
} 