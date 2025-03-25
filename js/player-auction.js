// Google Sheets API URLs
const SHEET_ID = '1DO93v-xB2cPZn31-drgOggeVFgaH-0V0XLPjhfkB5Ek';
const POSITIONS = ['GK', 'CB', 'RB', 'LB', 'CM', 'DM', 'AM', 'ST', 'CF', 'RW', 'LW'];

// DOM Elements
let searchInput, positionTabs, tables, loadingOverlay, loadingMessage;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Initialize DOM elements
    initializeDOMElements();
    
    // Only proceed if required elements are found
    if (tables && tables.length > 0) {
        loadAllPositionData();
        setupEventListeners();
        
        // Set "all" as default position
        switchPosition('all');
    } else {
        console.error('Required DOM elements not found. Please check HTML structure.');
    }
});

// Initialize DOM elements with error checking
function initializeDOMElements() {
    // Create loading overlay and message if they don't exist
    if (!document.getElementById('loadingOverlay')) {
        const overlay = document.createElement('div');
        overlay.id = 'loadingOverlay';
        overlay.style.cssText = 'display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index:1000;';
        document.body.appendChild(overlay);
    }
    
    if (!document.getElementById('loadingMessage')) {
        const message = document.createElement('div');
        message.id = 'loadingMessage';
        message.style.cssText = 'position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); background:white; padding:20px; border-radius:5px; z-index:1001;';
        document.getElementById('loadingOverlay').appendChild(message);
    }

    // Initialize DOM elements
    searchInput = document.getElementById('playerSearch');
    positionTabs = document.querySelectorAll('.position-tab');
    tables = document.querySelectorAll('.auction-table');
    loadingOverlay = document.getElementById('loadingOverlay');
    loadingMessage = document.getElementById('loadingMessage');

    // Log initialization status
    console.log('DOM Elements initialized:', {
        searchInput: !!searchInput,
        positionTabs: positionTabs.length,
        tables: tables.length,
        loadingOverlay: !!loadingOverlay,
        loadingMessage: !!loadingMessage
    });
}

// Event Listeners
function setupEventListeners() {
    // Search functionality
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            filterPlayers(searchTerm);
        });
    }

    // Position tab switching
    if (positionTabs.length > 0) {
        positionTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const position = tab.dataset.position;
                switchPosition(position);
            });
        });
    }
}

// Cache for sheet data
const sheetCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Load data from all position sheets
async function loadAllPositionData() {
    showLoading('Fetching player data...');
    try {
        const fetchPromises = POSITIONS.map(position => fetchPositionData(position));
        const results = await Promise.allSettled(fetchPromises);
        
        const allPlayers = [];
        const errors = [];

        results.forEach((result, index) => {
            if (result.status === 'fulfilled') {
                allPlayers.push(...result.value);
            } else {
                errors.push(`Error loading ${POSITIONS[index]} data: ${result.reason}`);
                console.error(`Error loading ${POSITIONS[index]} data:`, result.reason);
            }
        });

        if (allPlayers.length > 0) {
            populateTables(allPlayers);
            showSuccess(`Loaded ${allPlayers.length} players successfully!`);
        } else {
            throw new Error('No data loaded');
        }

        if (errors.length > 0) {
            console.warn('Some sheets failed to load:', errors);
        }
        
        hideLoading();
    } catch (error) {
        console.error('Error loading auction data:', error);
        showError('Failed to load auction data. Please make sure the Google Sheet is publicly accessible.');
        populateTables(sampleData);
    }
}

// Fetch data for a single position with caching
async function fetchPositionData(position) {
    // Check cache first
    const cachedData = sheetCache.get(position);
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
        console.log(`Using cached data for ${position}`);
        return cachedData.data;
    }

    const sheetURL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${position}&headers=1`;
    
    try {
        const response = await fetch(sheetURL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const text = await response.text();
        const jsonText = text
            .replace(/^[^{]*{/, '{')
            .replace(/}[^}]*$/, '}');
        
        const data = JSON.parse(jsonText);
        
        if (!data?.table?.rows) {
            throw new Error('Invalid data structure');
        }

        const players = processSheetData(data, position);
        
        // Cache the processed data
        sheetCache.set(position, {
            data: players,
            timestamp: Date.now()
        });

        return players;
    } catch (error) {
        console.error(`Error fetching ${position} data:`, error);
        throw error;
    }
}

// Optimized data processing
function processSheetData(data, sheetPosition) {
    if (!data?.table?.rows?.length) return [];

    return data.table.rows.slice(1)
        .map(row => {
            if (!row.c) return null;
            
            const values = row.c.map(cell => cell?.v ?? '');
            
            // Early return for invalid rows
            if (!values[1]?.trim()) return null;
            
            return {
                name: String(values[1]).trim(),
                position: sheetPosition,
                team: String(values[2] || '').trim(),
                rating: parseInt(values[3]) || 0,
                bidAmount: parseInt(values[4]) || 0,
                rowId: String(values[5] || '').trim(),
                contract: String(values[6] || '').trim(),
                reservePrice: parseInt(values[3]) || 0
            };
        })
        .filter(Boolean);
}

// Convert base value to star rating
function getPlayerValue(baseValue) {
    switch (baseValue) {
        case 100:
            return '5★ Legend';
        case 80:
            return '5★ Standard';
        case 60:
            return '4★ Legend';
        case 50:
            return '4★ Standard';
        case 40:
            return '3★ Standard';
        default:
            return 'Unknown';
    }
}

// Format currency values
function formatCurrency(value) {
    if (!value) return '';
    return value.toLocaleString('en-US', {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });
}

// Create player row
function createPlayerRow(player) {
    const row = document.createElement('tr');
    const ratingClass = getRatingClass(player.rating);
    row.classList.add(ratingClass);
    row.innerHTML = `
        <td class="player-name">${player.name}</td>
        <td class="base-value">${player.rating}</td>
        <td class="value">${getPlayerValue(player.rating)}</td>
        <td class="team-name">${player.team || 'Unsold'}</td>
        <td class="bid-amount">${formatCurrency(player.bidAmount) || 'Not Bid'}</td>
        <td>${player.contract || 'N/A'}</td>
    `;
    return row;
}

// Get rating-specific class
function getRatingClass(baseValue) {
    switch (baseValue) {
        case 100:
            return 'five-star-legend';
        case 80:
            return 'five-star-standard';
        case 60:
            return 'four-star-legend';
        case 50:
            return 'four-star-standard';
        case 40:
            return 'three-star-standard';
        default:
            return 'unknown-rating';
    }
}

// Create player row for the "all" table
function createAllPlayersRow(player) {
    const row = document.createElement('tr');
    const ratingClass = getRatingClass(player.rating);
    row.classList.add(ratingClass);
    row.innerHTML = `
        <td class="player-name">${player.name}</td>
        <td>${player.position}</td>
        <td class="base-value">${player.rating}</td>
        <td class="value">${getPlayerValue(player.rating)}</td>
        <td class="team-name">${player.team || 'Unsold'}</td>
        <td class="bid-amount">${formatCurrency(player.bidAmount) || 'Not Bid'}</td>
        <td>${player.contract || 'N/A'}</td>
    `;
    return row;
}

// Populate tables with player data
function populateTables(players) {
    if (!players || players.length === 0) {
        console.warn('No player data provided');
        return;
    }

    console.log(`Populating tables with ${players.length} players`);
    
    // Reset all tables
    document.querySelectorAll('.auction-table tbody').forEach(tbody => {
        tbody.innerHTML = '';
    });

    // Group by position
    const playersByPosition = {};
    const allPlayers = [];
    
    POSITIONS.forEach(pos => {
        playersByPosition[pos] = [];
    });

    players.forEach(player => {
        const normalized = mapPosition(player.position);
        
        if (playersByPosition[normalized]) {
            playersByPosition[normalized].push(player);
            allPlayers.push(player);
        } else {
            console.warn(`Unknown position: ${player.position}`);
        }
    });

    // Populate position tables
    POSITIONS.forEach(position => {
        const tableId = `${position}-table`;
        const tableBody = document.getElementById(tableId);
        
        if (!tableBody) {
            console.warn(`Table body ${tableId} not found`);
            return;
        }
        
        const positionPlayers = playersByPosition[position] || [];
        
        if (positionPlayers.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="6" class="no-results">No ${position} players available</td></tr>`;
        } else {
            positionPlayers.forEach(player => {
                const row = createPlayerRow(player);
                tableBody.appendChild(row);
            });
        }
    });

    // Populate "all players" table
    const allTableBody = document.getElementById('all-table');
    if (allTableBody) {
        if (allPlayers.length === 0) {
            allTableBody.innerHTML = '<tr><td colspan="7" class="no-results">No players available</td></tr>';
        } else {
            allPlayers.forEach(player => {
                const row = createAllPlayersRow(player);
                allTableBody.appendChild(row);
            });
        }
    } else {
        console.warn('All players table body not found');
    }
    
    // Update UI states
    updateBidAmountColors();
}

// Map position names (for handling possible variations)
function mapPosition(sheetPosition) {
    // Normalize position name to upper case
    const pos = String(sheetPosition).toUpperCase().trim();
    
    // Direct matches
    if (POSITIONS.includes(pos)) {
        return pos;
    }
    
    // Handle variations
    if (pos.includes('GOALKEEPER') || pos === 'G' || pos === 'GOALIE') return 'GK';
    if (pos.includes('CENTER BACK') || pos === 'CD' || pos === 'DC') return 'CB';
    if (pos.includes('LEFT BACK') || pos === 'LWB' || pos === 'LD') return 'LB';
    if (pos.includes('RIGHT BACK') || pos === 'RWB' || pos === 'RD') return 'RB';
    if (pos.includes('CENTER MID') || pos === 'CMF' || pos === 'MC') return 'CM';
    if (pos.includes('DEFENSIVE MID') || pos === 'CDM' || pos === 'DMF') return 'DM';
    if (pos.includes('ATTACKING MID') || pos === 'CAM' || pos === 'AMF') return 'AM';
    if (pos.includes('STRIKER') || pos === 'FW') return 'ST';
    if (pos.includes('CENTER FORWARD') || pos === 'CF') return 'CF';
    if (pos.includes('RIGHT WING') || pos === 'RM' || pos === 'RMF') return 'RW';
    if (pos.includes('LEFT WING') || pos === 'LM' || pos === 'LMF') return 'LW';
    
    // Default to first position if no match (should handle properly)
    console.warn(`Unknown position "${sheetPosition}" - defaulting to ${POSITIONS[0]}`);
    return POSITIONS[0];
}

// Filter players based on search term
function filterPlayers(searchTerm) {
    const tables = document.querySelectorAll('.auction-table');
    
    tables.forEach(table => {
        const rows = table.querySelectorAll('tbody tr');
        
        if (rows.length === 0) return;
        
        let visibleCount = 0;
        
        rows.forEach(row => {
            // Skip "no results" rows
            if (row.querySelector('.no-results')) return;
            
            const text = row.textContent.toLowerCase();
            const match = text.includes(searchTerm);
            
            row.style.display = match ? '' : 'none';
            
            if (match) visibleCount++;
        });
        
        // Show no results message if needed
        const tbody = table.querySelector('tbody');
        const position = table.dataset.position;
        
        // Remove existing no-results row if it exists
        const existingNoResults = tbody.querySelector('.no-results-row');
        if (existingNoResults) {
            tbody.removeChild(existingNoResults);
        }
        
        // Add no-results row if needed
        if (visibleCount === 0 && searchTerm) {
            const noResultsRow = document.createElement('tr');
            noResultsRow.classList.add('no-results-row');
            const colspan = position === 'all' ? 7 : 6;
            noResultsRow.innerHTML = `<td colspan="${colspan}" class="no-results">No players matching "${searchTerm}"</td>`;
            tbody.appendChild(noResultsRow);
        }
    });
}

// Switch between position tabs
function switchPosition(position) {
    // Update active tab
    positionTabs.forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.position === position) {
            tab.classList.add('active');
        }
    });

    // Show/hide content sections
    document.querySelectorAll('.position-content').forEach(content => {
        if (position === 'all') {
            // When switching to "all", show only the all-players table
            content.style.display = content.id === 'all' ? 'block' : 'none';
        } else {
            // When switching to a specific position, show only that position's table
            content.style.display = content.id === position ? 'block' : 'none';
        }
    });
}

// Loading state management
function showLoading(message) {
    if (loadingMessage && loadingOverlay) {
        loadingMessage.textContent = message;
        loadingOverlay.style.display = 'flex';
    } else {
        console.log('Loading:', message);
    }
}

function hideLoading() {
    if (loadingOverlay) {
        loadingOverlay.style.display = 'none';
    }
}

function showError(message) {
    if (loadingMessage && loadingOverlay) {
        loadingMessage.textContent = message;
        loadingMessage.style.color = '#ff4444';
        setTimeout(hideLoading, 3000);
    }
    console.error('Error:', message);
}

function showSuccess(message) {
    if (loadingMessage && loadingOverlay) {
        loadingMessage.textContent = message;
        loadingMessage.style.color = '#4CAF50';
        setTimeout(hideLoading, 2000);
    }
    console.log('Success:', message);
}

// Add CSS styles for player ratings and enhanced UI/UX
const style = document.createElement('style');
style.textContent = `
    /* Table Container Styling */
    .auction-table-container {
        background: rgba(0, 0, 0, 0.4);
        border-radius: 15px;
        padding: 20px;
        margin: 20px 0;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
    }

    /* Table Styling */
    .auction-table {
        width: 100%;
        border-collapse: separate;
        border-spacing: 0 8px;
        margin-top: -8px;
    }

    .auction-table thead th {
        padding: 15px 20px;
        font-size: 14px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 1px;
        background: linear-gradient(45deg, rgba(41, 51, 92, 0.9), rgba(31, 41, 82, 0.9));
        border-bottom: 2px solid rgba(255, 255, 255, 0.1);
        position: sticky;
        top: 0;
        z-index: 10;
    }

    .auction-table tbody tr {
        transition: all 0.3s ease;
        margin-bottom: 8px;
        border-radius: 8px;
        overflow: hidden;
    }

    .auction-table td {
        padding: 15px 20px;
        font-size: 14px;
        transition: all 0.3s ease;
    }

    /* Position Tabs Styling */
    .position-tabs {
        display: flex;
        flex-wrap: nowrap;
        gap: 10px;
        padding: 20px 0;
        overflow-x: auto;
        scrollbar-width: thin;
        scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
    }

    .position-tabs::-webkit-scrollbar {
        height: 6px;
    }

    .position-tabs::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.2);
        border-radius: 3px;
    }

    .position-tabs::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.2);
        border-radius: 3px;
    }

    .position-tab {
        padding: 12px 24px;
        border-radius: 25px;
        background: linear-gradient(45deg, rgba(41, 51, 92, 0.7), rgba(31, 41, 82, 0.7));
        color: rgba(255, 255, 255, 0.7);
        border: 1px solid rgba(255, 255, 255, 0.1);
        cursor: pointer;
        transition: all 0.3s ease;
        font-weight: 600;
        letter-spacing: 0.5px;
        min-width: fit-content;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .position-tab:hover {
        background: linear-gradient(45deg, rgba(61, 71, 112, 0.8), rgba(51, 61, 102, 0.8));
        color: white;
        transform: translateY(-2px);
    }

    .position-tab.active {
        background: linear-gradient(45deg, rgba(81, 91, 172, 0.9), rgba(71, 81, 162, 0.9));
        color: white;
        box-shadow: 0 6px 16px rgba(81, 91, 172, 0.3);
    }

    /* Search Input Styling */
    .search-container {
        position: relative;
        margin: 20px 0;
    }

    .search-input {
        width: 100%;
        padding: 15px 45px;
        border-radius: 30px;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        color: white;
        font-size: 16px;
        transition: all 0.3s ease;
        backdrop-filter: blur(5px);
    }

    .search-input:focus {
        background: rgba(255, 255, 255, 0.15);
        border-color: rgba(255, 255, 255, 0.3);
        box-shadow: 0 0 20px rgba(255, 255, 255, 0.1);
        outline: none;
    }

    .search-input::placeholder {
        color: rgba(255, 255, 255, 0.5);
    }

    /* Five Star Legend Players */
    .auction-table tr.five-star-legend {
        background: linear-gradient(to right, rgba(255, 215, 0, 0.15), rgba(255, 215, 0, 0.05));
        box-shadow: 0 4px 15px rgba(255, 215, 0, 0.1);
    }
    .auction-table tr.five-star-legend .player-name {
        color: #FFD700;
        font-weight: 700;
        text-shadow: 0 0 5px rgba(255, 215, 0, 0.3);
    }
    .auction-table tr.five-star-legend .value {
        color: #FFD700;
        font-weight: 700;
    }
    .auction-table tr.five-star-legend .base-value {
        color: #FFD700;
        font-weight: 700;
    }

    /* Five Star Standard Players */
    .auction-table tr.five-star-standard {
        background: linear-gradient(to right, rgba(224, 224, 224, 0.15), rgba(224, 224, 224, 0.05));
        box-shadow: 0 4px 15px rgba(224, 224, 224, 0.1);
    }
    .auction-table tr.five-star-standard .player-name {
        color: #E0E0E0;
        font-weight: 600;
    }
    .auction-table tr.five-star-standard .value {
        color: #E0E0E0;
        font-weight: 600;
    }
    .auction-table tr.five-star-standard .base-value {
        color: #E0E0E0;
        font-weight: 600;
    }

    /* Four Star Legend Players */
    .auction-table tr.four-star-legend {
        background: linear-gradient(to right, rgba(218, 165, 32, 0.15), rgba(218, 165, 32, 0.05));
        box-shadow: 0 4px 15px rgba(218, 165, 32, 0.1);
    }
    .auction-table tr.four-star-legend .player-name {
        color: #DAA520;
        font-weight: 600;
    }
    .auction-table tr.four-star-legend .value {
        color: #DAA520;
        font-weight: 600;
    }
    .auction-table tr.four-star-legend .base-value {
        color: #DAA520;
        font-weight: 600;
    }

    /* Four Star Standard Players */
    .auction-table tr.four-star-standard {
        background: linear-gradient(to right, rgba(176, 196, 222, 0.15), rgba(176, 196, 222, 0.05));
        box-shadow: 0 4px 15px rgba(176, 196, 222, 0.1);
    }
    .auction-table tr.four-star-standard .player-name {
        color: #B0C4DE;
        font-weight: 500;
    }
    .auction-table tr.four-star-standard .value {
        color: #B0C4DE;
        font-weight: 500;
    }
    .auction-table tr.four-star-standard .base-value {
        color: #B0C4DE;
        font-weight: 500;
    }

    /* Three Star Standard Players */
    .auction-table tr.three-star-standard {
        background: linear-gradient(to right, rgba(205, 127, 50, 0.15), rgba(205, 127, 50, 0.05));
        box-shadow: 0 4px 15px rgba(205, 127, 50, 0.1);
    }
    .auction-table tr.three-star-standard .player-name {
        color: #CD7F32;
        font-weight: 500;
    }
    .auction-table tr.three-star-standard .value {
        color: #CD7F32;
        font-weight: 500;
    }
    .auction-table tr.three-star-standard .base-value {
        color: #CD7F32;
        font-weight: 500;
    }

    /* Team and Bid Amount colors */
    .auction-table .team-name {
        color: #4fc3f7;
        font-weight: 500;
    }
    .auction-table .bid-amount {
        color: #4caf50;
        font-weight: 600;
    }

    /* Animation Classes */
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }

    .position-content {
        display: none;
        animation: fadeIn 0.4s ease-out;
    }

    .position-content.active {
        display: block;
    }

    /* Loading Animation */
    #loadingOverlay {
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(5px);
    }

    #loadingMessage {
        background: rgba(255, 255, 255, 0.1);
        color: white;
        border-radius: 10px;
        padding: 20px 40px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
    }

    /* Hover Effects */
    .auction-table tr:hover {
        transform: translateY(-3px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
    }

    /* Responsive Design */
    @media (max-width: 768px) {
        .auction-table td, .auction-table th {
            padding: 12px 15px;
            font-size: 13px;
        }

        .position-tab {
            padding: 10px 20px;
            font-size: 13px;
        }

        .search-input {
            padding: 12px 35px;
            font-size: 14px;
        }
    }

    @media (max-width: 480px) {
        .auction-table td, .auction-table th {
            padding: 10px 12px;
            font-size: 12px;
        }

        .position-tab {
            padding: 8px 16px;
            font-size: 12px;
        }
    }
`;
document.head.appendChild(style);

// Sample data (fallback)
const sampleData = [
    {
        name: "VITOR BAIA",
        position: "GK",
        rating: 100,
        team: "RANGERS FC",
        bidAmount: 100,
        contract: "SEASON 7",
        reservePrice: 100,
        rowId: "1"
    },
    {
        name: "GIANLUIGI BUFFON",
        position: "GK",
        rating: 100,
        team: "LOSC LILLE",
        bidAmount: 160,
        contract: "SEASON 7",
        reservePrice: 100,
        rowId: "2"
    }
];

// Add search icon to search input
function enhanceSearchInput() {
    const searchContainer = document.querySelector('.search-container');
    if (searchContainer) {
        const searchIcon = document.createElement('i');
        searchIcon.className = 'fas fa-search';
        searchIcon.style.cssText = `
            position: absolute;
            left: 20px;
            top: 50%;
            transform: translateY(-50%);
            color: rgba(255, 255, 255, 0.5);
        `;
        searchContainer.appendChild(searchIcon);
    }
}

// Initialize enhancements
document.addEventListener('DOMContentLoaded', () => {
    enhanceSearchInput();
});

// Update bid amount colors based on value
function updateBidAmountColors() {
    document.querySelectorAll('.auction-table tbody tr').forEach(row => {
        const bidCell = row.querySelector('.bid-amount');
        const baseValueCell = row.querySelector('.base-value');
        
        if (!bidCell || !baseValueCell) return;
        
        const bidText = bidCell.textContent.trim();
        
        // Skip non-numeric values
        if (bidText === 'Not Bid' || bidText === 'N/A') return;
        
        // Parse values (handle both formatted and unformatted values)
        const bidAmount = parseInt(bidText.replace(/,/g, ''));
        const baseValue = parseInt(baseValueCell.textContent.trim());
        
        if (isNaN(bidAmount) || isNaN(baseValue)) return;
        
        // Remove existing color classes
        bidCell.classList.remove('high-bid', 'medium-bid', 'low-bid');
        
        // Add color class based on bid amount relative to base value
        if (bidAmount >= baseValue * 1.5) {
            bidCell.classList.add('high-bid');
            bidCell.style.color = '#e74c3c'; // Red for high bids
        } else if (bidAmount >= baseValue * 1.2) {
            bidCell.classList.add('medium-bid');
            bidCell.style.color = '#f39c12'; // Orange for medium bids
        } else if (bidAmount >= baseValue) {
            bidCell.classList.add('low-bid');
            bidCell.style.color = '#4caf50'; // Green for low bids
        }
    });
}

// Call the function when the page loads
document.addEventListener('DOMContentLoaded', () => {
    updateBidAmountColors();
    
    // Update colors when switching between position tabs
    const positionTabs = document.querySelectorAll('.position-tab');
    positionTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            setTimeout(updateBidAmountColors, 100); // Small delay to ensure content is updated
        });
    });
    
    // Update colors when searching
    const searchInput = document.getElementById('playerSearch');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            setTimeout(updateBidAmountColors, 100);
        });
    }
}); 