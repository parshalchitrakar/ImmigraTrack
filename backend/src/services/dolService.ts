import { query } from '../config/db';

export const getCurrentDolProcessing = async () => {
  const result = await query(`
    SELECT * FROM dol_processing_history
    ORDER BY update_month DESC
    LIMIT 1
  `);
  return result.rows[0];
};

export const getDolHistory = async () => {
  const result = await query(`
    SELECT * FROM dol_processing_history
    ORDER BY update_month DESC
  `);
  return result.rows;
};
