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
exports.scrapeDolPerm = void 0;
const cheerio = __importStar(require("cheerio"));
const utils_1 = require("./utils");
const parseDolDate = (dateStr) => {
    // Expected format 'Month Year' e.g. 'November 2022'
    const parsed = new Date(`${dateStr} 1`);
    if (isNaN(parsed.getTime())) {
        return new Date(); // Fallback, but in reality we'd log an error
    }
    return parsed;
};
const scrapeDolPerm = async (url = 'https://flag.dol.gov/processingtimes') => {
    const response = await (0, utils_1.fetchWithRetry)(url);
    if (!response) {
        throw new Error(`Failed to fetch DOL Processing Times from ${url}`);
    }
    const $ = cheerio.load(response.data);
    let analystReviewMonth = new Date();
    let auditReviewMonth = new Date();
    let pwdMonth = new Date();
    let updateMonth = new Date();
    // The Flag DOL website presents these usually in definition lists or tables under PERM
    // We will do a generic pass looking for matching text nodes.
    // Check for "as of" date or update month
    const titleText = $('h2, h3').filter((i, el) => $(el).text().toLowerCase().includes('processing times')).text();
    const asOMatch = titleText.match(/as of ([A-Za-z]+ \d{4})/i);
    if (asOMatch) {
        updateMonth = parseDolDate(asOMatch[1]);
    }
    else {
        // Fallback to today's month if the scraped date can't be parsed
        updateMonth = new Date();
    }
    // Try finding the row or definition for PERM
    $('td, th, dt, dd, p').each((i, element) => {
        const _text = $(element).text().toLowerCase().trim();
        // Look for next element's text if the current element is a label
        if (_text.includes('analyst review')) {
            const nextNodeText = $(element).next().text().trim() || $(element).parent().find('td').eq(1).text().trim();
            if (nextNodeText)
                analystReviewMonth = parseDolDate(nextNodeText);
        }
        if (_text.includes('audit review')) {
            const nextNodeText = $(element).next().text().trim() || $(element).parent().find('td').eq(1).text().trim();
            if (nextNodeText)
                auditReviewMonth = parseDolDate(nextNodeText);
        }
        if (_text.includes('prevailing wage') && _text.includes('perm')) {
            const nextNodeText = $(element).next().text().trim() || $(element).parent().find('td').eq(1).text().trim();
            if (nextNodeText)
                pwdMonth = parseDolDate(nextNodeText);
        }
    });
    return {
        analyst_review_month: analystReviewMonth,
        audit_review_month: auditReviewMonth,
        pwd_month: pwdMonth,
        update_month: updateMonth
    };
};
exports.scrapeDolPerm = scrapeDolPerm;
