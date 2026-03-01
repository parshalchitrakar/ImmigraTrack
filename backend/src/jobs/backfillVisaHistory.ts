import { scrapeVisaBulletin } from '../scrapers/visaScraper';
import { insertVisaData } from '../services/visaService';
import { delay } from '../scrapers/utils';

export const runVisaBackfill = async (startYear: number, endYear: number) => {
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
                await delay(2000);

                const visaRecords = await scrapeVisaBulletin(url, bulletinMonth);
                let currentMonthInserted = 0;
                for (const record of visaRecords) {
                    const inserted = await insertVisaData(record);
                    if (inserted) currentMonthInserted++;
                }
                totalInserted += currentMonthInserted;
                
                await delay(3000); // Wait another 3s before next iteration
            } catch (err: any) {
                console.error(`Skipping ${monthName} ${year} due to error: ${err.message}`);
                // Continue to the next month instead of failing the whole job
            }
        }
    }
    
    return { success: true, totalInserted };
};
