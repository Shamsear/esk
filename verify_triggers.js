// Script to verify enhanced database triggers are working correctly
require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

// Get environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY; // This needs to be a service role key

// Validate environment variables
if (!supabaseUrl || !supabaseKey) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in .env file');
  process.exit(1);
}

// Initialize Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to print test results
function printTestResult(testName, success, message) {
  const status = success ? '✅ PASSED' : '❌ FAILED';
  console.log(`${status}: ${testName} - ${message}`);
}

// Test 1: Test player update propagation to manager_squads
async function testPlayerValueUpdate() {
  try {
    console.log('\n--- TEST 1: Player value update propagation to manager_squads ---');
    
    // Find a player that is in a manager squad
    const { data: player, error: playerError } = await supabase
      .from('players')
      .select(`
        id, name, value, position,
        manager_squads (id, manager_id, value)
      `)
      .not('club_id', 'is', null)
      .limit(1)
      .single();
    
    if (playerError || !player) {
      printTestResult('Player Value Update', false, 'Failed to find a player: ' + (playerError?.message || 'No players found'));
      return;
    }
    
    console.log(`Selected player: ${player.name} (${player.id}), Current value: ${player.value}`);
    
    if (!player.manager_squads || player.manager_squads.length === 0) {
      printTestResult('Player Value Update', false, 'Player is not in any manager_squads');
      return;
    }
    
    // New value to test with (increase by 1)
    const newValue = player.value + 1;
    console.log(`Updating player value to: ${newValue}`);
    
    // Update the player value
    const { error: updateError } = await supabase
      .from('players')
      .update({ value: newValue })
      .eq('id', player.id);
    
    if (updateError) {
      printTestResult('Player Value Update', false, 'Failed to update player: ' + updateError.message);
      return;
    }
    
    // Wait a moment for triggers to execute
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if manager_squads were updated
    const { data: squads, error: squadsError } = await supabase
      .from('manager_squads')
      .select('id, value')
      .eq('player_id', player.id);
    
    if (squadsError) {
      printTestResult('Player Value Update', false, 'Failed to fetch squads: ' + squadsError.message);
      return;
    }
    
    // Verify all squads have the new value
    const allUpdated = squads.every(squad => squad.value === newValue);
    
    if (allUpdated) {
      printTestResult('Player Value Update', true, `All ${squads.length} manager squads updated to value ${newValue}`);
    } else {
      printTestResult('Player Value Update', false, 'Not all squads were updated');
      console.log('Squad values:', squads.map(s => s.value));
    }
    
    // Revert value to avoid side effects
    await supabase
      .from('players')
      .update({ value: player.value })
      .eq('id', player.id);
  } catch (error) {
    printTestResult('Player Value Update', false, 'Test error: ' + error.message);
  }
}

// Test 2: Test club change propagation
async function testClubChange() {
  try {
    console.log('\n--- TEST 2: Club change propagation ---');
    
    // First, find an appropriate player and clubs for testing
    const { data: player, error: playerError } = await supabase
      .from('players')
      .select(`
        id, name, club_id,
        clubs (id, name)
      `)
      .not('club_id', 'is', null)
      .limit(1)
      .single();
    
    if (playerError || !player) {
      printTestResult('Club Change', false, 'Failed to find a player: ' + (playerError?.message || 'No players found'));
      return;
    }
    
    // Find a different club to transfer the player to
    const { data: clubs, error: clubsError } = await supabase
      .from('clubs')
      .select('id, name')
      .neq('id', player.club_id)
      .limit(1)
      .single();
    
    if (clubsError || !clubs) {
      printTestResult('Club Change', false, 'Failed to find a different club: ' + (clubsError?.message || 'No other clubs found'));
      return;
    }
    
    console.log(`Selected player: ${player.name}, Current club: ${player.clubs?.name} (${player.club_id})`);
    console.log(`Target club for transfer: ${clubs.name} (${clubs.id})`);
    
    // Check if player is in a manager squad
    const { data: squads, error: squadsError } = await supabase
      .from('manager_squads')
      .select('id, manager_id')
      .eq('player_id', player.id);
    
    if (squadsError) {
      printTestResult('Club Change', false, 'Failed to check manager squads: ' + squadsError.message);
      return;
    }
    
    console.log(`Player is in ${squads.length} manager squads`);
    
    // Record original club_id for restoration
    const originalClubId = player.club_id;
    
    // Update player's club
    const { error: updateError } = await supabase
      .from('players')
      .update({ club_id: clubs.id })
      .eq('id', player.id);
    
    if (updateError) {
      printTestResult('Club Change', false, 'Failed to update player club: ' + updateError.message);
      return;
    }
    
    // Wait a moment for triggers to execute
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check player_stats for new entry
    const { data: stats, error: statsError } = await supabase
      .from('player_stats')
      .select('id, team')
      .eq('player_id', player.id)
      .eq('team', clubs.name);
    
    if (statsError) {
      printTestResult('Club Change - Stats', false, 'Failed to check player stats: ' + statsError.message);
    } else {
      printTestResult('Club Change - Stats', stats.length > 0, 
        stats.length > 0 ? `Found ${stats.length} player_stats entries for new club` : 'No player_stats entry created for new club');
    }
    
    // Check manager_squads for updates
    const { data: newSquads, error: newSquadsError } = await supabase
      .from('manager_squads')
      .select(`
        id, manager_id,
        managers (id, club_id, clubs (id, name))
      `)
      .eq('player_id', player.id);
    
    if (newSquadsError) {
      printTestResult('Club Change - Squads', false, 'Failed to check updated squads: ' + newSquadsError.message);
    } else {
      // Check if player is now in the squad of a manager from the new club
      const inNewClubSquad = newSquads.some(squad => 
        squad.managers?.club_id === clubs.id
      );
      
      printTestResult('Club Change - Squads', inNewClubSquad, 
        inNewClubSquad ? 'Player added to new club manager squad' : 'Player not added to new club manager squad');
    }
    
    // Restore original club_id
    await supabase
      .from('players')
      .update({ club_id: originalClubId })
      .eq('id', player.id);
  } catch (error) {
    printTestResult('Club Change', false, 'Test error: ' + error.message);
  }
}

// Test 3: Test player name change propagation
async function testPlayerNameChange() {
  try {
    console.log('\n--- TEST 3: Player name change propagation ---');
    
    // Find a player that is in a manager squad
    const { data: player, error: playerError } = await supabase
      .from('players')
      .select(`
        id, name,
        manager_squads (id, player_name)
      `)
      .not('manager_squads', 'is', null)
      .limit(1)
      .single();
    
    if (playerError || !player) {
      printTestResult('Player Name Change', false, 'Failed to find a player: ' + (playerError?.message || 'No players found'));
      return;
    }
    
    console.log(`Selected player: ${player.name} (${player.id})`);
    
    if (!player.manager_squads || player.manager_squads.length === 0) {
      printTestResult('Player Name Change', false, 'Player is not in any manager_squads');
      return;
    }
    
    // New temporary name for testing
    const originalName = player.name;
    const tempName = `${originalName} (TEST)`;
    
    console.log(`Changing player name to: ${tempName}`);
    
    // Update the player name
    const { error: updateError } = await supabase
      .from('players')
      .update({ name: tempName })
      .eq('id', player.id);
    
    if (updateError) {
      printTestResult('Player Name Change', false, 'Failed to update player: ' + updateError.message);
      return;
    }
    
    // Wait a moment for triggers to execute
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if manager_squads were updated
    const { data: squads, error: squadsError } = await supabase
      .from('manager_squads')
      .select('id, player_name')
      .eq('player_id', player.id);
    
    if (squadsError) {
      printTestResult('Player Name Change', false, 'Failed to fetch squads: ' + squadsError.message);
      return;
    }
    
    // Verify all squads have the new name
    const allUpdated = squads.every(squad => squad.player_name === tempName);
    
    if (allUpdated) {
      printTestResult('Player Name Change', true, `All ${squads.length} manager squads updated to name "${tempName}"`);
    } else {
      printTestResult('Player Name Change', false, 'Not all squads were updated with the new name');
      console.log('Some squad names:', squads.slice(0, 3).map(s => s.player_name));
    }
    
    // Revert name to original
    await supabase
      .from('players')
      .update({ name: originalName })
      .eq('id', player.id);
  } catch (error) {
    printTestResult('Player Name Change', false, 'Test error: ' + error.message);
  }
}

// Main function to run all tests
async function main() {
  console.log('=== Starting Database Trigger Verification Tests ===');
  
  try {
    // Run tests
    await testPlayerValueUpdate();
    await testClubChange();
    await testPlayerNameChange();
    
    console.log('\n=== All tests completed ===');
  } catch (error) {
    console.error('Unhandled error during tests:', error);
  }
}

// Run the main function
main().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
}); 