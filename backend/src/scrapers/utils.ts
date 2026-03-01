import axios, { AxiosResponse } from 'axios';
import * as cheerio from 'cheerio';

export const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/121.0'
];

export const getRandomUserAgent = () => {
    return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
};

export const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const fetchWithRetry = async (url: string, retries = 3, backoff = 2000): Promise<AxiosResponse | null> => {
    for (let i = 0; i < retries; i++) {
        try {
            console.log(`Fetching ${url} (Attempt ${i + 1}/${retries})...`);
            // Add a small delay between requests to avoid parallel spam
            await delay(backoff);
            
            const response = await axios.get(url, {
                headers: {
                    'User-Agent': getRandomUserAgent(),
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.5',
                },
                timeout: 10000, // 10s timeout protection
            });
            return response;
        } catch (error: any) {
            console.error(`Attempt ${i + 1} failed for ${url}: ${error.message}`);
            if (i === retries - 1) return null;
            await delay(backoff * (i + 1)); // Exponential backoff
        }
    }
    return null;
};
