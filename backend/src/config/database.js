const { Pool } = require('pg');
const logger = require('../utils/logger');

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'patient_management',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres123',
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
};

// Create connection pool
const pool = new Pool(dbConfig);

// Pool event listeners
pool.on('connect', (client) => {
  logger.info(`New client connected (${client.processID})`);
});

pool.on('error', (err) => {
  logger.error('Unexpected error on idle client:', err);
});

pool.on('remove', (client) => {
  logger.info(`Client removed (${client.processID})`);
});

/**
 * Connect to database and test connection
 */
async function connectDatabase() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    
    logger.info('Database connection successful');
    logger.info(`Connected to: ${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`);
    logger.info(`Server time: ${result.rows[0].now}`);
    
    return true;
  } catch (error) {
    logger.error('Database connection failed:', error);
    throw error;
  }
}

/**
 * Execute a query with error handling
 * @param {string} text - SQL query string
 * @param {Array} params - Query parameters
 * @returns {Object} Query result
 */
async function query(text, params) {
  const start = Date.now();
  
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    
    logger.debug(`Executed query: ${text}`, {
      duration: `${duration}ms`,
      rows: result.rowCount
    });
    
    return result;
  } catch (error) {
    logger.error('Query execution failed:', {
      query: text,
      params,
      error: error.message
    });
    throw error;
  }
}

/**
 * Get a client from the pool for transactions
 * @returns {Object} Database client
 */
async function getClient() {
  try {
    const client = await pool.connect();
    return client;
  } catch (error) {
    logger.error('Failed to get database client:', error);
    throw error;
  }
}

/**
 * Execute multiple queries in a transaction
 * @param {Function} callback - Function containing queries to execute
 * @returns {*} Callback result
 */
async function transaction(callback) {
  const client = await getClient();
  
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Close all database connections
 */
async function closeDatabase() {
  try {
    await pool.end();
    logger.info('Database connections closed');
  } catch (error) {
    logger.error('Error closing database connections:', error);
    throw error;
  }
}

module.exports = {
  pool,
  query,
  getClient,
  transaction,
  connectDatabase,
  closeDatabase
};