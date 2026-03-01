"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const predictionService_1 = require("./predictionService");
const db = __importStar(require("../config/db"));
jest.mock('../config/db', () => ({
    query: jest.fn()
}));
describe('Prediction Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    it('should calculate regression slope correctly for steady movement', async () => {
        const mockQuery = db.query;
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
        await (0, predictionService_1.recalculatePredictions)();
        expect(mockQuery).toHaveBeenCalledTimes(4);
        const insertCallArgs = mockQuery.mock.calls[3][1];
        expect(insertCallArgs[0]).toBe('EB2');
        expect(insertCallArgs[1]).toBe('India');
        expect(insertCallArgs[2]).toBe(10); // avg_monthly_movement_days
        expect(insertCallArgs[3]).toBe(10); // slope
        expect(insertCallArgs[4]).toBe('High'); // confidence (avg >= 5, no retrogression)
    });
});
