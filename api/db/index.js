const { sql } = require('@vercel/postgres');

/**
 * This file manages database connections using Vercel Postgres
 * We wrap the SQL queries in try/catch blocks for error handling
 */

// Query helper function
async function query(queryString, values = []) {
  try {
    // Connect to the database and execute the query
    const result = await sql.query(queryString, values);
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

module.exports = {
  query,
  sql
}; 