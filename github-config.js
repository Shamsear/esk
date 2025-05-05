/**
 * Standardized GitHub configuration for R2G Admin panels
 * This file provides consistent GitHub integration functionality
 * for player-admin.html, admin-stats.html, and transfer-admin.html
 */

// GitHub configuration object
window.githubConfig = {
    isConfigured: function() {
        return !!localStorage.getItem('githubToken');
    },
    getToken: function() {
        return localStorage.getItem('githubToken');
    },
    getOwner: function() {
        return localStorage.getItem('githubOwner') || 'default-owner';
    },
    getRepo: function() {
        return localStorage.getItem('githubRepo') || 'default-repo';
    },
    getBranch: function() {
        return localStorage.getItem('githubBranch') || 'main';
    },
    filePath: 'players.json',
    managerFilePath: 'manager_data.json',
    
    // API helper methods
    getApiHeaders: function() {
        return {
            'Authorization': `Bearer ${this.getToken()}`,
            'Accept': 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28'
        };
    },
    
    makeApiRequest: async function(endpoint, options = {}) {
        if (!this.isConfigured()) {
            throw new Error('GitHub is not configured');
        }
        
        const url = `https://api.github.com${endpoint}`;
        const defaultOptions = {
            headers: this.getApiHeaders()
        };
        
        const response = await fetch(url, { ...defaultOptions, ...options });
        return response;
    },
    
    // Helper method to save file to GitHub
    saveFileToGitHub: async function(content, filePath, customCommitMessage = '') {
        if (!this.isConfigured()) {
            throw new Error('GitHub integration is not configured');
        }
        
        const owner = this.getOwner();
        const repo = this.getRepo();
        const branch = this.getBranch();
        const path = filePath || this.filePath;
        
        console.log(`Saving ${path} to GitHub...`);
        
        // Check if file exists to get its SHA
        let currentSHA = '';
        let fileExists = true;
        
        try {
            const fileInfoResponse = await this.makeApiRequest(`/repos/${owner}/${repo}/contents/${path}?ref=${branch}`);
            
            if (fileInfoResponse.status === 404) {
                // File doesn't exist yet
                fileExists = false;
                console.log(`File ${path} does not exist on GitHub yet, will create it`);
            } else if (!fileInfoResponse.ok) {
                const errorData = await fileInfoResponse.json();
                throw new Error(`GitHub API error: ${errorData.message}`);
            } else {
                // File exists, get its SHA
                const fileInfo = await fileInfoResponse.json();
                currentSHA = fileInfo.sha;
            }
            
            // Prepare the content (ensure it's base64 encoded)
            let base64Content;
            if (typeof content === 'string') {
                base64Content = btoa(unescape(encodeURIComponent(content)));
            } else {
                // If it's an object, stringify it first
                const jsonString = JSON.stringify(content, null, 2);
                base64Content = btoa(unescape(encodeURIComponent(jsonString)));
            }
            
            // Prepare the commit message
            const defaultCommitMessage = localStorage.getItem('githubCommitMessage') || 'Update data';
            const commitMessage = customCommitMessage || defaultCommitMessage;
            
            // Prepare the request body
            const requestBody = {
                message: `${commitMessage} - ${new Date().toISOString()}`,
                content: base64Content,
                branch: branch
            };
            
            // Add SHA if the file exists
            if (fileExists) {
                requestBody.sha = currentSHA;
            }
            
            // Commit the updated file
            const commitResponse = await this.makeApiRequest(`/repos/${owner}/${repo}/contents/${path}`, {
                method: 'PUT',
                headers: {
                    ...this.getApiHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });
            
            if (!commitResponse.ok) {
                const errorData = await commitResponse.json();
                throw new Error(`GitHub API error: ${errorData.message}`);
            }
            
            console.log(`File ${path} saved to GitHub successfully!`);
            return {
                success: true,
                message: `File ${path} saved to GitHub successfully!`,
                commit: await commitResponse.json()
            };
            
        } catch (error) {
            console.error(`GitHub save error for ${path}:`, error);
            throw error;
        }
    },
    
    saveConfig: function(config) {
        if (config.token) localStorage.setItem('githubToken', config.token);
        if (config.owner) localStorage.setItem('githubOwner', config.owner);
        if (config.repo) localStorage.setItem('githubRepo', config.repo);
        if (config.branch) localStorage.setItem('githubBranch', config.branch);
        if (config.filePath) localStorage.setItem('githubJsonPath', config.filePath);
        if (config.commitMessage) localStorage.setItem('githubCommitMessage', config.commitMessage);
        console.log('GitHub configuration saved to localStorage');
    },
    clearConfig: function() {
        localStorage.removeItem('githubToken');
        localStorage.removeItem('githubOwner');
        localStorage.removeItem('githubRepo');
        localStorage.removeItem('githubBranch');
        localStorage.removeItem('githubJsonPath');
        localStorage.removeItem('githubCommitMessage');
        console.log('GitHub configuration cleared from localStorage');
    }
};

/**
 * Initialize GitHub configuration and fallback to local implementation if needed
 * This function is provided for compatibility with older implementations
 */
function initGitHubConfig() {
    return window.githubConfig.isConfigured();
} 