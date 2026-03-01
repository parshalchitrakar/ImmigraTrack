"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchWithRetry = exports.delay = exports.getRandomUserAgent = exports.USER_AGENTS = void 0;
const axios_1 = __importDefault(require("axios"));
exports.USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/121.0'
];
const getRandomUserAgent = () => {
    return exports.USER_AGENTS[Math.floor(Math.random() * exports.USER_AGENTS.length)];
};
exports.getRandomUserAgent = getRandomUserAgent;
const delay = (ms) => new Promise(res => setTimeout(res, ms));
exports.delay = delay;
const fetchWithRetry = async (url, retries = 3, backoff = 2000) => {
    for (let i = 0; i < retries; i++) {
        try {
            console.log(`Fetching ${url} (Attempt ${i + 1}/${retries})...`);
            // Add a small delay between requests to avoid parallel spam
            await (0, exports.delay)(backoff);
            const response = await axios_1.default.get(url, {
                headers: {
                    'User-Agent': (0, exports.getRandomUserAgent)(),
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.5',
                },
                timeout: 10000, // 10s timeout protection
            });
            return response;
        }
        catch (error) {
            console.error(`Attempt ${i + 1} failed for ${url}: ${error.message}`);
            if (i === retries - 1)
                return null;
            await (0, exports.delay)(backoff * (i + 1)); // Exponential backoff
        }
    }
    return null;
};
exports.fetchWithRetry = fetchWithRetry;
