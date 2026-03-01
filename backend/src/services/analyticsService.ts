import { query } from '../config/db';

export const getAnalyticsMetrics = async (category: string, country: string) => {
  const result = await query(`
    SELECT movement_days, bulletin_month
    FROM visa_bulletin_history
    WHERE category = $1 AND country = $2
    ORDER BY bulletin_month DESC
    LIMIT 24
  `, [category, country]);

  const records = result.rows;
  if (records.length === 0) return null;

  // Volatility Index: Standard deviation of movement
  const movements = records.map((r: any) => r.movement_days || 0);
  const mean = movements.reduce((a: number, b: number) => a + b, 0) / movements.length;
  const variance = movements.reduce((a: number, b: number) => a + Math.pow(b - mean, 2), 0) / movements.length;
  const volatilityIndex = Math.sqrt(variance);

  // Longest Retrogression Streak
  let longestRetrogression = 0;
  let currentStreak = 0;
  for (const m of movements) {
    if (m < 0) {
      currentStreak++;
      if (currentStreak > longestRetrogression) {
        longestRetrogression = currentStreak;
      }
    } else {
      currentStreak = 0;
    }
  }

  // Fastest Advancement Month
  let fastestAdvancement = 0;
  let fastestMonth = null;
  records.forEach((r: any) => {
    if (r.movement_days > fastestAdvancement) {
      fastestAdvancement = r.movement_days;
      fastestMonth = r.bulletin_month;
    }
  });

  return {
    volatilityIndex: parseFloat(volatilityIndex.toFixed(2)),
    longestRetrogressionStreak: longestRetrogression,
    fastestAdvancementDays: fastestAdvancement,
    fastestAdvancementMonth: fastestMonth
  };
};

export const recalculateAnalytics = async (category: string, country: string) => {
  // Fetch the last 12 months of movement_days from visa_bulletin_history
  const historyQuery = await query(
      `SELECT movement_days, final_action_date 
       FROM visa_bulletin_history 
       WHERE category = $1 AND country = $2 AND movement_days IS NOT NULL
       ORDER BY bulletin_month DESC LIMIT 12`,
      [category, country]
  );

  const history = historyQuery.rows;
  if (history.length === 0) return;

  // Calculate moving average
  const sum = history.reduce((acc: number, row: any) => acc + Number(row.movement_days), 0);
  const avgMovement = sum / history.length;

  // Calculate simple regression slope
  // Using index as X, movement_days as Y
  let xSum = 0;
  let ySum = 0;
  let xySum = 0;
  let x2Sum = 0;
  const n = history.length;

  for (let i = 0; i < n; i++) {
      const x = i;
      const y = Number(history[n - 1 - i].movement_days); // oldest to newest
      xSum += x;
      ySum += y;
      xySum += x * y;
      x2Sum += x * x;
  }

  const slopeNumerator = (n * xySum) - (xSum * ySum);
  const slopeDenominator = (n * x2Sum) - (xSum * xSum);
  const regressionSlope = slopeDenominator === 0 ? 0 : slopeNumerator / slopeDenominator;

  let confidenceLevel = 'Low';
  if (n >= 6) confidenceLevel = 'Medium';
  if (n >= 12) confidenceLevel = 'High';

  let estimatedMonthsToCurrent: number | null = null;
  if (avgMovement > 0) {
      estimatedMonthsToCurrent = (365 / avgMovement);
  }

  // Update prediction_cache table
  await query(
      `INSERT INTO prediction_cache 
          (category, country, avg_monthly_movement_days, regression_slope, confidence_level, estimated_months_to_current, last_calculated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       ON CONFLICT (category, country) 
       DO UPDATE SET 
          avg_monthly_movement_days = EXCLUDED.avg_monthly_movement_days,
          regression_slope = EXCLUDED.regression_slope,
          confidence_level = EXCLUDED.confidence_level,
          estimated_months_to_current = EXCLUDED.estimated_months_to_current,
          last_calculated_at = NOW()`,
      [category, country, avgMovement.toFixed(2), regressionSlope.toFixed(4), confidenceLevel, estimatedMonthsToCurrent]
  );
};
