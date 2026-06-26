const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const htmlPath = path.join(__dirname, 'index.html');
const htmlContent = fs.readFileSync(htmlPath, 'utf-8');

// Mock fetch to prevent errors when loading the JSDOM
// Also mock getHonchoApiUrl just in case
const dom = new JSDOM(htmlContent, {
    runScripts: "dangerously",
    beforeParse(window) {
        window.fetch = jest.fn(() => Promise.resolve({
            json: () => Promise.resolve({}),
            ok: true
        }));

        // Mock marked
        window.marked = {
            parse: jest.fn((md) => {
                if (!md) return '';
                let result = md.trim();

                // Basic Markdown parsing for tests
                // Lists
                if (result.includes('- ')) {
                    let listMatch = result.match(/(?:^- .*(?:\n|$)+)+/gm);
                    if (listMatch) {
                        listMatch.forEach(match => {
                            const listItems = match.split('\n')
                                .filter(line => line.trim().startsWith('- '))
                                .map(line => line.replace(/^- (.*)/, '<li>$1</li>'))
                                .join('\n');
                            result = result.replace(match, `<ul>${listItems}\n</ul>`);
                        });
                    }
                }

                // Headings
                result = result.replace(/^### (.*$)/gim, '<h3>$1</h3>');
                result = result.replace(/^## (.*$)/gim, '<h2>$1</h2>');
                result = result.replace(/^# (.*$)/gim, '<h1>$1</h1>');

                // Bold
                result = result.replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>');

                // Paragraphs (if not heading or list)
                result = result.split('\n\n').map(part => {
                    if (part.startsWith('<h') || part.startsWith('<ul>')) return part;
                    return `<p>${part.replace(/\n/g, '<br>')}</p>`;
                }).join('\n');

                return result;
            })
        };

        // Mock DOMPurify
        window.DOMPurify = {
            sanitize: jest.fn((html) => html)
        };
    }
});
const parseMarkdown = dom.window.parseMarkdown;

describe('parseMarkdown', () => {
    afterAll(() => {
        // Clear all timers just in case to prevent jest hanging
        dom.window.close();
    });

    test('handles null or empty string', () => {
        expect(parseMarkdown('')).toBe('');
        expect(parseMarkdown(null)).toBe('');
        expect(parseMarkdown(undefined)).toBe('');
    });

    test('parses headings', () => {
        expect(parseMarkdown('# Heading 1')).toBe('<h1>Heading 1</h1>');
        expect(parseMarkdown('## Heading 2')).toBe('<h2>Heading 2</h2>');
        expect(parseMarkdown('### Heading 3')).toBe('<h3>Heading 3</h3>');
    });

    test('parses bold text', () => {
        expect(parseMarkdown('This is **bold** text')).toBe('<p>This is <strong>bold</strong> text</p>');
    });

    test('parses paragraphs', () => {
        expect(parseMarkdown('Paragraph 1\n\nParagraph 2')).toBe('<p>Paragraph 1</p>\n<p>Paragraph 2</p>');
    });

    test('parses lists', () => {
        const markdownList = `- Item 1\n- Item 2\n- Item 3`;
        expect(parseMarkdown(markdownList)).toBe('<ul><li>Item 1</li>\n<li>Item 2</li>\n<li>Item 3</li>\n</ul>');
    });

    test('parses mixed content', () => {
        const markdown = `# Title\n\nSome **bold** text.\n\n- List 1\n- List 2`;
        const expected = `<h1>Title</h1>\n<p>Some <strong>bold</strong> text.</p>\n<ul><li>List 1</li>\n<li>List 2</li>\n</ul>`;
        expect(parseMarkdown(markdown)).toBe(expected);
    });

    test('strips leading and trailing newlines', () => {
        expect(parseMarkdown('\n\n# Heading\n\n')).toBe('<h1>Heading</h1>');
    });

    test('converts newlines to <br> in paragraphs', () => {
        expect(parseMarkdown('Line 1\nLine 2')).toBe('<p>Line 1<br>Line 2</p>');
    });

    test('handles empty lines inside lists without breaking the list', () => {
        const markdownList = `- Item 1\n\n- Item 2`;
        expect(parseMarkdown(markdownList)).toBe('<ul><li>Item 1</li>\n<li>Item 2</li>\n</ul>');
    });
});
