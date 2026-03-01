import { Pool } from 'pg';
import { config } from './env';

const poolConfig = config.db.connectionString 
  ? { connectionString: config.db.connectionString, ssl: config.env === 'production' ? { rejectUnauthorized: false } : false }
  : { ...config.db, ssl: false };

export const pool = new Pool(poolConfig);


pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export const query = (text: string, params?: any[]) => pool.query(text, params);
