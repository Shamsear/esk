// Import Supabase JS client
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Get config from HTML if available, otherwise use defaults
let SUPABASE_URL = 'https://aikjdwmacnpdsrqdkhkq.supabase.co';
let SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpa2pkd21hY25wZHNycWRraGtxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2MDY1NTQsImV4cCI6MjA2MjE4MjU1NH0.vcJZ5TxAdm4jC22CxaV4CxiElFt9OHYZhFzEIasyz-M';

// Try to get config from the HTML
const configElement = document.getElementById('app-config');
if (configElement) {
    const configUrl = configElement.getAttribute('data-supabase-url');
    const configKey = configElement.getAttribute('data-supabase-key');
    
    if (configUrl && configUrl.trim() !== '') {
        SUPABASE_URL = configUrl;
    }
    
    if (configKey && configKey.trim() !== '') {
        SUPABASE_KEY = configKey;
    }
}

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Helper function to emit progress updates
function updateProgress(message) {
    window.dispatchEvent(new CustomEvent('player-data-progress', {
        detail: { message }
    }));
}

// Function to get all players
async function getPlayers() {
    try {
        let allPlayers = [];
        
        updateProgress('Counting total players...');
        
        // Fetch the total count first
        const { count, error: countError } = await supabase
            .from('players')
            .select('*', { count: 'exact', head: true });
            
        if (countError) {
            throw countError;
        }
        
        updateProgress(`Found ${count} players to load`);
        
        // Calculate how many pages we need with 1000 items per page
        const pageSize = 1000;
        const totalPages = Math.ceil(count / pageSize);
        
        // Fetch all pages
        for (let page = 0; page < totalPages; page++) {
            const from = page * pageSize;
            const to = from + pageSize - 1;
            
            updateProgress(`Loading players ${from+1} to ${Math.min(to+1, count)}...`);
            
            // Fetch players for this page
            const { data: players, error: playersError } = await supabase
                .from('players')
                .select(`
                    id, 
                    name,
                    position,
                    value,
                    level,
                    image_path,
                    star,
                    clubs (id, name)
                `)
                .range(from, to);
                
            if (playersError) {
                throw playersError;
            }
            
            allPlayers = [...allPlayers, ...players];
            updateProgress(`Loaded ${allPlayers.length} of ${count} players`);
        }
        
        // Fetch player stats separately
        updateProgress('Loading player statistics...');
        let allPlayerStats = [];
        
        // Fetch stats in pages too
        for (let page = 0; page < totalPages; page++) {
            const from = page * pageSize;
            const to = from + pageSize - 1;
            
            updateProgress(`Loading stats batch ${page+1} of ${totalPages}...`);
            
            const { data: playerStats, error: statsError } = await supabase
                .from('player_stats')
                .select('*')
                .range(from, to);
                
            if (statsError) {
                throw statsError;
            }
            
            allPlayerStats = [...allPlayerStats, ...playerStats];
        }
        
        updateProgress('Processing player data...');
        
        // Group stats by player_id
        const statsByPlayerId = {};
        allPlayerStats.forEach(stat => {
            if (!statsByPlayerId[stat.player_id]) {
                statsByPlayerId[stat.player_id] = [];
            }
            statsByPlayerId[stat.player_id].push(stat);
        });
        
        updateProgress(`Preparing ${allPlayers.length} players for display...`);
        
        // Transform the data to match the format expected by the UI
        return allPlayers.map(player => {
            const playerClub = player.clubs ? player.clubs.name : "FREE AGENT";
            const playerStats = statsByPlayerId[player.id] || [];
            
            // Determine star rating based on level and existing star data
            let starRating;
            
            // If player already has a star rating in the database, use it
            if (player.star && (player.star.includes('legend') || player.star.includes('standard'))) {
                starRating = player.star;
            } else {
                // Otherwise, determine based on level
                if (player.level >= 90) {
                    starRating = '5-star-standard';
                } else if (player.level >= 85) {
                    starRating = '4-star-standard';
                } else if (player.level >= 80) {
                    starRating = '3-star-standard';
                } else {
                    starRating = '3-star-standard'; // Default
                }
            }
            
            return {
                id: player.id,
                name: player.name,
                club: playerClub,
                position: player.position || '',
                value: player.value || 0,
                star: starRating,
                level: player.level ? player.level.toString() : 'undefined',
                imagePath: player.image_path || `/assets/images/players/${player.name.replace(/\s+/g, '_')}.webp`,
                stats: playerStats.map(stat => ({
                    season: stat.season || 'N/A',
                    team: stat.team || 'N/A',
                    value: stat.value || 0
                }))
            };
        });
    } catch (error) {
        console.error('Error fetching players:', error);
        updateProgress('Error loading player data. Please try again.');
        return [];
    }
}

// Function to get player details
async function getPlayerById(playerId) {
    try {
        const { data, error } = await supabase
            .from('players')
            .select(`
                id, 
                name,
                position,
                value,
                level,
                image_path,
                star,
                clubs (id, name)
            `)
            .eq('id', playerId)
            .single();
            
        if (error) {
            throw error;
        }
        
        // Get player stats
        const { data: playerStats, error: statsError } = await supabase
            .from('player_stats')
            .select('*')
            .eq('player_id', playerId);
            
        if (statsError) {
            throw statsError;
        }
        
        const playerClub = data.clubs ? data.clubs.name : "FREE AGENT";
        
        // Determine star rating based on level and existing star data
        let starRating;
        
        // If player already has a star rating in the database, use it
        if (data.star && (data.star.includes('legend') || data.star.includes('standard'))) {
            starRating = data.star;
        } else {
            // Otherwise, determine based on level
            if (data.level >= 90) {
                starRating = '5-star-standard';
            } else if (data.level >= 85) {
                starRating = '4-star-standard';
            } else if (data.level >= 80) {
                starRating = '3-star-standard';
            } else {
                starRating = '3-star-standard'; // Default
            }
        }
        
        return {
            id: data.id,
            name: data.name,
            club: playerClub,
            position: data.position || '',
            value: data.value || 0,
            star: starRating,
            level: data.level ? data.level.toString() : 'undefined',
            imagePath: data.image_path || `/assets/images/players/${data.name.replace(/\s+/g, '_')}.webp`,
            stats: playerStats.map(stat => ({
                season: stat.season || 'N/A',
                team: stat.team || 'N/A',
                value: stat.value || 0
            }))
        };
    } catch (error) {
        console.error('Error fetching player details:', error);
        return null;
    }
}

// Export functions
export { supabase, getPlayers, getPlayerById }; 