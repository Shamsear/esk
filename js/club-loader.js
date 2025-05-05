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
 * Normalize club name to match file naming conventions
 * @param {string} clubName - Original club name
 * @returns {string} - Normalized club name for file paths
 */
function normalizeClubName(clubName) {
    if (!clubName) return '';
    
    // Map for common club name variations that have issues
    const clubNameMap = {
        'BORSUSIA DORTMUND': 'Borussia Dortmund',
        'CHELSEA FC(LOAN)': 'Chelsea FC',
        'FREE AGENT': 'FREE AGENT',
        'FREE AGENTP': 'FREE AGENT',
        'INTER MIMAI': 'Inter Miami',
        'MANCEHESTER CITY': 'Manchester City FC',
        'MANCHERSTER CITY': 'Manchester City FC',
        'MANCHESTER CITY': 'Manchester City FC',
        'MANCHESTER UNITED': 'Manchester United FC',
        'MANCHESTER UNITED(LOAN)': 'Manchester United FC',
        'MUMBAI CITY FC(LOAN)': 'Mumbai City FC',
        'TOTTENHAM HOTSPUR': 'Tottenham Hotspur FC',
        // Additional mappings for other potentially problematic club names
        'AC MILAN': 'AC Milan',
        'ARSENAL': 'Arsenal FC',
        'ARSENAL FC': 'Arsenal FC',
        'ATLETICO MADRID': 'Atletico de Madrid',
        'BARCELONA': 'FC Barcelona',
        'BAYERN MUNICH': 'FC Bayern Munich',
        'CHELSEA': 'Chelsea FC',
        'DORTMUND': 'Borussia Dortmund',
        'INTER': 'Inter Milan',
        'JUVENTUS': 'Juventus',
        'LIVERPOOL': 'Liverpool FC',
        'MAN CITY': 'Manchester City FC',
        'MAN UTD': 'Manchester United FC',
        'PSG': 'Paris Saint-Germain FC',
        'REAL MADRID': 'Real Madrid CF',
        'SPURS': 'Tottenham Hotspur FC',
        'TOTTENHAM': 'Tottenham Hotspur FC'
    };
    
    // Check if we have a direct mapping
    if (clubNameMap[clubName]) {
        return clubNameMap[clubName];
    }
    
    return clubName;
}

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
                const normalizedClubName = normalizeClubName(player.club);
                clubsList.push({
                    name: player.club,
                    normalizedName: normalizedClubName,
                    logo: player.clubLogo || `assets/images/players/club/${normalizedClubName}.webp`
                });
            }
        });
        
        // Then add teams from player stats
        playersData.forEach(player => {
            if (player.stats && Array.isArray(player.stats)) {
                player.stats.forEach(stat => {
                    if (stat.team && !clubsSet.has(stat.team)) {
                        clubsSet.add(stat.team);
                        const normalizedClubName = normalizeClubName(stat.team);
                        clubsList.push({
                            name: stat.team,
                            normalizedName: normalizedClubName,
                            logo: `assets/images/players/club/${normalizedClubName}.webp`
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
                    
                    // Handle loading errors for low quality logo
                    img.onerror = function() {
                        console.log(`Could not load low quality logo for ${club.name}, trying original`);
                        // If low quality fails, try original directly
                        clubCache.logos[club.name] = club.logo;
                    };
                    
                    img.src = lowQualityLogo;
                    
                    // Set a timeout to use high quality after 500ms
                    setTimeout(() => {
                        const highQualityImg = new Image();
                        highQualityImg.src = club.logo;
                        // Only update if load is successful
                        highQualityImg.onload = () => {
                            clubCache.logos[club.name] = club.logo;
                        };
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
    
    // Special case for FREE AGENT
    if (clubName === 'FREE AGENT' || clubName === 'FREE AGENTP') {
        const svgPath = 'assets/images/players/club/FREE AGENT.svg';
        clubCache.logos[clubName] = svgPath;
        return svgPath;
    }
    
    // Try to find in clubs list
    const club = getClub(clubName);
    if (club && club.logo) {
        // Cache for future use
        clubCache.logos[clubName] = club.logo;
        return club.logo;
    }
    
    // Try with normalized name if direct lookup fails
    const normalizedName = normalizeClubName(clubName);
    if (normalizedName !== clubName) {
        // First try the high-quality version
        const highQualityPath = `assets/images/players/club/${normalizedName}.webp`;
        
        // For cache purposes, store the high-quality path
        // The actual image loading error handling is done in the UI components
        clubCache.logos[clubName] = highQualityPath;
        return highQualityPath;
    }
    
    // Default club logo path as last resort
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
    
    // Track if mouse is in the dropdown
    let mouseInDropdown = false;
    
    dropdown.addEventListener('mouseenter', () => {
        mouseInDropdown = true;
    });
    
    dropdown.addEventListener('mouseleave', () => {
        mouseInDropdown = false;
    });
    
    input.addEventListener('blur', () => {
        // Hide dropdown after a longer delay (500ms instead of 150ms)
        // This gives more time to select an option and prevents accidental closures
        setTimeout(() => {
            if (!mouseInDropdown) { // Only close if mouse is not in dropdown
                dropdown.style.display = 'none';
            }
        }, 500);
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
    
    if (filteredClubs.length === 0) {
        const noResults = document.createElement('div');
        noResults.className = 'club-option';
        noResults.textContent = 'No clubs found';
        fragment.appendChild(noResults);
    } else {
        // Show all filtered clubs without limit
        filteredClubs.forEach(club => {
            const option = document.createElement('div');
            option.className = 'club-option';
            
            // Mark as selected if it matches the current input value
            if (inputElement.value === club.name) {
                option.classList.add('active');
            }
            
            const logo = document.createElement('img');
            logo.className = 'club-logo';
            
            // Handle FREE AGENT specially since we know it has SVG and WEBP formats
            if (club.name === 'FREE AGENT' || club.name === 'FREE AGENTP') {
                logo.src = 'assets/images/players/club/FREE AGENT.svg';
                logo.onerror = function() {
                    this.src = 'assets/images/players/club/freeagent.WEBP';
                    this.onerror = function() {
                        this.src = 'https://via.placeholder.com/20';
                    };
                };
            } else {
                logo.src = getClubLogo(club.name);
                logo.onerror = function() {
                    // Try with the normalized name directly
                    const normalizedName = normalizeClubName(club.name);
                    if (normalizedName !== club.name) {
                        this.src = `assets/images/players/club/${normalizedName}.webp`;
                        this.onerror = function() {
                            // Try the low quality version as last resort
                            this.src = `assets/images/players/club/${normalizedName}-low.webp`;
                            this.onerror = function() {
                                this.src = 'https://via.placeholder.com/20';
                            };
                        };
                        return;
                    }
                    this.src = 'https://via.placeholder.com/20';
                };
            }
            
            logo.alt = club.name;
            logo.loading = 'lazy';
            
            const name = document.createElement('span');
            name.textContent = club.name;
            
            option.appendChild(logo);
            option.appendChild(name);
            
            // Improved click handling with mouse events
            option.addEventListener('mousedown', (e) => {
                e.preventDefault(); // Prevent blur on the input
                
                // Remove active class from all options
                container.querySelectorAll('.club-option').forEach(opt => {
                    opt.classList.remove('active');
                });
                
                // Add active class to selected option
                option.classList.add('active');
                
                // Set input value
                inputElement.value = club.name;
                
                // Keep dropdown open until mouseup
                e.stopPropagation();
            });
            
            option.addEventListener('mouseup', () => {
                // Only close dropdown and trigger callback on mouseup
                container.style.display = 'none';
                
                if (typeof onSelect === 'function') {
                    onSelect(club);
                }
            });
            
            fragment.appendChild(option);
        });
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
    populateClubOptions,
    normalizeClubName // Expose the normalizeClubName function
}; 