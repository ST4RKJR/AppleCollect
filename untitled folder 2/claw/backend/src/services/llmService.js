const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || 'MOCK_KEY_FOR_TESTING'
});

/**
 * Analyzes an array of raw feedback items, categorizes, groups them, and determines if human review is needed.
 * @param {Array<string>} feedbackItems 
 * @returns {Promise<Object>}
 */
async function analyzeFeedbackWithLLM(feedbackItems) {
    if (!process.env.GEMINI_API_KEY) {
        console.warn("No GEMINI_API_KEY provided. Using mock analysis.");
        return getMockAnalysisResponse(feedbackItems.length);
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
        throw new Error("Failed to analyze feedback using LLM.");
    }
}

/**
 * Generates a structured PRD based on grouped feedback.
 * @param {Array<Object>} groupedFeedback 
 * @returns {Promise<string>}
 */
async function generatePRDWithLLM(groupedFeedback) {
    if (!process.env.GEMINI_API_KEY) {
        console.warn("No GEMINI_API_KEY provided. Using mock PRD.");
        return getMockPRDResponse();
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
        throw new Error("Failed to generate PRD using LLM.");
    }
}


// --- Mock Responses for ease of testing ---

function getMockAnalysisResponse(totalCount) {
    return {
        summary: {
            totalItems: totalCount,
            bugs: 2,
            featureRequests: 3,
            complaints: 1,
            praise: 1
        },
        groupedFeedback: [
            {
                id: "g1",
                category: "Feature Request",
                topic: "Dark Mode UI",
                description: "Users are requesting a dark mode theme for better nighttime visibility.",
                priority: "High",
                count: 12
            },
            {
                id: "g2",
                category: "Bug",
                topic: "Login Button Unresponsive",
                description: "The login button sometimes requires double clicks to work.",
                priority: "High",
                count: 5
            },
            {
                id: "g3",
                category: "Complaint",
                topic: "Slow Dashboard Loading",
                description: "The main dashboard takes too long to load data.",
                priority: "Medium",
                count: 8
            }
        ],
        humanReviewRequired: [
            {
                originalText: "It just doesn't feel right sometimes when I use it.",
                reason: "Extremely vague description, unable to identify specific issue or category."
            }
        ]
    };
}

function getMockPRDResponse() {
    return `# Product Requirements Document

## 1. Executive Summary
Based on recent customer feedback, this PRD outlines critical updates required for the platform. The primary focus is on resolving high-priority login issues, improving overall performance, and introducing highly requested features such as Dark Mode.

## 2. Key Objectives
* Resolve user login friction.
* Increase user satisfaction by implementing Dark Mode.
* Decrease dashboard load times by at least 30%.

## 3. Features & Enhancements
* **Dark Mode UI**: Implement a system-wide dark theme toggle.

## 4. Bug Fixes
* **Login Button**: Fix the event listener bug causing the login button to require multiple clicks.

## 5. User Pain Points
* **Dashboard Performance**: Users find the dashboard too slow, directly impacting their workflow.

## 6. Success Metrics
* 0% bug reports related to login after deployment.
* 40% adoption rate of Dark Mode within the first week.
* Average dashboard load time under 2 seconds.`;
}


module.exports = {
    analyzeFeedbackWithLLM,
    generatePRDWithLLM
};
