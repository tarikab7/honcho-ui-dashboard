const fs = require('fs');

// Read the HTML file and extract the formatTimeAgo function using regex
const htmlContent = fs.readFileSync('index.html', 'utf8');

// Extract the formatTimeAgo function using regex
const match = htmlContent.match(/function formatTimeAgo\(isoString\) \{[\s\S]*?\n\s*return 'Just now';\n\s*\}/);

if (!match) {
    throw new Error('Could not find formatTimeAgo function in index.html');
}

// Evaluate the function in the current scope
eval(match[0]);

describe('formatTimeAgo', () => {
    it('handles empty, null, and invalid dates', () => {
        expect(formatTimeAgo('')).toBe('-');
        expect(formatTimeAgo(null)).toBe('-');
        expect(formatTimeAgo(undefined)).toBe('-');
        expect(formatTimeAgo('invalid-date-string')).toBe('-');
    });

    it('handles relative times correctly', () => {
        const originalDate = global.Date;

        // Fix the current date to a specific point in time
        const FIXED_TIME = '2024-01-01T12:00:00.000Z';
        const fixedTimestamp = new originalDate(FIXED_TIME).getTime();

        global.Date = class extends originalDate {
            constructor(...args) {
                if (args.length === 0) {
                    super(fixedTimestamp);
                } else {
                    super(...args);
                }
            }
        };

        try {
            // Just now
            expect(formatTimeAgo('2024-01-01T12:00:00.000Z')).toBe('Just now');
            expect(formatTimeAgo('2024-01-01T11:59:50.000Z')).toBe('Just now');

            // Future date (handled as Just now)
            expect(formatTimeAgo('2024-01-01T12:01:00.000Z')).toBe('Just now');

            // Minutes
            expect(formatTimeAgo('2024-01-01T11:59:00.000Z')).toBe('1 minute ago');
            expect(formatTimeAgo('2024-01-01T11:50:00.000Z')).toBe('10 minutes ago');

            // Hours
            expect(formatTimeAgo('2024-01-01T11:00:00.000Z')).toBe('1 hour ago');
            expect(formatTimeAgo('2024-01-01T09:00:00.000Z')).toBe('3 hours ago');

            // Days
            expect(formatTimeAgo('2023-12-31T12:00:00.000Z')).toBe('1 day ago');
            expect(formatTimeAgo('2023-12-28T12:00:00.000Z')).toBe('4 days ago');

            // Months
            expect(formatTimeAgo('2023-12-01T12:00:00.000Z')).toBe('1 month ago');
            expect(formatTimeAgo('2023-08-01T12:00:00.000Z')).toBe('5 months ago');

            // Years
            expect(formatTimeAgo('2023-01-01T12:00:00.000Z')).toBe('1 year ago');
            expect(formatTimeAgo('2020-01-01T12:00:00.000Z')).toBe('4 years ago');

        } finally {
            // Restore original Date
            global.Date = originalDate;
        }
    });
});
