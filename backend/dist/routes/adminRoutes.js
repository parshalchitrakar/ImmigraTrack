"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminController_1 = require("../controllers/adminController");
const router = (0, express_1.Router)();
const adminAuth = (req, res, next) => {
    const token = req.headers['authorization'];
    if (token === `Bearer ${process.env.ADMIN_TOKEN}`) {
        next();
    }
    else {
        res.status(401).json({ error: 'Unauthorized' });
    }
};
router.post('/backfill', adminAuth, adminController_1.runBackfill);
exports.default = router;
