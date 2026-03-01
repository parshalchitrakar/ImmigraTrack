import * as cheerio from 'cheerio';
import { fetchWithRetry } from './utils';

export interface VisaData {
    category: string;
    country: string;
    final_action_date: Date | null;
    is_current_final_action: boolean;
    filing_date: Date | null;
    is_current_filing: boolean;
    bulletin_month: Date;
}

const parseDateOrCurrent = (value: string) => {
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

export const scrapeVisaBulletin = async (url: string, bulletinMonth: Date): Promise<VisaData[]> => {
    const response = await fetchWithRetry(url);
    if (!response) {
        throw new Error(`Failed to fetch Visa Bulletin from ${url}`);
    }

    const $ = cheerio.load(response.data);
    const results: VisaData[] = [];
    
    const categories = ['1st', '2nd', '3rd', 'Other Workers', '4th', 'Certain Religious Workers', '5th Unreserved', '5th Set Aside'];
    const targetCategories = ['EB1', 'EB2', 'EB3'];
    const countries = ['ROW', 'CHINA', 'INDIA', 'MEXICO', 'PHILIPPINES'];
    
    // We are primarily targeting EB1, EB2, EB3 for INDIA, CHINA and ROW (All Chargeability Areas)
    // Map table row headings to standard categories:
    const categoryMap: { [key: string]: string } = {
        '1st': 'EB1',
        '2nd': 'EB2',
        '3rd': 'EB3',
    };

    const finalActionMap: { [key: string]: any } = {};
    const datesForFilingMap: { [key: string]: any } = {};

    // Note: A robust implementation in reality requires examining Table headers
    // because the DOS changes their HTML structure often.
    // For this demonstration, we look for <table> elements containing "Employment"
    // and grab the first table as Final Action, and the second as Dates For Filing.

    const employmentTables: any[] = [];

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
