import { Pool } from 'pg';
import { config } from './env';

const poolConfig = config.db.connectionString 
  ? { connectionString: config.db.connectionString, ssl: config.env === 'production' ? { rejectUnauthorized: false } : false }
  : { 
      user: config.db.user,
      host: config.db.host,
      database: config.db.database,
      password: config.db.password,
      port: config.db.port,
      ssl: false 
    };


export const pool = new Pool(poolConfig);


pool.on('error', (err: Error, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export const query = (text: string, params?: any[]) => pool.query(text, params);
