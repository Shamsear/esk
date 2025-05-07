# Migration Guide: JSON Files to Vercel Postgres Database

This guide outlines the process of migrating data from local JSON files to Vercel's Postgres database and updating the frontend applications to use the new API endpoints.

## Prerequisites

1. A Vercel account for deploying the application
2. Vercel CLI installed locally: `npm install -g vercel`
3. Basic understanding of SQL and JavaScript

## Step 1: Set Up Vercel Postgres Database

1. Log in to your Vercel account and navigate to your project settings.
2. Select the "Storage" tab and click "Connect Database".
3. Choose "Postgres" as your database type.
4. Follow the setup wizard to create a new Postgres database.
5. Once created, Vercel will provide you with database credentials and connection strings.
6. Create a .env file locally with your Postgres connection string:
   ```
   POSTGRES_URL=your_connection_string_here
   ```

## Step 2: Deploy the API to Vercel

1. In your terminal, navigate to the project directory.
2. Run `vercel login` to authenticate with your Vercel account.
3. Run `vercel link` to link your local project to a Vercel project.
4. Create a Vercel secret for your database connection string:
   ```
   vercel env add POSTGRES_URL
   ```
5. Deploy your project:
   ```
   vercel --prod
   ```

## Step 3: Import Data from JSON to Postgres

After deploying, use the migration endpoint to import your data:

1. Import players data:
   ```
   curl -X POST https://your-vercel-url.vercel.app/api/migration/import -H "Content-Type: application/json" -d '{"dataType": "players"}'
   ```

2. Import managers data:
   ```
   curl -X POST https://your-vercel-url.vercel.app/api/migration/import -H "Content-Type: application/json" -d '{"dataType": "managers"}'
   ```

## Step 4: Update Frontend HTML Files

### Updating player-status.html

Replace the existing JavaScript code that fetches player data from JSON files with API calls:

```javascript
// Original JSON file loading
// const playersData = await fetch('players.json').then(response => response.json());

// New API endpoint call
async function fetchPlayers(filters = {}) {
  const queryParams = new URLSearchParams();
  
  // Add filter parameters if provided
  if (filters.club) queryParams.append('club', filters.club);
  if (filters.position) queryParams.append('position', filters.position);
  if (filters.star) queryParams.append('star', filters.star);
  if (filters.search) queryParams.append('search', filters.search);
  if (filters.limit) queryParams.append('limit', filters.limit);
  if (filters.offset) queryParams.append('offset', filters.offset);
  
  const response = await fetch(`/api/players?${queryParams.toString()}`);
  const data = await response.json();
  return data;
}

// Usage example
const playersData = await fetchPlayers({
  limit: 50,
  offset: 0
});
```

### Updating player-admin.html

Replace the existing code that saves player data to JSON files with API calls:

```javascript
// Create a new player
async function createPlayer(playerData) {
  const response = await fetch('/api/players/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(playerData)
  });
  return await response.json();
}

// Update an existing player
async function updatePlayer(playerId, playerData) {
  const response = await fetch(`/api/players/${playerId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(playerData)
  });
  return await response.json();
}

// Delete a player
async function deletePlayer(playerId) {
  const response = await fetch(`/api/players/${playerId}`, {
    method: 'DELETE'
  });
  return await response.json();
}
```

### Updating managers.html and manager-detail.html

Replace the existing JavaScript code that fetches manager data from JSON files with API calls:

```javascript
// Original JSON file loading
// const managersData = await fetch('manager_data.json').then(response => response.json());

// New API endpoint call
async function fetchManagers(filters = {}) {
  const queryParams = new URLSearchParams();
  
  // Add filter parameters if provided
  if (filters.club) queryParams.append('club', filters.club);
  if (filters.search) queryParams.append('search', filters.search);
  if (filters.limit) queryParams.append('limit', filters.limit);
  if (filters.offset) queryParams.append('offset', filters.offset);
  if (filters.sort_by) queryParams.append('sort_by', filters.sort_by);
  if (filters.sort_order) queryParams.append('sort_order', filters.sort_order);
  
  const response = await fetch(`/api/managers?${queryParams.toString()}`);
  const data = await response.json();
  return data;
}

// Fetch a specific manager by ID
async function fetchManagerById(managerId) {
  const response = await fetch(`/api/managers/${managerId}`);
  const data = await response.json();
  return data;
}
```

## Step 5: Update Admin Authentication (Optional)

If your admin pages require authentication, consider implementing a secure authentication system:

1. Add authentication endpoints under `/api/auth/`
2. Implement JWT (JSON Web Token) authentication
3. Secure admin API endpoints by validating tokens
4. Update admin frontend to handle authentication flow

## Step 6: Testing the Migration

1. Deploy the updated code to Vercel
2. Test all frontend functionality to ensure it works with the new API endpoints
3. Verify that all data has been correctly migrated by checking both player and manager listings
4. Test creating, updating, and deleting records to ensure proper database operations

## Troubleshooting

### API Returns 500 Error
Check the Vercel logs for details on the error. Common issues include:
- Database connection problems
- Missing environment variables
- Syntax errors in SQL queries

### Data Import Fails
- Ensure your JSON files are properly formatted
- Check for special characters that might need escaping
- Try importing smaller batches of data

### Frontend Shows No Data
- Verify API endpoints are correctly called
- Check browser console for CORS or other errors
- Ensure proper error handling in fetch calls

## Next Steps and Optimizations

1. Implement pagination on frontend for better performance
2. Add caching mechanisms for frequently accessed data
3. Set up proper CORS policies for production
4. Implement rate limiting for API endpoints
5. Add monitoring and logging for better debugging

## Contact and Support

If you encounter any issues during migration, please refer to the [Vercel documentation](https://vercel.com/docs) or contact our development team for assistance. 