import { query } from '../config/db';

/**
 * Recalculate predictions based on historical data.
 * Features:
 * - 6-month moving average
 * - Linear regression slope (days advanced per month)
 * - Retrogression detection and confidence scoring
 */
export const recalculatePredictions = async () => {
  // Clear cache
  await query('TRUNCATE TABLE prediction_cache RESTART IDENTITY CASCADE');

  // We need distinct category/country pairs
  const pairs = await query('SELECT DISTINCT category, country FROM visa_bulletin_history');
  
  for (const row of pairs.rows) {
    const { category, country } = row;
    
    // Get last 6 months
    const history = await query(`
      SELECT movement_days, bulletin_month
      FROM visa_bulletin_history
      WHERE category = $1 AND country = $2
      ORDER BY bulletin_month DESC
      LIMIT 6
    `, [category, country]);
    
    const records = history.rows;
    if (records.length === 0) continue;

    let totalMovement = 0;
    let retrogressions = 0;
    records.forEach(r => {
      totalMovement += (r.movement_days || 0);
      if (r.movement_days < 0) retrogressions++;
    });

    const avgMonthlyMovementDays = records.length > 0 ? (totalMovement / records.length) : 0;
    
    // Simple Linear Regression slope calculation (x = month index 0..n, y = cumulative movement)
    let slope = 0;
    if (records.length > 1) {
      const n = records.length;
      let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
      let cumulative = 0;
      // Reverse to go oldest to newest
      const reversed = [...records].reverse();
      reversed.forEach((r, i) => {
        cumulative += (r.movement_days || 0);
        sumX += i;
        sumY += cumulative;
        sumXY += (i * cumulative);
        sumXX += (i * i);
      });
      slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    }

    // Determine confidence
    let confidence = 'High';
    if (retrogressions > 0) confidence = 'Low';
    else if (avgMonthlyMovementDays < 5) confidence = 'Medium';

    // Estimate months to current
    // Simple mock estimation logic base on a mock 365 days backlog
    const mockBacklogDays = 365; 
    let estimatedMonthsToCurrent = 0;
    if (slope > 0) {
        // Assume slope represents days advanced per month
        estimatedMonthsToCurrent = mockBacklogDays / slope;
    }

    await query(`
      INSERT INTO prediction_cache 
        (category, country, avg_monthly_movement_days, regression_slope, confidence_level, estimated_months_to_current)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [category, country, avgMonthlyMovementDays, slope, confidence, estimatedMonthsToCurrent]);
  }
};

export const getPredictions = async () => {
  const res = await query('SELECT * FROM prediction_cache');
  return res.rows;
};
