"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const node_cron_1 = __importDefault(require("node-cron"));
const env_1 = require("./config/env");
const requestLogger_1 = require("./middleware/requestLogger");
const errorHandler_1 = require("./middleware/errorHandler");
const visaRoutes_1 = __importDefault(require("./routes/visaRoutes"));
const dolRoutes_1 = __importDefault(require("./routes/dolRoutes"));
const analyticsRoutes_1 = __importDefault(require("./routes/analyticsRoutes"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
const predictionService_1 = require("./services/predictionService");
const scheduledTasks_1 = require("./jobs/scheduledTasks");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(requestLogger_1.requestLogger);
// Routes
app.use('/api/visa', visaRoutes_1.default);
app.use('/api/dol', dolRoutes_1.default);
app.use('/api/analytics', analyticsRoutes_1.default);
app.use('/api/admin', adminRoutes_1.default);
// Cron Jobs - Monthly Prediction Recalculation (1st of month at midnight)
node_cron_1.default.schedule('0 0 1 * *', async () => {
    console.log('[Cron] Running Prediction Engine Recalculation...');
    try {
        await (0, predictionService_1.recalculatePredictions)();
    }
    catch (error) {
        console.error('[Cron] Error during recalculation:', error);
    }
});
// Import new scraper cron jobs
(0, scheduledTasks_1.startCronJobs)();
// --- Temporary manual trigger for dev ---
if (env_1.config.env === 'development') {
    (async () => {
        console.log("[Dev] Triggering scrapers manually...");
        await scheduledTasks_1.runVisaScraperNow();
        await scheduledTasks_1.runDolScraperNow();
    })();
}
app.use(errorHandler_1.errorHandler);
app.listen(env_1.config.port, () => {
    console.log(`GreenCard Insights API running on port ${env_1.config.port} in ${env_1.config.env} mode`);
});
exports.default = app;
