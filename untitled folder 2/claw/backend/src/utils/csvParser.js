/**
 * Extremely basic CSV parser for the student project scope.
 * Splits by newline and assumes each line is a feedback item.
 * For a real project, we'd use a library like `csv-parse`.
 * @param {string} csvString 
 * @returns {Array<string>}
 */
function parseCSV(csvString) {
    if (!csvString) return [];
    
    // Split by new line, remove empty lines
    const lines = csvString.split(/\r?\n/).filter(line => line.trim() !== '');
    
    // If it has a header like "Feedback", remove it
    if (lines.length > 0 && lines[0].toLowerCase().includes('feedback')) {
        lines.shift();
    }
    
    return lines;
}

module.exports = { parseCSV };
