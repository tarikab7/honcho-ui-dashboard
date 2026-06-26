const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

describe('escapeHtml', () => {
    let escapeHtml;

    let dom;

    beforeAll(() => {
        const html = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf8');
        dom = new JSDOM(html, {
            runScripts: "dangerously",
            beforeParse(window) {
                // Mock fetch to prevent errors from checkApiHealth running on load
                window.fetch = jest.fn(() => Promise.resolve({
                    json: () => Promise.resolve({ status: 'ok' }),
                    ok: true
                }));
            }
        });
        escapeHtml = dom.window.escapeHtml;
    });

    afterAll(() => {
        // Clear all timers just in case to prevent jest hanging
        dom.window.close();
    });

    test('escapes HTML tags properly', () => {
        expect(escapeHtml('<script>alert("XSS")</script>')).toBe('&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;');
    });

    test('escapes ampersands', () => {
        expect(escapeHtml('foo & bar')).toBe('foo &amp; bar');
    });

    test('escapes single and double quotes', () => {
        expect(escapeHtml(`'single' and "double"`)).toBe('&#039;single&#039; and &quot;double&quot;');
    });

    test('leaves safe strings unmodified', () => {
        expect(escapeHtml('Hello World!')).toBe('Hello World!');
    });

    test('handles empty string', () => {
        expect(escapeHtml('')).toBe('');
    });

    test('handles null and undefined gracefully', () => {
        expect(escapeHtml(null)).toBe('');
        expect(escapeHtml(undefined)).toBe('');
    });

    test('handles non-string types safely', () => {
        expect(escapeHtml(12345)).toBe('12345');
        expect(escapeHtml(true)).toBe('true');
    });
});
