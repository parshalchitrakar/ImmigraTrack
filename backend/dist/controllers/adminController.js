"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runBackfill = void 0;
const backfillVisaHistory_1 = require("../jobs/backfillVisaHistory");
const runBackfill = async (req, res, next) => {
    try {
        const { startYear, endYear } = req.body;
        if (!startYear || !endYear) {
            res.status(400).json({ error: 'startYear and endYear are required.' });
            return;
        }
        // Run backfill in the background to not lock the HTTP cycle
        (0, backfillVisaHistory_1.runVisaBackfill)(parseInt(startYear), parseInt(endYear)).then(result => {
            console.log(`Backfill finished: ${result.totalInserted} records inserted.`);
        }).catch(err => {
            console.error('Backfill error:', err);
        });
        res.json({ message: `Backfill started for years ${startYear}-${endYear} in the background.` });
    }
    catch (error) {
        next(error);
    }
};
exports.runBackfill = runBackfill;
