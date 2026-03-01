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
const analyticsService_1 = require("./analyticsService");
const db = __importStar(require("../config/db"));
jest.mock('../config/db', () => ({
    query: jest.fn()
}));
describe('Analytics Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    it('should correctly calculate longest retrogression and fastest month', async () => {
        const mockQuery = db.query;
        mockQuery.mockResolvedValueOnce({
            rows: [
                { bulletin_month: '2024-06-01', movement_days: 0 },
                { bulletin_month: '2024-05-01', movement_days: -30 }, // retro
                { bulletin_month: '2024-04-01', movement_days: -15 }, // retro
                { bulletin_month: '2024-03-01', movement_days: 60 }, // fastest
                { bulletin_month: '2024-02-01', movement_days: 7 },
            ]
        });
        const metrics = await (0, analyticsService_1.getAnalyticsMetrics)('EB2', 'India');
        expect(metrics).not.toBeNull();
        expect(metrics?.longestRetrogressionStreak).toBe(2);
        expect(metrics?.fastestAdvancementDays).toBe(60);
        expect(metrics?.fastestAdvancementMonth).toBe('2024-03-01');
        expect(metrics?.volatilityIndex).toBeGreaterThan(0);
    });
});
