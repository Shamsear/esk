// GitHub repository configuration
// These values will be used for saving changes to the players.json file
const githubConfig = {
    // Default repository details (can be overridden with localStorage values)
    defaultOwner: 'Shamsear',  // Replace with your GitHub username
    defaultRepo: 'esk',         // Replace with your repository name 
    defaultBranch: 'main',                 // or 'master', depending on your repository
    filePath: 'players.json',              // Path to the players.json file in your repository
    
    // Methods to get and set repository details
    getOwner: function() {
        return localStorage.getItem('githubOwner') || this.defaultOwner;
    },
    
    getRepo: function() {
        return localStorage.getItem('githubRepo') || this.defaultRepo;
    },
    
    getBranch: function() {
        return localStorage.getItem('githubBranch') || this.defaultBranch;
    },
    
    getToken: function() {
        return localStorage.getItem('githubToken') || '';
    },
    
    // Check if all required config values are set
    isConfigured: function() {
        return this.getOwner() && this.getRepo() && this.getBranch() && this.getToken();
    }
}; 