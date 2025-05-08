// manager-client.js - Supabase client for manager data
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Default values - these will be overridden if provided in the HTML
let SUPABASE_URL = 'https://aikjdwmacnpdsrqdkhkq.supabase.co';
let SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpa2pkd21hY25wZHNycWRraGtxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2MDY1NTQsImV4cCI6MjA2MjE4MjU1NH0.vcJZ5TxAdm4jC22CxaV4CxiElFt9OHYZhFzEIasyz-M';

// Check if we have configuration in HTML
const configElement = document.getElementById('app-config');
if (configElement) {
    const configUrl = configElement.getAttribute('data-supabase-url');
    const configKey = configElement.getAttribute('data-supabase-key');
    
    if (configUrl && configUrl.trim() !== '') SUPABASE_URL = configUrl.trim();
    if (configKey && configKey.trim() !== '') SUPABASE_KEY = configKey;
}

// Initialize the Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * Fetches all managers from the database with their related data
 * @returns {Promise<Array>} Array of manager objects
 */
export async function getManagers() {
    try {
        console.log('Fetching managers from Supabase...');
        
        // Fetch managers data
        const { data: managers, error: managersError } = await supabase
            .from('managers')
            .select(`
                *,
                club:clubs(name),
                performance:manager_performances(*),
                squad:manager_squads(
                    player_name,
                    position,
                    value,
                    contract,
                    salary,
                    player_type
                )
            `);
        
        if (managersError) {
            throw new Error(`Error fetching managers: ${managersError.message}`);
        }
        
        if (!managers || managers.length === 0) {
            console.warn('No managers found in the database');
            return [];
        }
        
        // Process managers to prepare for UI
        const processedManagers = await Promise.all(managers.map(async (manager) => {
            // Fetch seasons data for this manager
            const { data: seasons, error: seasonsError } = await supabase
                .from('seasons')
                .select(`
                    *,
                    competitions:season_competitions(
                        placement,
                        stage,
                        competition:competitions(name)
                    ),
                    season_stats(*)
                `)
                .eq('manager_id', manager.id);
            
            if (seasonsError) {
                console.error(`Error fetching seasons for manager ${manager.id}:`, seasonsError);
            }
            
            // Process seasons data to match the expected format
            const processedSeasons = (seasons || []).map(season => {
                // Convert competitions structure
                const competitions = {};
                season.competitions.forEach(sc => {
                    if (sc.competition && sc.competition.name) {
                        competitions[sc.competition.name] = {
                            name: sc.competition.name,
                            placement: sc.placement,
                            stage: sc.stage
                        };
                    }
                });
                
                // Extract first season stats (assuming only one per season)
                const seasonStats = season.season_stats && season.season_stats.length > 0 
                    ? season.season_stats[0] 
                    : {
                        matches: 0,
                        wins: 0,
                        draws: 0,
                        losses: 0,
                        goals_scored: 0,
                        goals_conceded: 0,
                        goal_difference: 0,
                        clean_sheets: 0
                    };
                
                return {
                    number: season.number,
                    manager_rank: season.manager_rank,
                    rank_point: season.rank_point,
                    team_income: season.team_income,
                    team_expense: season.team_expense,
                    team_profit: season.team_profit,
                    session_rewards: season.session_rewards,
                    competitions: competitions,
                    season_stats: seasonStats
                };
            });
            
            // Extract performance data (should be a single object, not an array)
            const performance = manager.performance && manager.performance.length > 0 
                ? manager.performance[0] 
                : {
                    matches: 0,
                    wins: 0,
                    draws: 0,
                    losses: 0,
                    goals_scored: 0,
                    goals_conceded: 0,
                    goal_difference: 0,
                    clean_sheets: 0
                };
            
            // Format the squad data
            const squad = {
                players: manager.squad || []
            };
            
            return {
                id: manager.id,
                name: manager.name,
                age: manager.age,
                club: manager.club ? manager.club.name : 'No Club',
                overall_rating: manager.overall_rating,
                r2g_coin_balance: manager.r2g_coin_balance,
                r2g_token_balance: manager.r2g_token_balance,
                club_total_value: manager.club_total_value,
                star_rating: manager.star_rating,
                trophies: manager.trophies,
                awards: manager.awards,
                performance: performance,
                squad: squad,
                seasons: processedSeasons
            };
        }));
        
        return processedManagers;
    } catch (error) {
        console.error('Error in getManagers:', error);
        throw error;
    }
}

/**
 * Fetches a specific manager by name
 * @param {string} managerName - The name of the manager to fetch
 * @returns {Promise<Object>} Manager object with related data
 */
export async function getManagerByName(managerName) {
    try {
        console.log(`Fetching manager with name: ${managerName}`);
        
        // First get the basic manager data
        const { data: managers, error: managerError } = await supabase
            .from('managers')
            .select(`
                *,
                club:clubs(name)
            `)
            .eq('name', managerName)
            .limit(1);
        
        if (managerError) {
            throw new Error(`Error fetching manager: ${managerError.message}`);
        }
        
        if (!managers || managers.length === 0) {
            throw new Error(`Manager not found: ${managerName}`);
        }
        
        const manager = managers[0];
        
        // Now fetch all related data
        const [performance, squad, seasons] = await Promise.all([
            // Fetch performance data
            supabase
                .from('manager_performances')
                .select('*')
                .eq('manager_id', manager.id)
                .limit(1)
                .then(({ data, error }) => {
                    if (error) throw new Error(`Error fetching performance: ${error.message}`);
                    return data && data.length > 0 ? data[0] : null;
                }),
                
            // Fetch squad data
            supabase
                .from('manager_squads')
                .select('player_name, position, value, contract, salary, player_type')
                .eq('manager_id', manager.id)
                .then(({ data, error }) => {
                    if (error) throw new Error(`Error fetching squad: ${error.message}`);
                    return data || [];
                }),
                
            // Fetch seasons data
            supabase
                .from('seasons')
                .select(`
                    *,
                    competitions:season_competitions(
                        placement,
                        stage,
                        competition:competitions(name)
                    ),
                    season_stats(*)
                `)
                .eq('manager_id', manager.id)
                .then(({ data, error }) => {
                    if (error) throw new Error(`Error fetching seasons: ${error.message}`);
                    
                    // Process seasons data
                    return (data || []).map(season => {
                        // Convert competitions structure
                        const competitions = {};
                        season.competitions.forEach(sc => {
                            if (sc.competition && sc.competition.name) {
                                competitions[sc.competition.name] = {
                                    name: sc.competition.name,
                                    placement: sc.placement,
                                    stage: sc.stage
                                };
                            }
                        });
                        
                        // Extract first season stats
                        const seasonStats = season.season_stats && season.season_stats.length > 0 
                            ? season.season_stats[0] 
                            : {
                                matches: 0,
                                wins: 0,
                                draws: 0,
                                losses: 0,
                                goals_scored: 0,
                                goals_conceded: 0,
                                goal_difference: 0,
                                clean_sheets: 0
                            };
                        
                        return {
                            number: season.number,
                            manager_rank: season.manager_rank,
                            rank_point: season.rank_point,
                            team_income: season.team_income,
                            team_expense: season.team_expense,
                            team_profit: season.team_profit,
                            session_rewards: season.session_rewards,
                            competitions: competitions,
                            season_stats: seasonStats
                        };
                    });
                })
        ]);
        
        // Combine all data into the expected format
        return {
            id: manager.id,
            name: manager.name,
            age: manager.age,
            club: manager.club ? manager.club.name : 'No Club',
            overall_rating: manager.overall_rating,
            r2g_coin_balance: manager.r2g_coin_balance,
            r2g_token_balance: manager.r2g_token_balance,
            club_total_value: manager.club_total_value,
            star_rating: manager.star_rating,
            trophies: manager.trophies,
            awards: manager.awards,
            performance: performance || {
                matches: 0,
                wins: 0,
                draws: 0,
                losses: 0,
                goals_scored: 0,
                goals_conceded: 0,
                goal_difference: 0,
                clean_sheets: 0
            },
            squad: {
                players: squad
            },
            seasons: seasons
        };
    } catch (error) {
        console.error('Error in getManagerByName:', error);
        throw error;
    }
} 