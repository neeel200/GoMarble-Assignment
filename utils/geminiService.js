const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv")
dotenv.config({ path: ".env" });

const callGeminiAPI = async (htmlChunk) => {

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);


    const generationConfig = {
        temperature: 0.2,
        topP: 0.9,
        topK: 64,
    };
    const model = genAI.getGenerativeModel({
        model: process.env.GEMINI_MODEL,
        generationConfig: generationConfig
    });


    const prompt = ` With no explanations Return CSS selectors for each review container ( which encapsulates review elements for one review ) and review elements inside such as title, body, rating, reviewer name, and the current selected page navigator class (found at the bottom of each page) and optionally if there is any button or link for see all reviews then get its selector also. If any element is not present, set its field's value to an empty string. Provide the result in the following JSON format:
    {
      "reviewContainer": "",
      "reviewTitle": "",
      "reviewBody": "",
      "reviewRating": "",
      "reviewerName": "",
      "selectedPageNavigator": "",
      "seeAllReviews": ""
    }
   html:  ${htmlChunk}  
    `;

    let result = await model.generateContent(prompt);
    result = result.response.text();
    if (result.includes("```json")) {

        const tempResponse = result.replace(/\`\`\`json\n|\`\`\`/g, '');
        var cleanResponse = JSON.parse(tempResponse);

    }

    return cleanResponse
};

module.exports = {callGeminiAPI};