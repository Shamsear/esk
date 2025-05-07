# Player Auction System API

This project provides a set of API endpoints for a player auction system using Vercel Postgres and serverless functions, designed to work with existing HTML/CSS/JavaScript frontend files.

## Overview

The Player Auction System API is a transition from a static JSON file-based storage system to a more robust Postgres database solution hosted on Vercel. This API maintains the existing frontend structure while providing improved data management capabilities.

## Features

- RESTful API endpoints for players and managers data
- Support for filtering, pagination, and sorting
- Full CRUD operations for both players and managers
- Database migration utilities
- Integration with existing HTML/CSS/JS frontend

## Project Structure

```
├── api/
│   ├── db/
│   │   └── index.js             # Database connection module
│   ├── players/
│   │   ├── index.js             # List players endpoint
│   │   ├── [id].js              # Get/update/delete player endpoint
│   │   └── create.js            # Create player endpoint
│   ├── managers/
│   │   ├── index.js             # List managers endpoint
│   │   ├── [id].js              # Get/update/delete manager endpoint
│   │   └── create.js            # Create manager endpoint
│   └── migration/
│       ├── import.js            # Import data from JSON files
│       └── init-db.js           # Initialize database schema
├── vercel.json                  # Vercel configuration
├── package.json                 # Project dependencies
├── MIGRATION-GUIDE.md           # Guide for migrating from JSON to DB
└── README.md                    # Project documentation
```

## API Endpoints

### Players

- `GET /api/players` - List all players with optional filtering
- `GET /api/players/[id]` - Get a specific player by ID
- `POST /api/players/create` - Create a new player
- `PUT /api/players/[id]` - Update an existing player
- `DELETE /api/players/[id]` - Delete a player

### Managers

- `GET /api/managers` - List all managers with optional filtering
- `GET /api/managers/[id]` - Get a specific manager by ID
- `POST /api/managers/create` - Create a new manager
- `PUT /api/managers/[id]` - Update an existing manager
- `DELETE /api/managers/[id]` - Delete a manager

### Migration

- `POST /api/migration/init-db` - Initialize database schema
- `POST /api/migration/import` - Import data from JSON files

## Getting Started

### Prerequisites

- Node.js (>=18.x)
- Vercel account
- Vercel CLI (`npm install -g vercel`)

### Installation

1. Clone the repository
   ```
   git clone <repository-url>
   cd player-auction-system
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Set up Vercel Postgres
   - Create a Postgres database in your Vercel dashboard
   - Add your database connection string to your environment variables

4. Link your project to Vercel
   ```
   vercel login
   vercel link
   ```

5. Set up environment variables
   ```
   vercel env add POSTGRES_URL
   ```

6. Deploy to Vercel
   ```
   vercel --prod
   ```

## Database Setup

After deploying to Vercel, initialize the database schema:

```
curl -X POST https://your-vercel-url.vercel.app/api/migration/init-db
```

Then import your existing data:

```
curl -X POST https://your-vercel-url.vercel.app/api/migration/import -H "Content-Type: application/json" -d '{"dataType": "players"}'
curl -X POST https://your-vercel-url.vercel.app/api/migration/import -H "Content-Type: application/json" -d '{"dataType": "managers"}'
```

## Frontend Integration

For details on integrating these API endpoints with your existing HTML frontend, see the [Migration Guide](MIGRATION-GUIDE.md).

## Development

To run the project locally:

```
npm run dev
```

This will start a local development server using Vercel Dev.

## License

This project is licensed under the MIT License.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. 