import { recalculatePredictions } from './predictionService';
import * as db from '../config/db';

jest.mock('../config/db', () => ({
  query: jest.fn()
}));

describe('Prediction Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should calculate regression slope correctly for steady movement', async () => {
    const mockQuery = db.query as jest.Mock;
    
    // 1st query: truncate cache
    mockQuery.mockResolvedValueOnce({});
    // 2nd query: Get pairs
    mockQuery.mockResolvedValueOnce({ rows: [{ category: 'EB2', country: 'India' }] });
    // 3rd query: Get history (6 months, e.g., strictly advancing 10 days each month)
    mockQuery.mockResolvedValueOnce({
      rows: [
        { bulletin_month: '2024-06-01', movement_days: 10 },
        { bulletin_month: '2024-05-01', movement_days: 10 },
        { bulletin_month: '2024-04-01', movement_days: 10 },
        { bulletin_month: '2024-03-01', movement_days: 10 },
        { bulletin_month: '2024-02-01', movement_days: 10 },
        { bulletin_month: '2024-01-01', movement_days: 10 },
      ]
    });
    // 4th query: Insert cache
    mockQuery.mockResolvedValueOnce({});

    await recalculatePredictions();

    expect(mockQuery).toHaveBeenCalledTimes(4);
    
    const insertCallArgs = mockQuery.mock.calls[3][1];
    expect(insertCallArgs[0]).toBe('EB2');
    expect(insertCallArgs[1]).toBe('India');
    expect(insertCallArgs[2]).toBe(10); // avg_monthly_movement_days
    expect(insertCallArgs[3]).toBe(10); // slope
    expect(insertCallArgs[4]).toBe('High'); // confidence (avg >= 5, no retrogression)
  });
});
