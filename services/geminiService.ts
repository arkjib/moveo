
import { GoogleGenAI } from "@google/genai";

// Assume API_KEY is set in the environment.
const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  console.warn("Gemini API key not found. AI features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const generateMarketingDescription = async (
  source: string,
  destination: string,
  priceFirst: number,
  priceEconomy: number
): Promise<string> => {
  if (!API_KEY) throw new Error("API key not configured.");
  
  const priceRange = `Economy class starts at ₹${priceEconomy.toFixed(0)} and First Class is ₹${priceFirst.toFixed(0)}.`;
  const prompt = `Write a short, engaging, 2-3 sentence marketing description for a new railway service traveling from ${source} to ${destination}. Highlight the comfort and the convenient travel time. Use the price range information: ${priceRange}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a creative marketing copywriter for a premium railway company. Your tone should be persuasive and exciting.",
      }
    });
    return response.text.trim();
  } catch (error) {
    console.error("Gemini API Error (Marketing Description):", error);
    throw new Error("Failed to generate marketing description.");
  }
};

export interface ItineraryResult {
    text: string;
    sources: string[];
}

export const generateItinerary = async (
  destination: string,
  date: string
): Promise<ItineraryResult> => {
  if (!API_KEY) throw new Error("API key not configured.");

  const prompt = `Act as a helpful travel guide. Based on the current date, suggest a concise, 3-point itinerary for a traveler arriving in ${destination} on ${date}. Focus on must-see sights or activities relevant to the local area. Format the output as a numbered list with bold point titles.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{googleSearch: {}}],
      },
    });

    const candidate = response.candidates?.[0];
    const text = response.text;
    
    let sources: string[] = [];
    const groundingChunks = candidate?.groundingMetadata?.groundingChunks;
    if (groundingChunks) {
        sources = groundingChunks
            .map(chunk => chunk.web?.title || chunk.web?.uri)
            .filter((s): s is string => !!s)
            .slice(0, 3); // Limit to 3 sources
    }

    if (!text) {
        throw new Error("Received an empty response from the model.");
    }
    
    return { text, sources };
  } catch (error) {
    console.error("Gemini API Error (Itinerary):", error);
    throw new Error("Failed to generate itinerary.");
  }
};
