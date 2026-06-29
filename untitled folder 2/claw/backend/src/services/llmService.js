const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

/**
 * Analyzes an array of raw feedback items, categorizes, groups them, and determines if human review is needed.
 * @param {Array<string>} feedbackItems 
 * @returns {Promise<Object>}
 */
async function analyzeFeedbackWithLLM(feedbackItems) {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("Missing GEMINI_API_KEY in backend/.env file. Please add it to enable LLM analysis.");
    }

    try {
        const prompt = `
        You are an expert Product Manager AI.
        I will provide you with a list of customer feedback items.
        Your task is to:
        1. Read each item and classify it as exactly one of: "Bug", "Feature Request", "Complaint", "Praise".
        2. Group similar feedback items together into distinct topics.
        3. For each group, provide:
           - An ID (e.g., "g1", "g2")
           - The category ("Bug", "Feature Request", etc.)
           - A short topic title
           - A summary description of the collective feedback
           - A priority ("High", "Medium", "Low") based on urgency/impact
           - The count of how many items were in this group
        4. If any individual feedback item is too ambiguous, vague, or you have low confidence in its categorization, do NOT group it. Instead, flag it for "humanReviewRequired". Provide the original text and the reason it needs review.

        Feedback items:
        ${JSON.stringify(feedbackItems)}

        Return the result strictly as a valid JSON object with the following schema:
        {
          "summary": { "totalItems": number, "bugs": number, "featureRequests": number, "complaints": number, "praise": number },
          "groupedFeedback": [
            { "id": "string", "category": "string", "topic": "string", "description": "string", "priority": "string", "count": number }
          ],
          "humanReviewRequired": [
            { "originalText": "string", "reason": "string" }
          ]
        }
        `;

        console.log("Calling Gemini API to analyze feedback...");
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                temperature: 0.2
            }
        });
        
        return JSON.parse(response.text);

    } catch (error) {
        console.error("LLM Analysis Error:", error);
        throw new Error("Failed to analyze feedback using LLM. Check server logs.");
    }
}

/**
 * Generates a structured PRD based on grouped feedback.
 * @param {Array<Object>} groupedFeedback 
 * @returns {Promise<string>}
 */
async function generatePRDWithLLM(groupedFeedback) {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("Missing GEMINI_API_KEY in backend/.env file. Please add it to enable PRD generation.");
    }

    try {
        const prompt = `
        You are an expert Product Manager.
        Based on the following categorized and prioritized product feedback, generate a structured Product Requirements Document (PRD).
        
        Grouped Feedback:
        ${JSON.stringify(groupedFeedback)}

        Format the PRD strictly in Markdown with the following sections:
        # Product Requirements Document
        ## 1. Executive Summary
        ## 2. Key Objectives (Derived from High Priority items)
        ## 3. Features & Enhancements (From Feature Requests)
        ## 4. Bug Fixes (From Bugs)
        ## 5. User Pain Points (From Complaints)
        ## 6. Success Metrics
        `;

        console.log("Calling Gemini API to generate PRD...");
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                temperature: 0.4
            }
        });
        
        return response.text;
    } catch (error) {
        console.error("LLM PRD Generation Error:", error);
        throw new Error("Failed to generate PRD using LLM. Check server logs.");
    }
}

module.exports = {
    analyzeFeedbackWithLLM,
    generatePRDWithLLM
};
