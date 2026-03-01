"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.scrapeVisaBulletin = void 0;
const cheerio = __importStar(require("cheerio"));
const utils_1 = require("./utils");
const parseDateOrCurrent = (value) => {
    const cleanStr = value.trim().toUpperCase();
    if (cleanStr === 'C' || cleanStr === 'CURRENT') {
        return { date: null, isCurrent: true };
    }
    if (cleanStr === 'U' || cleanStr === 'UNAVAILABLE') {
        return { date: null, isCurrent: false };
    }
    const parsedDate = new Date(value);
    // basic validation
    if (!isNaN(parsedDate.getTime())) {
        return { date: parsedDate, isCurrent: false };
    }
    return { date: null, isCurrent: false };
};
const scrapeVisaBulletin = async (url, bulletinMonth) => {
    const response = await (0, utils_1.fetchWithRetry)(url);
    if (!response) {
        throw new Error(`Failed to fetch Visa Bulletin from ${url}`);
    }
    const $ = cheerio.load(response.data);
    const results = [];
    const categories = ['1st', '2nd', '3rd', 'Other Workers', '4th', 'Certain Religious Workers', '5th Unreserved', '5th Set Aside'];
    const targetCategories = ['EB1', 'EB2', 'EB3'];
    const countries = ['ROW', 'CHINA', 'INDIA', 'MEXICO', 'PHILIPPINES'];
    // We are primarily targeting EB1, EB2, EB3 for INDIA, CHINA and ROW (All Chargeability Areas)
    // Map table row headings to standard categories:
    const categoryMap = {
        '1st': 'EB1',
        '2nd': 'EB2',
        '3rd': 'EB3',
    };
    const finalActionMap = {};
    const datesForFilingMap = {};
    // Note: A robust implementation in reality requires examining Table headers
    // because the DOS changes their HTML structure often.
    // For this demonstration, we look for <table> elements containing "Employment"
    // and grab the first table as Final Action, and the second as Dates For Filing.
    const employmentTables = [];
    $('table').each((i, table) => {
        const text = $(table).text().toLowerCase();
        if (text.includes('employment') && (text.includes('1st') || text.includes('india'))) {
            employmentTables.push(table);
        }
    });
    if (employmentTables.length >= 2) {
        const finalActionTable = employmentTables[0];
        const filingTable = employmentTables[1];
        // Parse Final Action Table
        $(finalActionTable).find('tr').each((i, row) => {
            const cells = $(row).find('td').map((j, cell) => $(cell).text().trim()).get();
            if (cells.length > 5) { // Needs to have enough columns
                const catStr = cells[0];
                for (const key in categoryMap) {
                    if (catStr.includes(key)) {
                        const dbCat = categoryMap[key];
                        // Columns generally: Category | ROW | CHINA | INDIA | MEXICO | PHIL
                        finalActionMap[`${dbCat}_ROW`] = parseDateOrCurrent(cells[1]);
                        finalActionMap[`${dbCat}_CHINA`] = parseDateOrCurrent(cells[2]);
                        finalActionMap[`${dbCat}_INDIA`] = parseDateOrCurrent(cells[3]);
                    }
                }
            }
        });
        // Parse Dates for Filing Table
        $(filingTable).find('tr').each((i, row) => {
            const cells = $(row).find('td').map((j, cell) => $(cell).text().trim()).get();
            if (cells.length > 5) {
                const catStr = cells[0];
                for (const key in categoryMap) {
                    if (catStr.includes(key)) {
                        const dbCat = categoryMap[key];
                        datesForFilingMap[`${dbCat}_ROW`] = parseDateOrCurrent(cells[1]);
                        datesForFilingMap[`${dbCat}_CHINA`] = parseDateOrCurrent(cells[2]);
                        datesForFilingMap[`${dbCat}_INDIA`] = parseDateOrCurrent(cells[3]);
                    }
                }
            }
        });
    }
    // Combine them into objects
    for (const cat of targetCategories) {
        for (const country of ['ROW', 'CHINA', 'INDIA']) {
            const fa = finalActionMap[`${cat}_${country}`] || { date: null, isCurrent: false };
            const fl = datesForFilingMap[`${cat}_${country}`] || { date: null, isCurrent: false };
            results.push({
                category: cat,
                country: country === 'CHINA' ? 'China' : country === 'INDIA' ? 'India' : 'ROW',
                final_action_date: fa.date,
                is_current_final_action: fa.isCurrent,
                filing_date: fl.date,
                is_current_filing: fl.isCurrent,
                bulletin_month: bulletinMonth
            });
        }
    }
    return results;
};
exports.scrapeVisaBulletin = scrapeVisaBulletin;
