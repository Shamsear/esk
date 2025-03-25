# R2G Player Admin Panel

This project contains a player data management system for the player-status page.

## Files Overview

- `player-status.html` - The main player display page
- `players.json` - The JSON data file containing all player information
- `admin-login.html` - The login page for the admin panel
- `player-admin.html` - The admin interface for managing player data
- `token-setup.html` - Setup page for GitHub integration
- `github-config.js` - Configuration for GitHub integration

## Deployment Options

### Local Development

1. Start a local web server:
   ```
   npm run dev
   ```

2. In a separate terminal, start the data saving server:
   ```
   npm run server
   ```

3. Open your browser and navigate to:
   - Player status page: http://localhost:8000/player-status.html
   - Admin login: http://localhost:8000/admin-login.html

### Netlify Deployment

When deploying to Netlify:

1. Push your code to GitHub
2. Connect your GitHub repository to Netlify
3. Set up the build settings:
   - Build command: leave empty (no build required)
   - Publish directory: `.` (root directory)
4. Configure GitHub integration in the admin panel to enable saving changes

## How to Use

### 1. View Player Data

Simply open `player-status.html` in your browser to view the player data. This file loads player information from `players.json`.

### 2. Accessing the Admin Panel

1. Open `admin-login.html` in your browser
2. Use the following credentials to log in:
   - Username: `admin`
   - Password: `r2gadmin123`
3. After successful login, you will be redirected to the admin panel

### 3. Setting Up GitHub Integration (for Netlify deployment)

1. Create a GitHub Personal Access Token:
   - Go to GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens
   - Click "Generate new token"
   - Give it a name like "R2G Player Admin"
   - Set expiration according to your needs
   - Select your repository as the only one this token can access
   - Under "Repository permissions", set "Contents" to "Read and write"
   - Click "Generate token" and copy the token

2. Configure GitHub in the admin panel:
   - Open `token-setup.html` in your browser
   - Enter your GitHub token, username, repository name, and branch
   - Click "Save Configuration"
   - Test the connection to ensure everything is working

### 4. Using the Admin Panel

The admin panel allows you to:
- View all players sorted by value
- Search for specific players by name
- Edit player details (name, value, position, club, etc.)
- Add player stats and history
- Set player images
- Add new players
- Delete existing players

All changes will automatically update in the player-status page when saved.

### 5. How Saving Works

- **Local Development**: Changes are saved to the local `players.json` file via the Node.js server
- **Netlify Deployment**: Changes are committed directly to your GitHub repository, which triggers a new Netlify build

## Technical Details

- The admin panel uses client-side JavaScript for the user interface
- Authentication is handled with sessionStorage (for demonstration purposes)
- Player data is stored in a simple JSON format
- GitHub integration allows saving changes when deployed on Netlify
- When running locally, a Node.js server provides endpoints for saving data

## Security Considerations

This is a demonstration system with minimal security. For production use, consider:

- Using a proper authentication system
- Implementing HTTPS
- Securing the GitHub token (currently stored in localStorage)
- Moving credentials to environment variables
- Implementing proper data validation and sanitization

## Troubleshooting

### GitHub Integration Not Working

1. Check that your GitHub token has the correct permissions
2. Verify your repository name and branch are correct
3. Make sure the JSON file path matches your repository structure
4. Check browser console for error messages

### Changes Not Appearing on Netlify

1. Verify that GitHub integration is correctly configured
2. Check that Netlify is set up to deploy from your repository
3. Remember that it may take a few minutes for changes to appear after committing to GitHub

### Local Server Issues

If the local Node.js server isn't working:

1. Check that Node.js is installed
2. Verify that the server is running with `npm run server`
3. Check for any error messages in the terminal
4. Try configuring GitHub integration as an alternative