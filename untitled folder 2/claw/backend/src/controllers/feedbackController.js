const { analyzeFeedbackWithLLM } = require('../services/llmService');
const { parseCSV } = require('../utils/csvParser');

async function analyzeFeedback(req, res, next) {
    try {
        const { sourceType, content } = req.body;
        let feedbackItems = [];

        if (sourceType === 'csv' && req.file) {
            // Read from multer memory buffer
            const csvString = req.file.buffer.toString('utf-8');
            feedbackItems = parseCSV(csvString);
        } else if (sourceType === 'text' && content) {
            // Split raw text by newlines assuming each line is an item, or just pass as one big item if not structured
            feedbackItems = content.split(/\r?\n/).filter(line => line.trim() !== '');
        } else {
            return res.status(400).json({ status: 'error', message: 'Invalid input data.' });
        }

        if (feedbackItems.length === 0) {
            return res.status(400).json({ status: 'error', message: 'No valid feedback found to analyze.' });
        }

        // Call the LLM reasoning engine
        const analysisResult = await analyzeFeedbackWithLLM(feedbackItems);

        res.status(200).json({
            status: 'success',
            data: analysisResult
        });
        
    } catch (error) {
        next(error);
    }
}

module.exports = {
    analyzeFeedback
};
