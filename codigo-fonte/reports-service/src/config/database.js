/**
 * Padrao Singleton — unica instancia do pool de conexao com o banco.
 */
const { Pool } = require('pg');

class Database {
  constructor() {
    if (Database._instance) {
      return Database._instance;
    }

    this._pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5432,
      database: process.env.DB_NAME || 'techstore',
      user: process.env.DB_USER || 'techstore_user',
      password: process.env.DB_PASSWORD || 'techstore_pass',
      max: 5,
      idleTimeoutMillis: 30000,
    });

    this._pool.on('error', (err) => {
      console.error('[Database] Erro no cliente idle:', err.message);
    });

    Database._instance = this;
  }

  async query(text, params) {
    return this._pool.query(text, params);
  }
}

module.exports = new Database();
