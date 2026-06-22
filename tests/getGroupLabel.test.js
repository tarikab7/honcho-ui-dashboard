const fs = require('fs');
const path = require('path');

describe('getGroupLabel', () => {
    let getGroupLabel;

    beforeAll(() => {
        const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf-8');

        const startIndex = html.indexOf('function getGroupLabel(isoString) {');
        const endIndex = html.indexOf('function formatTimeOnly(isoString) {');
        let code = html.substring(startIndex, endIndex);
        code = code.substring(0, code.lastIndexOf('}') + 1);

        // Expose function properly by wrapping in an eval
        getGroupLabel = eval('(' + code + ')');
    });

    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('returns "Today" for the current date', () => {
        const mockDate = new Date('2023-10-15T12:00:00Z');
        jest.setSystemTime(mockDate);

        expect(getGroupLabel('2023-10-15T10:00:00Z')).toBe('Today');
    });

    it('returns "Yesterday" for the previous date', () => {
        const mockDate = new Date('2023-10-15T12:00:00Z');
        jest.setSystemTime(mockDate);

        expect(getGroupLabel('2023-10-14T10:00:00Z')).toBe('Yesterday');
    });

    it('returns formatted date for older dates', () => {
        const mockDate = new Date('2023-10-15T12:00:00Z');
        jest.setSystemTime(mockDate);

        expect(getGroupLabel('2023-10-10T10:00:00Z')).toBe('October 10, 2023');
    });

    it('returns "Unknown Date" for invalid date strings', () => {
        expect(getGroupLabel('invalid-date')).toBe('Unknown Date');
    });

    it('returns "Unknown Date" for null or undefined', () => {
        expect(getGroupLabel(null)).toBe('Unknown Date');
        expect(getGroupLabel(undefined)).toBe('Unknown Date');
        expect(getGroupLabel('')).toBe('Unknown Date');
    });
});
