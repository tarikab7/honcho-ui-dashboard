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
        // Mock Intl.DateTimeFormat
        const originalIntl = dom.window.Intl;
        dom.window.Intl = {
            DateTimeFormat: jest.fn().mockImplementation(function (locales, options) {
                return {
                    format: jest.fn().mockImplementation((date) => {
                        // Return predictable string based on options
                        if (options && options.month === 'long') {
                            return 'June 11, 2026';
                        }
                        if (options && options.hour === 'numeric') {
                            return '5:10 PM';
                        }
                        return 'Formatted Date';
                    })
                };
            })
        };

        // We also need to mock cached formatters in JSDOM window since they are evaluated on load
        dom.window.cachedDateFormatter = new dom.window.Intl.DateTimeFormat('en-US', { month: 'long' });
        dom.window.cachedTimeFormatter = new dom.window.Intl.DateTimeFormat('en-US', { hour: 'numeric' });

        const result = formatDateTime('2026-06-11T17:10:00Z');

        expect(result).toBe('June 11, 2026 at 5:10 PM');

        // Restore Intl
        dom.window.Intl = originalIntl;
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
