"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const visaController_1 = require("../controllers/visaController");
const router = (0, express_1.Router)();
router.get('/current', visaController_1.getCurrentVisa);
router.get('/history', visaController_1.getHistory);
router.get('/prediction', visaController_1.getPrediction);
exports.default = router;
