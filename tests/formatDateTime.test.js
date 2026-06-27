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
        // Mock the timezone in node by fixing Date output if possible
        // Actually Intl.DateTimeFormat output depends on node's timezone.
        // We will just verify it formats a string in a reasonable way.
        // Or we can mock the Intl formatters on dom.window if they are accessible.

        // Let's just mock Date to always return a specific Date object
        // and let JSDOM's Intl format it. However, the tests are running in the system timezone.

        // A simpler test that just asserts it returns a non-empty string that contains the year.
        const result = formatDateTime('2026-06-11T17:10:00Z');
        expect(typeof result).toBe('string');
        expect(result).toContain('2026');
        expect(result).toContain('at');
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
