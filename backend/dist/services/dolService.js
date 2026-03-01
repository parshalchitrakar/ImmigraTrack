"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDolHistory = exports.getCurrentDolProcessing = void 0;
const db_1 = require("../config/db");
const getCurrentDolProcessing = async () => {
    const result = await (0, db_1.query)(`
    SELECT * FROM dol_processing_history
    ORDER BY update_month DESC
    LIMIT 1
  `);
    return result.rows[0];
};
exports.getCurrentDolProcessing = getCurrentDolProcessing;
const getDolHistory = async () => {
    const result = await (0, db_1.query)(`
    SELECT * FROM dol_processing_history
    ORDER BY update_month DESC
  `);
    return result.rows;
};
exports.getDolHistory = getDolHistory;
