import * as cheerio from 'cheerio';
import { fetchWithRetry } from './utils';

export interface DolData {
    analyst_review_month: Date;
    audit_review_month: Date;
    pwd_month: Date;
    update_month: Date;
}

const parseDolDate = (dateStr: string): Date => {
    // Expected format 'Month Year' e.g. 'November 2022'
    const parsed = new Date(`${dateStr} 1`);
    if (isNaN(parsed.getTime())) {
        return new Date(); // Fallback, but in reality we'd log an error
    }
    return parsed;
};

export const scrapeDolPerm = async (url: string = 'https://flag.dol.gov/processingtimes'): Promise<DolData> => {
    const response = await fetchWithRetry(url);
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
    } else {
        // Fallback to today's month if the scraped date can't be parsed
        updateMonth = new Date();
    }

    // Try finding the row or definition for PERM
    $('td, th, dt, dd, p').each((i, element) => {
        const _text = $(element).text().toLowerCase().trim();
        // Look for next element's text if the current element is a label
        if (_text.includes('analyst review')) {
            const nextNodeText = $(element).next().text().trim() || $(element).parent().find('td').eq(1).text().trim();
            if (nextNodeText) analystReviewMonth = parseDolDate(nextNodeText);
        }
        if (_text.includes('audit review')) {
            const nextNodeText = $(element).next().text().trim() || $(element).parent().find('td').eq(1).text().trim();
            if (nextNodeText) auditReviewMonth = parseDolDate(nextNodeText);
        }
        if (_text.includes('prevailing wage') && _text.includes('perm')) {
            const nextNodeText = $(element).next().text().trim() || $(element).parent().find('td').eq(1).text().trim();
            if (nextNodeText) pwdMonth = parseDolDate(nextNodeText);
        }
    });

    return {
        analyst_review_month: analystReviewMonth,
        audit_review_month: auditReviewMonth,
        pwd_month: pwdMonth,
        update_month: updateMonth
    };
};
