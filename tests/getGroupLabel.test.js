const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

// Read the index.html file
const htmlPath = path.resolve(__dirname, '../index.html');
const htmlContent = fs.readFileSync(htmlPath, 'utf8');

const virtualConsole = new (require('jsdom')).VirtualConsole();

// Expose getGroupLabel to the JSDOM window
const modifiedHtmlContent = htmlContent.replace(
    'function getGroupLabel(isoString) {',
    'window.getGroupLabel = function getGroupLabel(isoString) {'
).replace(
    'const cachedDateFormatter = new Intl.DateTimeFormat',
    'window.cachedDateFormatter = new Intl.DateTimeFormat'
);

const dom = new JSDOM(modifiedHtmlContent, { runScripts: "dangerously", virtualConsole });

// Get the getGroupLabel function from the JSDOM window
const getGroupLabel = dom.window.getGroupLabel;

if (typeof getGroupLabel !== 'function') {
    throw new Error('Could not find getGroupLabel function in JSDOM window');
}

describe('getGroupLabel', () => {
    let originalDate;

    beforeEach(() => {
        originalDate = dom.window.Date;
    });

    afterEach(() => {
        dom.window.Date = originalDate;
    });

    it('handles empty, null, and invalid dates', () => {
        expect(getGroupLabel('')).toBe('Unknown Date');
        expect(getGroupLabel(null)).toBe('Unknown Date');
        expect(getGroupLabel(undefined)).toBe('Unknown Date');
        expect(getGroupLabel('invalid-date-string')).toBe('Unknown Date');
    });

    it('correctly identifies Today, Yesterday, and Older dates', () => {
        // Fix the current date to a specific point in time
        const FIXED_TIME = '2024-01-02T12:00:00.000Z'; // Tuesday
        const fixedTimestamp = new originalDate(FIXED_TIME).getTime();

        // Mock Date object to always return the FIXED_TIME when instantiated without arguments
        class MockDate extends originalDate {
            constructor(...args) {
                if (args.length === 0) {
                    super(fixedTimestamp);
                } else {
                    super(...args);
                }
            }
        }

        dom.window.Date = MockDate;

        // Today
        expect(getGroupLabel('2024-01-02T12:00:00.000Z')).toBe('Today');
        expect(getGroupLabel('2024-01-02T23:59:59.000Z')).toBe('Today');
        expect(getGroupLabel('2024-01-02T00:00:00.000Z')).toBe('Today');

        // Yesterday
        expect(getGroupLabel('2024-01-01T12:00:00.000Z')).toBe('Yesterday');
        expect(getGroupLabel('2024-01-01T23:59:59.000Z')).toBe('Yesterday');
        expect(getGroupLabel('2024-01-01T00:00:00.000Z')).toBe('Yesterday');

        // Older Dates (should format using cachedDateFormatter)
        // Since we are running in JSDOM, we need to extract how it handles the formatter
        const formatOutput = (dateStr) => {
             // Re-create what the formatter would output internally.
             // We can use the mock's originalDate functionality.
             return dom.window.cachedDateFormatter.format(new originalDate(dateStr));
        };

        expect(getGroupLabel('2023-12-31T12:00:00.000Z')).toBe(formatOutput('2023-12-31T12:00:00.000Z'));
        expect(getGroupLabel('2020-05-15T12:00:00.000Z')).toBe(formatOutput('2020-05-15T12:00:00.000Z'));
    });
});
