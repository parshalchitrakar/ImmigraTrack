import cron from 'node-cron';
import { scrapeVisaBulletin } from '../scrapers/visaScraper';
import { scrapeDolPerm } from '../scrapers/dolScraper';
import { insertVisaData } from '../services/visaService';
import { query } from '../config/db';

export const startCronJobs = () => {
    // Run at 2:00 AM on the 10th of every month (Visa Bulletin usually releases mid-month)
    cron.schedule('0 2 10 * *', async () => {
        try {
            console.log('Running Monthly Visa Bulletin Scraper Job...');
            
            // Constructing URL for the upcoming month. 
            // In reality, DOS URLs are tricky (e.g., visa-bulletin-for-may-2024.html)
            const date = new Date();
            date.setMonth(date.getMonth() + 1); // Bulletins are for the next month
            const monthName = date.toLocaleString('default', { month: 'long' }).toLowerCase();
            const year = date.getFullYear();
            
            const url = `https://travel.state.gov/content/travel/en/legal/visa-law0/visa-bulletin/${year}/visa-bulletin-for-${monthName}-${year}.html`;
            
            const visaRecords = await scrapeVisaBulletin(url, date);
            
            let insertedCount = 0;
            for (const record of visaRecords) {
                const inserted = await insertVisaData(record);
                if (inserted) insertedCount++;
            }
            console.log(`Visa Bulletin Scrape complete. Inserted ${insertedCount} new records.`);
        } catch (error) {
            console.error('Error in Visa Bulletin Cron Job:', error);
        }
    });

    // Run at 2:30 AM on the 10th of every month for DOL
    cron.schedule('30 2 10 * *', async () => {
        try {
            console.log('Running Monthly DOL Scraper Job...');
            const dolData = await scrapeDolPerm();

            // Insert into dol_processing_history
            await query(
                `INSERT INTO dol_processing_history 
                 (analyst_review_month, audit_review_month, pwd_month, update_month)
                 VALUES ($1, $2, $3, $4)
                 ON CONFLICT (update_month) DO NOTHING`,
                [dolData.analyst_review_month, dolData.audit_review_month, dolData.pwd_month, dolData.update_month]
            );
            console.log(`DOL Scrape complete.`);
        } catch (error) {
            console.error('Error in DOL Cron Job:', error);
        }
    });
};
