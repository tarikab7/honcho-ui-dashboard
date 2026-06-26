const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const { execSync } = require('child_process');

const html = fs.readFileSync('index.html', 'utf8');

// Extract cachedTimeFormatter initialization and formatTimeOnly function
const formatterMatch = html.match(/const\s+cachedTimeFormatter\s*=\s*new\s+Intl\.DateTimeFormat\([^)]*\)\s*;/);
const functionMatch = html.match(/function\s+formatTimeOnly\s*\([^)]*\)\s*{[\s\S]*?cachedTimeFormatter\.format[^}]*}/);

if (!formatterMatch) {
    throw new Error('Could not find cachedTimeFormatter in index.html');
}
if (!functionMatch) {
    throw new Error('Could not find formatTimeOnly function in index.html');
}

// Evaluate both in a single scope
const formatTimeOnly = new Function(`
    ${formatterMatch[0]}
    ${functionMatch[0]}
    return formatTimeOnly;
`)();

test('formatTimeOnly unit tests', async (t) => {
    await t.test('returns empty string for falsy values', () => {
        assert.strictEqual(formatTimeOnly(''), '');
        assert.strictEqual(formatTimeOnly(null), '');
        assert.strictEqual(formatTimeOnly(undefined), '');
    });

    await t.test('returns empty string for invalid dates', () => {
        assert.strictEqual(formatTimeOnly('not-a-date'), '');
        assert.strictEqual(formatTimeOnly('2023-13-45T25:99:99Z'), '');
    });
});

test('formatTimeOnly timezone integration tests', () => {
    // We test timezone behavior by spawning a child process with a specific TZ.
    // This avoids the V8 caching issue for date formatting within a single process.

    // Create a small script that loads the function and runs it.
    const runnerScript = `
        const html = require('fs').readFileSync('index.html', 'utf8');
        const formatterMatch = html.match(/const\\s+cachedTimeFormatter\\s*=\\s*new\\s+Intl\\.DateTimeFormat\\([^)]*\\)\\s*;/);
        const functionMatch = html.match(/function\\s+formatTimeOnly\\s*\\([^)]*\\)\\s*{[\\s\\S]*?cachedTimeFormatter\\.format[^}]*}/);
        const formatTimeOnly = new Function(\`
            \${formatterMatch[0]}
            \${functionMatch[0]}
            return formatTimeOnly;
        \`)();
        const res = formatTimeOnly(process.argv[2]);
        // Node 18+ may use U+202F (Narrow No-Break Space) before AM/PM. Replace it with a regular space to make assertions simpler.
        console.log(res.replace(/\\u202F/g, ' '));
    `;
    fs.writeFileSync('.test-runner.js', runnerScript);

    try {
        const runInTz = (tz, dateString) => {
            const output = execSync(`node .test-runner.js "${dateString}"`, {
                env: { ...process.env, TZ: tz },
                encoding: 'utf8'
            });
            return output.trim();
        };

        assert.strictEqual(runInTz('UTC', '2023-10-10T15:30:00Z'), '3:30 PM');
        assert.strictEqual(runInTz('America/New_York', '2023-10-10T15:30:00Z'), '11:30 AM');
    } finally {
        // Clean up
        if (fs.existsSync('.test-runner.js')) {
            fs.unlinkSync('.test-runner.js');
        }
    }
});
