"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMetrics = void 0;
const analyticsService_1 = require("../services/analyticsService");
const getMetrics = async (req, res, next) => {
    try {
        const { category, country } = req.query;
        if (!category || !country) {
            return res.status(400).json({ error: 'category and country are required' });
        }
        const data = await (0, analyticsService_1.getAnalyticsMetrics)(category, country);
        res.json(data);
    }
    catch (error) {
        next(error);
    }
};
exports.getMetrics = getMetrics;
