/**
 * Club Loader and Manager
 * 
 * This script handles loading, caching, and optimization of club data and logos
 * for improved performance across all pages and devices.
 */

// Club data cache
const clubCache = {
    // Main clubs list
    clubs: [],
    
    // Optimized club logos
    logos: {},
    
    // Status flags
    initialized: false,
    initializing: false
};

/**
 * Initialize club data
 * - Loads club data from players.json
 * - Preloads club logos
 * - Caches all data for quick access
 */
async function initializeClubData() {
    // Prevent multiple initialization
    if (clubCache.initialized || clubCache.initializing) {
        return clubCache.clubs;
    }
    
    clubCache.initializing = true;
    
    try {
        // First try to get club data from players.json
        let playersData = [];
        
        try {
            // Try multiple sources
            const sources = [
                './players.json',
                'http://localhost:3000/players.json',
                '../players.json'
            ];
            
            for (const source of sources) {
                try {
                    const response = await fetch(source, { cache: 'no-store' });
                    if (response.ok) {
                        playersData = await response.json();
                        break;
                    }
                } catch (sourceError) {
                    console.log(`Could not load players from ${source}`);
                }
            }
            
            if (!playersData.length) {
                throw new Error('Failed to load player data from any source');
            }
        } catch (error) {
            console.error('Error loading player data:', error);
            return [];
        }
        
        // Extract clubs from players data
        const clubsSet = new Set();
        const clubsList = [];
        
        // First get clubs from player.club
        playersData.forEach(player => {
            if (player.club && !clubsSet.has(player.club)) {
                clubsSet.add(player.club);
                clubsList.push({
                    name: player.club,
                    logo: player.clubLogo || `assets/images/players/club/${player.club}.webp`
                });
            }
        });
        
        // Then add teams from player stats
        playersData.forEach(player => {
            if (player.stats && Array.isArray(player.stats)) {
                player.stats.forEach(stat => {
                    if (stat.team && !clubsSet.has(stat.team)) {
                        clubsSet.add(stat.team);
                        clubsList.push({
                            name: stat.team,
                            logo: `assets/images/players/club/${stat.team}.webp`
                        });
                    }
                });
            }
        });
        
        // Sort clubs alphabetically
        clubsList.sort((a, b) => a.name.localeCompare(b.name));
        
        // Set the clubs in cache
        clubCache.clubs = clubsList;
        
        // Preload club logos for faster access
        for (const club of clubsList) {
            if (club.logo) {
                try {
                    // Check if -low quality version exists for performance optimization
                    const lowQualityLogo = club.logo.replace('.webp', '-low.webp');
                    const img = new Image();
                    img.src = lowQualityLogo;
                    
                    // Set a timeout to use high quality after 500ms
                    setTimeout(() => {
                        const highQualityImg = new Image();
                        highQualityImg.src = club.logo;
                        clubCache.logos[club.name] = club.logo;
                    }, 500);
                    
                    // Store low quality initially
                    clubCache.logos[club.name] = lowQualityLogo;
                } catch (error) {
                    console.log(`Could not preload logo for ${club.name}`);
                }
            }
        }
        
        // Mark as initialized
        clubCache.initialized = true;
        clubCache.initializing = false;
        
        return clubsList;
    } catch (error) {
        console.error('Error initializing club data:', error);
        clubCache.initializing = false;
        return [];
    }
}

/**
 * Get club by name
 * @param {string} clubName - Name of the club to find
 * @returns {Object|null} - Club object or null if not found
 */
function getClub(clubName) {
    if (!clubCache.initialized) {
        console.warn('Club data not initialized. Call initializeClubData() first.');
        return null;
    }
    
    return clubCache.clubs.find(club => club.name === clubName) || null;
}

/**
 * Get club logo URL (uses cache when available)
 * @param {string} clubName - Name of the club
 * @returns {string} - URL to the club logo or default image
 */
function getClubLogo(clubName) {
    // Return from cache if available
    if (clubCache.logos[clubName]) {
        return clubCache.logos[clubName];
    }
    
    // Try to find in clubs list
    const club = getClub(clubName);
    if (club && club.logo) {
        // Cache for future use
        clubCache.logos[clubName] = club.logo;
        return club.logo;
    }
    
    // Default club logo path
    const defaultLogo = `assets/images/players/club/${clubName}.webp`;
    clubCache.logos[clubName] = defaultLogo; // Cache default path
    return defaultLogo;
}

/**
 * Create club dropdown HTML element with search functionality
 * @param {Object} options - Configuration options
 * @param {string} options.inputId - ID for the input field
 * @param {string} options.dropdownId - ID for the dropdown container
 * @param {Function} options.onSelect - Callback function when club is selected
 * @returns {HTMLElement} - The created dropdown element
 */
function createClubDropdown(options) {
    const { inputId, dropdownId, onSelect } = options;
    
    // Create container
    const container = document.createElement('div');
    container.className = 'club-dropdown';
    
    // Create input
    const input = document.createElement('input');
    input.type = 'text';
    input.id = inputId;
    input.className = 'club-search';
    input.placeholder = 'Search club...';
    
    // Create dropdown
    const dropdown = document.createElement('div');
    dropdown.className = 'club-options';
    dropdown.id = dropdownId;
    
    // Add input to container
    container.appendChild(input);
    container.appendChild(dropdown);
    
    // Add event listeners
    input.addEventListener('focus', async () => {
        // Initialize club data if needed
        if (!clubCache.initialized) {
            await initializeClubData();
        }
        
        // Show dropdown with all clubs
        populateClubOptions(dropdown, input, '', onSelect);
        dropdown.style.display = 'block';
    });
    
    input.addEventListener('input', async () => {
        // Initialize club data if needed
        if (!clubCache.initialized) {
            await initializeClubData();
        }
        
        // Filter clubs based on input
        populateClubOptions(dropdown, input, input.value, onSelect);
        dropdown.style.display = 'block';
    });
    
    input.addEventListener('blur', () => {
        // Hide dropdown after a short delay (allows clicking on options)
        setTimeout(() => {
            dropdown.style.display = 'none';
        }, 150);
    });
    
    return container;
}

/**
 * Populate club options in a dropdown
 * @param {HTMLElement} container - The dropdown container
 * @param {HTMLElement} inputElement - The input field
 * @param {string} searchTerm - Search term to filter clubs
 * @param {Function} onSelect - Callback when a club is selected
 */
function populateClubOptions(container, inputElement, searchTerm = '', onSelect = null) {
    // Clear the container
    container.innerHTML = '';
    
    // Use fragment for better performance
    const fragment = document.createDocumentFragment();
    const lowerSearchTerm = searchTerm.toLowerCase();
    
    // Initialize club data if needed
    if (!clubCache.initialized) {
        const loadingMsg = document.createElement('div');
        loadingMsg.className = 'club-option';
        loadingMsg.textContent = 'Loading clubs...';
        container.appendChild(loadingMsg);
        return;
    }
    
    // Filter clubs based on search term
    const filteredClubs = lowerSearchTerm 
        ? clubCache.clubs.filter(club => club.name.toLowerCase().includes(lowerSearchTerm))
        : clubCache.clubs;
    
    // Limit to maximum of 20 results to prevent UI lag
    const maxResults = Math.min(filteredClubs.length, 20);
    
    if (filteredClubs.length === 0) {
        const noResults = document.createElement('div');
        noResults.className = 'club-option';
        noResults.textContent = 'No clubs found';
        fragment.appendChild(noResults);
    } else {
        for (let i = 0; i < maxResults; i++) {
            const club = filteredClubs[i];
            const option = document.createElement('div');
            option.className = 'club-option';
            
            const logo = document.createElement('img');
            logo.className = 'club-logo';
            logo.src = getClubLogo(club.name);
            logo.alt = club.name;
            logo.loading = 'lazy';
            logo.onerror = function() {
                this.src = 'https://via.placeholder.com/20';
            };
            
            const name = document.createElement('span');
            name.textContent = club.name;
            
            option.appendChild(logo);
            option.appendChild(name);
            
            option.addEventListener('click', () => {
                inputElement.value = club.name;
                container.style.display = 'none';
                
                if (typeof onSelect === 'function') {
                    onSelect(club);
                }
            });
            
            fragment.appendChild(option);
        }
        
        // Add "more results" indicator if needed
        if (filteredClubs.length > maxResults) {
            const moreMessage = document.createElement('div');
            moreMessage.className = 'club-option';
            moreMessage.style.textAlign = 'center';
            moreMessage.style.color = '#aaa';
            moreMessage.textContent = `And ${filteredClubs.length - maxResults} more results...`;
            fragment.appendChild(moreMessage);
        }
    }
    
    // Append all elements at once
    container.appendChild(fragment);
}

// Initialize club data when script loads for faster access
initializeClubData();

// Export functions to window scope
window.ClubManager = {
    initialize: initializeClubData,
    getClub,
    getClubLogo,
    createClubDropdown,
    populateClubOptions
}; 