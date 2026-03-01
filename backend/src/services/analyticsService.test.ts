import { getAnalyticsMetrics } from './analyticsService';
import * as db from '../config/db';

jest.mock('../config/db', () => ({
  query: jest.fn()
}));

describe('Analytics Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should correctly calculate longest retrogression and fastest month', async () => {
    const mockQuery = db.query as jest.Mock;
    
    mockQuery.mockResolvedValueOnce({
      rows: [
        { bulletin_month: '2024-06-01', movement_days: 0 },
        { bulletin_month: '2024-05-01', movement_days: -30 }, // retro
        { bulletin_month: '2024-04-01', movement_days: -15 }, // retro
        { bulletin_month: '2024-03-01', movement_days: 60 },  // fastest
        { bulletin_month: '2024-02-01', movement_days: 7 },
      ]
    });

    const metrics = await getAnalyticsMetrics('EB2', 'India');

    expect(metrics).not.toBeNull();
    expect(metrics?.longestRetrogressionStreak).toBe(2);
    expect(metrics?.fastestAdvancementDays).toBe(60);
    expect(metrics?.fastestAdvancementMonth).toBe('2024-03-01');
    expect(metrics?.volatilityIndex).toBeGreaterThan(0);
  });
});
