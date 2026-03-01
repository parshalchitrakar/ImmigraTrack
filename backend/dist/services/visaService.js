"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertVisaData = exports.getVisaHistory = exports.getCurrentVisaDates = void 0;
const db_1 = require("../config/db");
const analyticsService_1 = require("./analyticsService");
const getCurrentVisaDates = async () => {
    const result = await (0, db_1.query)(`
    SELECT DISTINCT ON (category, country)
      category, country, final_action_date, filing_date, bulletin_month, movement_days
    FROM visa_bulletin_history
    ORDER BY category, country, bulletin_month DESC
  `);
    return result.rows;
};
exports.getCurrentVisaDates = getCurrentVisaDates;
const getVisaHistory = async (category, country, page = 1, limit = 12) => {
    let q = 'SELECT * FROM visa_bulletin_history';
    const params = [];
    if (category && country) {
        q += ' WHERE category = $1 AND country = $2';
        params.push(category, country);
    }
    q += ' ORDER BY bulletin_month DESC';
    const offset = (page - 1) * limit;
    q += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);
    const result = await (0, db_1.query)(q, params);
    let countQ = 'SELECT COUNT(*) FROM visa_bulletin_history';
    const countParams = [];
    if (category && country) {
        countQ += ' WHERE category = $1 AND country = $2';
        countParams.push(category, country);
    }
    const countResult = await (0, db_1.query)(countQ, countParams);
    const total = parseInt(countResult.rows[0].count);
    return {
        data: result.rows,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }
    };
};
exports.getVisaHistory = getVisaHistory;
const insertVisaData = async (data) => {
    // 1. Get the previous month's data to calculate movement_days
    const prevMonthQuery = await (0, db_1.query)(`SELECT final_action_date FROM visa_bulletin_history
         WHERE category = $1 AND country = $2
         ORDER BY bulletin_month DESC LIMIT 1`, [data.category, data.country]);
    let movementDays = 0;
    if (prevMonthQuery.rows.length > 0 && prevMonthQuery.rows[0].final_action_date && data.final_action_date) {
        const prevDate = new Date(prevMonthQuery.rows[0].final_action_date);
        const currDate = new Date(data.final_action_date);
        movementDays = Math.round((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
    }
    else if (data.is_current_final_action) {
        movementDays = 0;
    }
    // 2. Insert into DB
    try {
        await (0, db_1.query)(`INSERT INTO visa_bulletin_history
             (category, country, final_action_date, is_current_final_action, filing_date, is_current_filing, bulletin_month, movement_days)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`, [
            data.category, data.country, data.final_action_date, data.is_current_final_action,
            data.filing_date, data.is_current_filing, data.bulletin_month, movementDays
        ]);
        // 3. Recalculate Analytics
        await (0, analyticsService_1.recalculateAnalytics)(data.category, data.country);
        return true;
    }
    catch (err) {
        if (err.code === '23505') {
            // unique violation
            return false;
        }
        throw err;
    }
};
exports.insertVisaData = insertVisaData;
