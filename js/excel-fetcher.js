/*  */// Excel Fetcher - Fetches data from OneDrive Excel file
// Uses SheetJS (xlsx) library to parse Excel files

/**
 * Converts OneDrive sharing link to embed/download URL
 * @param {string} shareUrl - OneDrive sharing URL
 * @returns {string} Embed URL for downloading
 */
function convertOneDriveUrl(shareUrl) {
    try {
        // Handle 1drv.ms shortened URLs - convert to embed API URL
        if (shareUrl.includes('1drv.ms')) {
            console.log('Detected 1drv.ms shortened URL - converting to embed API URL');
            
            // Extract the path after 1drv.ms
            // Format: https://1drv.ms/x/c/USERID/FILEID?e=CODE
            const url = new URL(shareUrl);
            const pathParts = url.pathname.split('/').filter(p => p);
            
            // pathParts: ['x', 'c', 'userid', 'fileid']
            if (pathParts.length >= 4) {
                const userId = pathParts[2];
                const fileId = pathParts[3];
                
                // Use OneDrive embed API which returns the actual file
                // This works better with CORS
                const embedUrl = `https://api.onedrive.com/v1.0/shares/u!${btoa('https://1drv.ms/x/c/' + userId + '/' + fileId).replace(/=/g, '')}/root/content`;
                console.log('Converted to embed API URL:', embedUrl);
                return embedUrl;
            }
        }
        
        // Handle full OneDrive URLs
        const url = new URL(shareUrl);
        const resid = url.searchParams.get('resid');
        
        if (resid) {
            const authkey = url.searchParams.get('authkey');
            
            if (authkey) {
                return `https://onedrive.live.com/download?resid=${resid}&authkey=${authkey}`;
            }
            
            return `https://onedrive.live.com/download?resid=${resid}`;
        }
    } catch (e) {
        console.warn('Could not parse URL:', e);
    }
    
    return shareUrl;
}

/**
 * Fetches Excel file from OneDrive and parses it
 * @param {string} oneDriveUrl - OneDrive sharing URL
 * @param {boolean} useCorsProxy - Whether to use CORS proxy
 * @returns {Promise<Object>} Parsed Excel data
 */
async function fetchExcelFromOneDrive(oneDriveUrl, useCorsProxy = false) {
    try {
        console.log('Fetching Excel file from OneDrive...');
        
        // Convert to download/embed URL
        const downloadUrl = convertOneDriveUrl(oneDriveUrl);
        console.log('Download URL:', downloadUrl);
        
        // Try direct first (OneDrive API should work without proxy)
        const fetchUrl = useCorsProxy 
            ? `https://corsproxy.io/?${encodeURIComponent(downloadUrl)}`
            : downloadUrl;
        
        console.log(`Trying ${useCorsProxy ? 'with CORS proxy' : 'direct OneDrive API'}...`);
        
        const response = await fetch(fetchUrl, {
            method: 'GET',
            cache: 'no-cache'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        // Get the file as array buffer
        const arrayBuffer = await response.arrayBuffer();
        console.log(`Downloaded ${arrayBuffer.byteLength} bytes`);
        
        // Verify it's actually an Excel file (should be > 10KB typically)
        if (arrayBuffer.byteLength < 5000) {
            console.warn('File size suspiciously small, might be HTML');
            // Try with CORS proxy if we haven't already
            if (!useCorsProxy) {
                console.log('Retrying with CORS proxy...');
                return fetchExcelFromOneDrive(oneDriveUrl, true);
            }
        }
        
        // Parse with SheetJS
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        
        console.log('Excel file loaded successfully');
        console.log('Available sheets:', workbook.SheetNames);
        
        return workbook;
    } catch (error) {
        console.error('Error fetching Excel file:', error);
        
        // Try with CORS proxy if direct failed
        if (!useCorsProxy) {
            console.log('Direct fetch failed, trying with CORS proxy...');
            return fetchExcelFromOneDrive(oneDriveUrl, true);
        }
        
        throw error;
    }
}

/**
 * Parses manager data from Excel workbook
 * @param {Object} workbook - SheetJS workbook object
 * @returns {Array} Array of manager objects
 */
function parseManagerData(workbook) {
    try {
        // Look for the "summary" sheet specifically
        let sheetName = 'summary';
        
        // Check if "summary" sheet exists (case-insensitive)
        const summarySheet = workbook.SheetNames.find(name => 
            name.toLowerCase() === 'summary'
        );
        
        if (summarySheet) {
            sheetName = summarySheet;
            console.log(`Found summary sheet: "${sheetName}"`);
        } else {
            // Fallback to first sheet if summary not found
            sheetName = workbook.SheetNames[0];
            console.warn(`"summary" sheet not found. Using first sheet: "${sheetName}"`);
            console.log('Available sheets:', workbook.SheetNames.join(', '));
        }
        
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
            header: 1,
            defval: '',
            blankrows: false
        });
        
        if (jsonData.length === 0) {
            console.warn('No data found in Excel sheet');
            return [];
        }
        
        // First row is headers
        const headers = jsonData[0];
        console.log('Excel headers:', headers);
        
        // Parse rows into manager objects
        const managers = [];
        for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i];
            
            // Skip empty rows
            if (!row || row.length === 0 || !row[0]) continue;
            
            // Create manager object based on Excel structure
            // Adjust these mappings based on your actual Excel columns
            const manager = {
                id: i,
                name: row[0] || '',
                age: row[1] || 0,
                club: row[2] || 'No Club',
                overall_rating: row[3] || 0,
                r2g_coin_balance: row[4] || 0,
                r2g_token_balance: row[5] || 0,
                club_total_value: row[6] || 0,
                star_rating: row[7] || 0,
                trophies: row[8] || 0,
                awards: row[9] || 0,
                performance: {
                    matches: row[10] || 0,
                    wins: row[11] || 0,
                    draws: row[12] || 0,
                    losses: row[13] || 0,
                    goals_scored: row[14] || 0,
                    goals_conceded: row[15] || 0,
                    goal_difference: row[16] || 0,
                    clean_sheets: row[17] || 0
                },
                squad: {
                    players: []
                },
                seasons: []
            };
            
            managers.push(manager);
        }
        
        console.log(`Parsed ${managers.length} managers from Excel`);
        return managers;
    } catch (error) {
        console.error('Error parsing manager data:', error);
        throw error;
    }
}

/**
 * Main function to get managers from OneDrive Excel
 * @param {string} oneDriveUrl - OneDrive sharing URL
 * @returns {Promise<Array>} Array of manager objects
 */
export async function getManagersFromExcel(oneDriveUrl) {
    try {
        const workbook = await fetchExcelFromOneDrive(oneDriveUrl);
        const managers = parseManagerData(workbook);
        return managers;
    } catch (error) {
        console.error('Error getting managers from Excel:', error);
        throw error;
    }
}

/**
 * Gets a specific manager by name from Excel
 * @param {string} oneDriveUrl - OneDrive sharing URL
 * @param {string} managerName - Name of the manager to find
 * @returns {Promise<Object>} Manager object
 */
export async function getManagerByNameFromExcel(oneDriveUrl, managerName) {
    try {
        const managers = await getManagersFromExcel(oneDriveUrl);
        const manager = managers.find(m => m.name.toLowerCase() === managerName.toLowerCase());
        
        if (!manager) {
            throw new Error(`Manager not found: ${managerName}`);
        }
        
        return manager;
    } catch (error) {
        console.error('Error getting manager by name from Excel:', error);
        throw error;
    }
}
