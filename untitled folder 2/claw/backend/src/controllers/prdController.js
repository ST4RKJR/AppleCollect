const { generatePRDWithLLM } = require('../services/llmService');

async function generatePRD(req, res, next) {
    try {
        const { groupedFeedback } = req.body;

        if (!groupedFeedback || !Array.isArray(groupedFeedback)) {
            return res.status(400).json({ status: 'error', message: 'Invalid or missing grouped feedback data.' });
        }

        const prdContent = await generatePRDWithLLM(groupedFeedback);

        res.status(200).json({
            status: 'success',
            data: {
                prdContent
            }
        });
        
    } catch (error) {
        next(error);
    }
}

module.exports = {
    generatePRD
};
