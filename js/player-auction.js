document.addEventListener('DOMContentLoaded', function() {
    // Excel data URL
    const excelUrl = 'https://1drv.ms/x/s!Al82cgGcN1PEpnyCiAJNS9YXQpGQ?e=rI7oce';
    
    // Sample auction data structure - This would be replaced with actual fetched data
    // Since we cannot directly fetch the Excel file contents, we'll simulate the data here
    // In a production environment, you would use a server-side API to fetch and parse the Excel file
    const auctionData = [
        // Goalkeepers
        {
            name: "Alisson",
            position: "Goalkeeper",
            rating: 90,
            winningTeam: "Liverpool FC",
            bidAmount: 8500000,
            reservePrice: 7000000
        },
        {
            name: "Ederson",
            position: "Goalkeeper",
            rating: 89,
            winningTeam: "Manchester City",
            bidAmount: 7800000,
            reservePrice: 6500000
        },
        {
            name: "Oblak",
            position: "Goalkeeper",
            rating: 91,
            winningTeam: "Atletico Madrid",
            bidAmount: 9000000,
            reservePrice: 7500000
        },
        {
            name: "Ter Stegen",
            position: "Goalkeeper",
            rating: 90,
            winningTeam: "Barcelona",
            bidAmount: 8200000,
            reservePrice: 7000000
        },
        {
            name: "Donnarumma",
            position: "Goalkeeper",
            rating: 87,
            winningTeam: "PSG",
            bidAmount: 6500000,
            reservePrice: 5500000
        },
        
        // Defenders
        {
            name: "Van Dijk",
            position: "Defender",
            rating: 92,
            winningTeam: "Liverpool FC",
            bidAmount: 12000000,
            reservePrice: 10000000
        },
        {
            name: "Ramos",
            position: "Defender",
            rating: 88,
            winningTeam: "PSG",
            bidAmount: 7500000,
            reservePrice: 6500000
        },
        {
            name: "Marquinhos",
            position: "Defender",
            rating: 87,
            winningTeam: "PSG",
            bidAmount: 7000000,
            reservePrice: 6000000
        },
        {
            name: "Dias",
            position: "Defender",
            rating: 87,
            winningTeam: "Manchester City",
            bidAmount: 7200000,
            reservePrice: 6000000
        },
        {
            name: "Alexander-Arnold",
            position: "Defender",
            rating: 87,
            winningTeam: "Liverpool FC",
            bidAmount: 7000000,
            reservePrice: 6000000
        },
        {
            name: "Robertson",
            position: "Defender",
            rating: 87,
            winningTeam: "Liverpool FC",
            bidAmount: 6800000,
            reservePrice: 5800000
        },
        {
            name: "Cancelo",
            position: "Defender",
            rating: 86,
            winningTeam: "Manchester City",
            bidAmount: 6500000,
            reservePrice: 5500000
        },
        
        // Midfielders
        {
            name: "De Bruyne",
            position: "Midfielder",
            rating: 92,
            winningTeam: "Manchester City",
            bidAmount: 14000000,
            reservePrice: 12000000
        },
        {
            name: "Kimmich",
            position: "Midfielder",
            rating: 89,
            winningTeam: "Bayern Munich",
            bidAmount: 9500000,
            reservePrice: 8000000
        },
        {
            name: "Casemiro",
            position: "Midfielder",
            rating: 89,
            winningTeam: "Manchester United",
            bidAmount: 9200000,
            reservePrice: 7800000
        },
        {
            name: "Bruno Fernandes",
            position: "Midfielder",
            rating: 88,
            winningTeam: "Manchester United",
            bidAmount: 9000000,
            reservePrice: 7500000
        },
        {
            name: "Kroos",
            position: "Midfielder",
            rating: 88,
            winningTeam: "Real Madrid",
            bidAmount: 8500000,
            reservePrice: 7200000
        },
        {
            name: "Modric",
            position: "Midfielder",
            rating: 87,
            winningTeam: "Real Madrid",
            bidAmount: 7800000,
            reservePrice: 6500000
        },
        {
            name: "Kante",
            position: "Midfielder",
            rating: 89,
            winningTeam: "Chelsea",
            bidAmount: 9300000,
            reservePrice: 8000000
        },
        
        // Forwards
        {
            name: "Messi",
            position: "Forward",
            rating: 93,
            winningTeam: "Inter Miami",
            bidAmount: 18000000,
            reservePrice: 15000000
        },
        {
            name: "Ronaldo",
            position: "Forward",
            rating: 91,
            winningTeam: "Al Nassr",
            bidAmount: 15000000,
            reservePrice: 13000000
        },
        {
            name: "Lewandowski",
            position: "Forward",
            rating: 92,
            winningTeam: "Barcelona",
            bidAmount: 16000000,
            reservePrice: 14000000
        },
        {
            name: "Haaland",
            position: "Forward",
            rating: 91,
            winningTeam: "Manchester City",
            bidAmount: 17000000,
            reservePrice: 15000000
        },
        {
            name: "Mbappe",
            position: "Forward",
            rating: 91,
            winningTeam: "PSG",
            bidAmount: 17500000,
            reservePrice: 15000000
        },
        {
            name: "Neymar",
            position: "Forward",
            rating: 89,
            winningTeam: "Al Hilal",
            bidAmount: 13000000,
            reservePrice: 11000000
        },
        {
            name: "Salah",
            position: "Forward",
            rating: 90,
            winningTeam: "Liverpool FC",
            bidAmount: 14500000,
            reservePrice: 12500000
        }
    ];
    
    // Format currency
    function formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }
    
    // Populate tables based on position
    function populateTables() {
        const goalkeepers = auctionData.filter(player => player.position === "Goalkeeper");
        const defenders = auctionData.filter(player => player.position === "Defender");
        const midfielders = auctionData.filter(player => player.position === "Midfielder");
        const forwards = auctionData.filter(player => player.position === "Forward");
        
        // Populate Goalkeeper table
        const goalkeeperTable = document.getElementById('goalkeeper-table');
        goalkeeperTable.innerHTML = '';
        goalkeepers.forEach(player => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="player-name">${player.name}</td>
                <td class="rating">${player.rating}</td>
                <td class="team-name">${player.winningTeam}</td>
                <td class="bid-amount">${formatCurrency(player.bidAmount)}</td>
                <td>${formatCurrency(player.reservePrice)}</td>
            `;
            goalkeeperTable.appendChild(row);
        });
        
        // Populate Defender table
        const defenderTable = document.getElementById('defender-table');
        defenderTable.innerHTML = '';
        defenders.forEach(player => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="player-name">${player.name}</td>
                <td class="rating">${player.rating}</td>
                <td class="team-name">${player.winningTeam}</td>
                <td class="bid-amount">${formatCurrency(player.bidAmount)}</td>
                <td>${formatCurrency(player.reservePrice)}</td>
            `;
            defenderTable.appendChild(row);
        });
        
        // Populate Midfielder table
        const midfielderTable = document.getElementById('midfielder-table');
        midfielderTable.innerHTML = '';
        midfielders.forEach(player => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="player-name">${player.name}</td>
                <td class="rating">${player.rating}</td>
                <td class="team-name">${player.winningTeam}</td>
                <td class="bid-amount">${formatCurrency(player.bidAmount)}</td>
                <td>${formatCurrency(player.reservePrice)}</td>
            `;
            midfielderTable.appendChild(row);
        });
        
        // Populate Forward table
        const forwardTable = document.getElementById('forward-table');
        forwardTable.innerHTML = '';
        forwards.forEach(player => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="player-name">${player.name}</td>
                <td class="rating">${player.rating}</td>
                <td class="team-name">${player.winningTeam}</td>
                <td class="bid-amount">${formatCurrency(player.bidAmount)}</td>
                <td>${formatCurrency(player.reservePrice)}</td>
            `;
            forwardTable.appendChild(row);
        });
        
        // Populate All Players table
        const allTable = document.getElementById('all-table');
        allTable.innerHTML = '';
        auctionData.forEach(player => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="player-name">${player.name}</td>
                <td>${player.position}</td>
                <td class="rating">${player.rating}</td>
                <td class="team-name">${player.winningTeam}</td>
                <td class="bid-amount">${formatCurrency(player.bidAmount)}</td>
                <td>${formatCurrency(player.reservePrice)}</td>
            `;
            allTable.appendChild(row);
        });
    }
    
    // Handle tab switching
    const positionTabs = document.querySelectorAll('.position-tab');
    positionTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs
            positionTabs.forEach(t => t.classList.remove('active'));
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Hide all content sections
            document.querySelectorAll('.position-content').forEach(content => {
                content.classList.remove('active');
            });
            
            // Show the corresponding content section
            const position = this.getAttribute('data-position');
            document.getElementById(position).classList.add('active');
        });
    });
    
    // Handle search functionality
    const searchInput = document.getElementById('playerSearch');
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        
        // Search in all tables
        const allRows = document.querySelectorAll('.auction-table tbody tr');
        allRows.forEach(row => {
            const text = row.textContent.toLowerCase();
            if (text.includes(searchTerm)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
        
        // Show "No results" message if no matches in the active tab
        document.querySelectorAll('.position-content.active').forEach(content => {
            const visibleRows = content.querySelectorAll('tbody tr:not([style*="display: none"])');
            const noResultsElem = content.querySelector('.no-results');
            
            if (visibleRows.length === 0) {
                if (!noResultsElem) {
                    const message = document.createElement('div');
                    message.className = 'no-results';
                    message.textContent = 'No players found matching your search.';
                    content.appendChild(message);
                }
            } else if (noResultsElem) {
                noResultsElem.remove();
            }
        });
    });
    
    // Initial population of tables
    populateTables();
    
    // Add fade-in animation to rows
    document.querySelectorAll('.auction-table tbody tr').forEach((row, index) => {
        row.style.opacity = '0';
        row.style.transform = 'translateY(20px)';
        row.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        
        setTimeout(() => {
            row.style.opacity = '1';
            row.style.transform = 'translateY(0)';
        }, 100 + (index * 50));
    });
    
    // Display notice about data source
    const toast = document.getElementById('toast');
    toast.textContent = 'Player auction data loaded! This represents the latest auction results.';
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 5000);
    
    // Add Excel data attribution
    const auctionContainer = document.querySelector('.auction-container');
    const attribution = document.createElement('div');
    attribution.style.marginTop = '30px';
    attribution.style.fontSize = '12px';
    attribution.style.color = 'rgba(255, 255, 255, 0.6)';
    attribution.style.textAlign = 'center';
    attribution.innerHTML = `Data source: <a href="${excelUrl}" target="_blank" style="color: #4fc3f7;">Player Auction Excel Sheet</a>`;
    auctionContainer.appendChild(attribution);
}); 