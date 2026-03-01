"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHistory = exports.getCurrentDol = void 0;
const dolService_1 = require("../services/dolService");
const getCurrentDol = async (req, res, next) => {
    try {
        const data = await (0, dolService_1.getCurrentDolProcessing)();
        res.json(data);
    }
    catch (error) {
        next(error);
    }
};
exports.getCurrentDol = getCurrentDol;
const getHistory = async (req, res, next) => {
    try {
        const data = await (0, dolService_1.getDolHistory)();
        res.json(data);
    }
    catch (error) {
        next(error);
    }
};
exports.getHistory = getHistory;
