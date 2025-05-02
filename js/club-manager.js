class ClubManager {
    constructor() {
        this.clubs = [];
        this.initialized = false;
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
                    logo: `assets/images/players/club/${clubName.replace(/\s+/g, '-').toLowerCase()}.webp`
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

    getClub(clubName) {
        return this.clubs.find(club => club.name === clubName);
    }

    populateClubOptions(container, inputElement, searchTerm = '', onSelect = null) {
        // Clear existing options
        container.innerHTML = '';

        // Filter clubs based on search term
        const filteredClubs = this.clubs.filter(club => 
            club.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        // Create and append club options
        filteredClubs.forEach(club => {
            const option = document.createElement('div');
            option.className = 'club-option';
            option.innerHTML = `
                <img src="${club.logo}" alt="${club.name}" class="club-logo">
                <span>${club.name}</span>
            `;

            // Add click event
            option.addEventListener('click', () => {
                if (onSelect) {
                    onSelect(club);
                }
            });

            container.appendChild(option);
        });

        // Show/hide container based on results
        container.style.display = filteredClubs.length > 0 ? 'block' : 'none';
    }
}

// Initialize the global ClubManager instance
window.ClubManager = new ClubManager(); 