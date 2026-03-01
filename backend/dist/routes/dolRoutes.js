"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dolController_1 = require("../controllers/dolController");
const router = (0, express_1.Router)();
router.get('/current', dolController_1.getCurrentDol);
router.get('/history', dolController_1.getHistory);
exports.default = router;
