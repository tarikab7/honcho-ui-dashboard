const fs = require('fs');
const test = require('node:test');
const assert = require('node:assert');

// Read the HTML file and extract the formatTimeAgo function using regex
const htmlContent = fs.readFileSync('index.html', 'utf8');

// Extract the formatTimeAgo function using regex
const match = htmlContent.match(/function formatTimeAgo\(isoString\) \{[\s\S]*?\n\s*return 'Just now';\n\s*\}/);

if (!match) {
    throw new Error('Could not find formatTimeAgo function in index.html');
}

// Evaluate the function in the current scope
eval(match[0]);

test('formatTimeAgo handles empty, null, and invalid dates', () => {
    assert.strictEqual(formatTimeAgo(''), '-');
    assert.strictEqual(formatTimeAgo(null), '-');
    assert.strictEqual(formatTimeAgo(undefined), '-');
    assert.strictEqual(formatTimeAgo('invalid-date-string'), '-');
});

test('formatTimeAgo handles relative times correctly', (t) => {
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
        assert.strictEqual(formatTimeAgo('2024-01-01T12:00:00.000Z'), 'Just now');
        assert.strictEqual(formatTimeAgo('2024-01-01T11:59:50.000Z'), 'Just now');

        // Future date (handled as Just now)
        assert.strictEqual(formatTimeAgo('2024-01-01T12:01:00.000Z'), 'Just now');

        // Minutes
        assert.strictEqual(formatTimeAgo('2024-01-01T11:59:00.000Z'), '1 minute ago');
        assert.strictEqual(formatTimeAgo('2024-01-01T11:50:00.000Z'), '10 minutes ago');

        // Hours
        assert.strictEqual(formatTimeAgo('2024-01-01T11:00:00.000Z'), '1 hour ago');
        assert.strictEqual(formatTimeAgo('2024-01-01T09:00:00.000Z'), '3 hours ago');

        // Days
        assert.strictEqual(formatTimeAgo('2023-12-31T12:00:00.000Z'), '1 day ago');
        assert.strictEqual(formatTimeAgo('2023-12-28T12:00:00.000Z'), '4 days ago');

        // Months
        assert.strictEqual(formatTimeAgo('2023-12-01T12:00:00.000Z'), '1 month ago');
        assert.strictEqual(formatTimeAgo('2023-08-01T12:00:00.000Z'), '5 months ago');

        // Years
        assert.strictEqual(formatTimeAgo('2023-01-01T12:00:00.000Z'), '1 year ago');
        assert.strictEqual(formatTimeAgo('2020-01-01T12:00:00.000Z'), '4 years ago');

    } finally {
        // Restore original Date
        global.Date = originalDate;
    }
});
