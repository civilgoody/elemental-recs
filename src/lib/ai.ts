import { GoogleGenerativeAI } from '@google/generative-ai';
import { Recommendation } from './types';
import { generateRecommendationPrompt } from './prompts';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

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
