
import { GoogleGenAI } from "@google/genai";

const getCountryInfo = async (countryName: string): Promise<string> => {
  if (!process.env.API_KEY) {
    return `API Key not found. Please ensure it is configured. For now, here is a placeholder for ${countryName}. This beautiful country has a rich history and culture.`;
  }
  
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Provide a concise and engaging summary about the country: ${countryName}. Focus on its most notable cultural aspects, unique geography, and one surprising or interesting fact. Keep it to a single, well-written paragraph.`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    
    return response.text;
  } catch (error) {
    console.error(`Error fetching data for ${countryName}:`, error);
    throw new Error('Failed to retrieve information from Gemini API.');
  }
};

export { getCountryInfo };
