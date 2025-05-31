import { GoogleGenerativeAI } from '@google/generative-ai';
import { streamText } from 'ai';
import { google } from '@ai-sdk/google';
import { Recommendation } from './types';
import { generateRecommendationPrompt } from './prompts';

// Handle environment variable name differences
if (process.env.GOOGLE_API_KEY && !process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
  process.env.GOOGLE_GENERATIVE_AI_API_KEY = process.env.GOOGLE_API_KEY;
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

// Legacy function for backward compatibility
export async function getAIRecommendations(
  title1: string, 
  title2: string, 
  title3: string
): Promise<Recommendation[]> {
  const prompt = generateRecommendationPrompt(title1, title2, title3);
  
  const result = await model.generateContent(prompt);
  const response = await result.response;
  let text = response.text();

  // Clean up the response to extract JSON
  text = text.replace(/```json\s*/, '').replace(/```\s*$/, '').trim();
  
  try {
    const parsed = JSON.parse(text);
    return parsed.recommendations || [];
  } catch (parseError) {
    console.error('Error parsing Gemini response:', parseError);
    throw new Error('Failed to parse AI response');
  }
}

// New streaming function optimized for real-time streaming
export async function getStreamingRecommendations(
  title1: string,
  title2: string, 
  title3: string
) {
  // Use a simple, clear prompt that encourages streaming
  const prompt = `Based on these three movies/shows: "${title1}", "${title2}", and "${title3}":

Please provide exactly 5 recommendations. For each recommendation, think out loud about why it matches, then provide the details in this JSON format:

{
  "reasoning": "Your detailed reasoning for why these recommendations work together and what patterns you found...",
  "recommendations": [
    {
      "title": "Movie/Show Title",
      "year": 2023,
      "type": "Movie",
      "brief_reasoning": "2-3 sentences explaining the specific connection",
      "country": "Country of origin",
      "original_language": "ISO language code like 'en', 'ko', 'ja'"
    }
  ]
}

Start with your reasoning, then provide all 5 recommendations. Focus on quality matches with diverse options from different countries and time periods.`;

  try {
    // Use streamText with Gemini 2.0 Flash - this should stream properly
    const result = await streamText({
      model: google('gemini-2.0-flash'),
      prompt,
      // Remove any structured output constraints to allow free-form streaming
      temperature: 0.7,
      maxTokens: 2000,
    });
    
    return result.textStream;
  } catch (error) {
    console.error('Error in streamText call:', error);
    throw error;
  }
} 
