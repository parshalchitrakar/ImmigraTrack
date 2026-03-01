"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runVisaBackfill = void 0;
const visaScraper_1 = require("../scrapers/visaScraper");
const visaService_1 = require("../services/visaService");
const utils_1 = require("../scrapers/utils");
const runVisaBackfill = async (startYear, endYear) => {
    const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
    let totalInserted = 0;
    for (let year = startYear; year <= endYear; year++) {
        for (let i = 0; i < months.length; i++) {
            const monthName = months[i];
            // Generate standard state gov URL based on year and month
            const url = `https://travel.state.gov/content/travel/en/legal/visa-law0/visa-bulletin/${year}/visa-bulletin-for-${monthName}-${year}.html`;
            // The bulletin month is technically the month in the URL
            const bulletinMonth = new Date(`${monthName} 1, ${year}`);
            try {
                // Throttling implicitly done within scraper retry, but explicitly delay 
                // here to respect robots.txt rate-limits per the architectural plan
                await (0, utils_1.delay)(2000);
                const visaRecords = await (0, visaScraper_1.scrapeVisaBulletin)(url, bulletinMonth);
                let currentMonthInserted = 0;
                for (const record of visaRecords) {
                    const inserted = await (0, visaService_1.insertVisaData)(record);
                    if (inserted)
                        currentMonthInserted++;
                }
                totalInserted += currentMonthInserted;
                await (0, utils_1.delay)(3000); // Wait another 3s before next iteration
            }
            catch (err) {
                console.error(`Skipping ${monthName} ${year} due to error: ${err.message}`);
                // Continue to the next month instead of failing the whole job
            }
        }
    }
    return { success: true, totalInserted };
};
exports.runVisaBackfill = runVisaBackfill;
