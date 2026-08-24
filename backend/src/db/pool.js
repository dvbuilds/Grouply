const { Pool } = require('pg');

// A single shared connection pool for the whole process — every query goes
// through `pool.query(...)` (or a checked-out client for transactions)
// instead of opening a fresh connection per request.
//
// DATABASE_URL wins if set (common in hosted Postgres / Docker setups);
// otherwise falls back to the discrete DB_* vars.
const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 5432,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'joineazy',
    };

const pool = new Pool({
  ...poolConfig,
  max: Number(process.env.DB_POOL_MAX) || 10,
  idleTimeoutMillis: Number(process.env.DB_IDLE_TIMEOUT_MS) || 30000,
  connectionTimeoutMillis: Number(process.env.DB_CONNECTION_TIMEOUT_MS) || 5000,
});

pool.on('error', (err) => {
  // Errors on idle clients in the pool (e.g. DB restart) shouldn't crash
  // the whole process — log and let the next query pick up a fresh client.
  console.error('Unexpected error on idle PostgreSQL client', err);
});

module.exports = pool;
