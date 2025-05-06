class ClubManager {
    constructor() {
        this.clubs = [];
        this.initialized = false;
        this.clubLogoPaths = {};
    }

    async initialize() {
        try {
            // First check if club-loader.js has already loaded club data
            if (typeof clubCache !== 'undefined' && clubCache.clubs && clubCache.clubs.length > 0) {
                console.log('Using cached club data from clubCache');
                this.clubs = clubCache.clubs;
                this.initialized = true;
                return;
            }

            // If club-loader data is not available, load player data and extract clubs
            console.log('Loading player data to extract clubs');
            const response = await fetch('players.json');
            const players = await response.json();

            // Extract unique clubs from player data
            const clubsSet = new Set();
            players.forEach(player => {
                if (player.club) {
                    clubsSet.add(player.club);
                }
            });

            // Convert to array of club objects
            this.clubs = Array.from(clubsSet).map(clubName => {
                return {
                    name: clubName,
                    logo: this.getClubLogoPath(clubName)
                };
            });

            // Sort clubs by name
            this.clubs.sort((a, b) => a.name.localeCompare(b.name));
            this.initialized = true;
            console.log(`Initialized ${this.clubs.length} clubs`);
        } catch (error) {
            console.error('Error initializing ClubManager:', error);
            this.clubs = [];
            this.initialized = false;
        }
    }

    /**
     * Get a club by name
     * @param {string} clubName - The name of the club to get
     * @returns {Object|null} - The club object, or null if not found
     */
    getClub(clubName) {
        if (!this.initialized) {
            console.warn('ClubManager not initialized. Call initialize() first.');
            return null;
        }
        
        if (!clubName) return null;
        
        // Case-insensitive search
        const clubNameLower = clubName.toLowerCase();
        const club = this.clubs.find(c => c.name.toLowerCase() === clubNameLower);
        
        if (club) {
            // Ensure the club has the latest logo path with fallback options
            club.logo = this.getClubLogoPath(club.name);
        }
        
        return club;
    }

    /**
     * Populates a dropdown with club options based on search term
     * @param {HTMLElement} container - The container to populate with options
     * @param {HTMLElement} inputElement - The input element that triggered the search
     * @param {string} searchTerm - The search term to filter clubs by
     * @param {Function} onSelect - Callback function when a club is selected
     */
    populateClubOptions(container, inputElement, searchTerm = '', onSelect) {
        if (!this.initialized) {
            console.warn('ClubManager not initialized. Call initialize() first.');
            return;
        }
        
        // Clear previous options
        container.innerHTML = '';
        
        // Filter clubs by search term
        const searchLower = searchTerm.toLowerCase();
        const filteredClubs = this.clubs.filter(club => 
            club.name.toLowerCase().includes(searchLower)
        );
        
        // Create a document fragment for better performance
        const fragment = document.createDocumentFragment();
        
        // Add club options to the container
        filteredClubs.forEach(club => {
            const option = document.createElement('div');
            option.className = 'club-option';
            
            const img = document.createElement('img');
            img.className = 'club-logo';
            
            // Get the potential logo paths for this club
            const logoPaths = this.clubLogoPaths[club.name] || [club.logo];
            let currentPathIndex = 0;
            
            // Set the initial logo path
            img.src = logoPaths[currentPathIndex];
            
            // Handle error by trying next path
            img.onerror = () => {
                currentPathIndex++;
                if (currentPathIndex < logoPaths.length) {
                    // Try next path
                    img.src = logoPaths[currentPathIndex];
                } else {
                    // Fall back to placeholder if all paths fail
                    img.src = 'https://via.placeholder.com/20';
                }
            };
            
            const span = document.createElement('span');
            span.textContent = club.name;
            
            option.appendChild(img);
            option.appendChild(span);
            
            // Add click event to select this club
            option.addEventListener('click', () => {
                if (typeof onSelect === 'function') {
                    onSelect(club);
                }
            });
            
            fragment.appendChild(option);
        });
        
        // Append all options at once for better performance
        container.appendChild(fragment);
        
        // Show or hide the container based on whether there are any filtered clubs
        container.style.display = filteredClubs.length > 0 ? 'block' : 'none';
    }

    /**
     * Get the club logo path with multiple fallback options
     * @param {string} clubName - The name of the club
     * @returns {string} - The path to the club logo
     */
    getClubLogoPath(clubName) {
        // Try multiple possible paths for the club logo
        const possiblePaths = [
            `assets/images/players/club/${clubName.replace(/\s+/g, '-').toLowerCase()}.webp`,
            `assets/images/players/club/${clubName}.webp`,
            `assets/images/club-logos/${clubName.replace(/\s+/g, '-').toLowerCase()}.webp`,
            `assets/images/club-logos/${clubName}.webp`
        ];
        
        // Return the best path available (in this web context, we can't check file existence directly)
        // but we can prepare for fallback through image onerror handlers
        this.clubLogoPaths = this.clubLogoPaths || {};
        
        // If we've already cached this club name, return the cached path
        if (this.clubLogoPaths[clubName]) {
            return this.clubLogoPaths[clubName];
        }
        
        // Store all possible paths for this club for later use in fallback logic
        this.clubLogoPaths[clubName] = possiblePaths;
        
        // Return the first option as the primary path
        return possiblePaths[0];
    }
}

// Initialize the global ClubManager instance
window.ClubManager = new ClubManager(); 