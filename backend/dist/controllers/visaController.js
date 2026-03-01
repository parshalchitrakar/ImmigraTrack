"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPrediction = exports.getHistory = exports.getCurrentVisa = void 0;
const visaService_1 = require("../services/visaService");
const predictionService_1 = require("../services/predictionService");
const getCurrentVisa = async (req, res, next) => {
    try {
        const data = await (0, visaService_1.getCurrentVisaDates)();
        res.json(data);
    }
    catch (error) {
        next(error);
    }
};
exports.getCurrentVisa = getCurrentVisa;
const getHistory = async (req, res, next) => {
    try {
        const { category, country, page, limit } = req.query;
        const pageNum = page ? parseInt(page) : 1;
        const limitNum = limit ? parseInt(limit) : 12;
        const data = await (0, visaService_1.getVisaHistory)(category, country, pageNum, limitNum);
        res.json(data);
    }
    catch (error) {
        next(error);
    }
};
exports.getHistory = getHistory;
const getPrediction = async (req, res, next) => {
    try {
        const data = await (0, predictionService_1.getPredictions)();
        res.json(data);
    }
    catch (error) {
        next(error);
    }
};
exports.getPrediction = getPrediction;
