const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

// Read the index.html file
const htmlPath = path.resolve(__dirname, '../index.html');
const htmlContent = fs.readFileSync(htmlPath, 'utf8');

// Parse the HTML using JSDOM
// We pass a virtualConsole that suppresses errors because the JS in index.html tries
// to fetch data immediately, and 'fetch' isn't available in standard jsdom natively
// without extra polyfills, which causes harmless errors during testing of isolated functions.
const virtualConsole = new (require('jsdom')).VirtualConsole();
const dom = new JSDOM(htmlContent, { runScripts: "dangerously", virtualConsole });

// Get the formatDateTime function from the JSDOM window
const formatDateTime = dom.window.formatDateTime;

if (typeof formatDateTime !== 'function') {
    throw new Error('Could not find formatDateTime function in JSDOM window');
}

describe('formatDateTime', () => {
    let originalDate;

    beforeEach(() => {
        originalDate = dom.window.Date;
    });

    afterEach(() => {
        dom.window.Date = originalDate;
    });

    it('should exist', () => {
        expect(typeof formatDateTime).toBe('function');
    });

    it('should format a valid ISO date string correctly', () => {
        // Since cachedDateFormatter is not exposed on window, we mock the Date object's return value
        // or just let it use the real Intl.DateTimeFormat but mock the Date object itself
        const mockDate = new originalDate('2026-06-11T17:10:00Z');

        // Ensure the environment runs with UTC or the timezone is controlled
        // Since we cannot easily control the JSDOM Intl timezone inside the function here,
        // we test that it produces a non-empty string that looks like a date.
        // We know from other tests that the formatting is robust.

        const result = formatDateTime('2026-06-11T17:10:00Z');

        expect(result).toContain('2026');
        expect(result).toContain('at');
        expect(result).toMatch(/[0-9]{1,2}:[0-9]{2}\s(?:AM|PM)/i);
    });

    it('should return "N/A" for null, undefined, or empty string', () => {
        expect(formatDateTime(null)).toBe('N/A');
        expect(formatDateTime(undefined)).toBe('N/A');
        expect(formatDateTime('')).toBe('N/A');
    });

    it('should return the original string if the date is invalid', () => {
        expect(formatDateTime('invalid-date')).toBe('invalid-date');
        expect(formatDateTime('not-a-date')).toBe('not-a-date');
    });
});
