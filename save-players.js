const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

// Create HTTP server
const server = http.createServer((req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    // Save players data
    if (req.method === 'POST' && req.url === '/save-players') {
        let data = '';
        
        req.on('data', (chunk) => {
            data += chunk;
        });
        
        req.on('end', () => {
            try {
                // Validate JSON
                const players = JSON.parse(data);
                
                if (!Array.isArray(players)) {
                    throw new Error('Invalid data format: expected an array of players');
                }
                
                // Save to file
                fs.writeFileSync(path.join(__dirname, 'players.json'), data, 'utf8');
                
                // Send success response
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: true,
                    message: 'Player data saved successfully',
                    count: players.length
                }));
                
                console.log(`[${new Date().toISOString()}] Saved ${players.length} players to players.json`);
                
            } catch (error) {
                // Send error response
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: false,
                    message: error.message
                }));
                
                console.error(`[${new Date().toISOString()}] Error:`, error.message);
            }
        });
        
        return;
    }
    
    // Serve players.json
    if (req.method === 'GET' && req.url === '/players.json') {
        try {
            const filePath = path.join(__dirname, 'players.json');
            
            if (!fs.existsSync(filePath)) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: false,
                    message: 'Players data not found'
                }));
                return;
            }
            
            const data = fs.readFileSync(filePath, 'utf8');
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(data);
            
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: false,
                message: error.message
            }));
        }
        
        return;
    }
    
    // Handle 404
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
        success: false,
        message: 'Not found'
    }));
});

// Start server
server.listen(PORT, () => {
    console.log(`Player data server running at http://localhost:${PORT}`);
    console.log(`- POST /save-players: Save player data`);
    console.log(`- GET /players.json: Get player data`);
}); 