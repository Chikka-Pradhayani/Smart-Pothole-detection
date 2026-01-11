
import { GoogleGenAI, Type } from "@google/genai";
import { DetectionResult, LocationData } from "../types";
import { MODEL_NAME, SYSTEM_PROMPT } from "../constants";

export const analyzeImage = async (base64Image: string): Promise<DetectionResult> => 
export async function generateText(prompt: string) {
  const res = await fetch('/api/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt })
  });
  if (!res.ok) {
    throw new Error(`Server error: ${res.status}`);
  }
  return res.json();
}

  const data = base64Image.split(',')[1] || base64Image;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          { text: SYSTEM_PROMPT },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: data
            }
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            potholes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  box_2d: {
                    type: Type.ARRAY,
                    items: { type: Type.NUMBER },
                    description: "Coordinates [ymin, xmin, ymax, xmax] scaled 0-1000",
                  },
                  label: { type: Type.STRING },
                  confidence: { type: Type.NUMBER },
                  severity: { type: Type.STRING },
                },
                required: ["box_2d", "label", "confidence", "severity"]
              }
            },
            summary: { type: Type.STRING }
          },
          required: ["potholes", "summary"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as DetectionResult;
  } catch (error) {
    console.error("AI Analysis failed:", error);
    throw new Error("Failed to analyze image.");
  }
};

export const resolveLocation = async (query: string): Promise<LocationData> => {
export async function generateText(prompt: string) {
  const res = await fetch('/api/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt })
  });
  if (!res.ok) {
    throw new Error(`Server error: ${res.status}`);
  }
  return res.json();
}

  
  try {
    // Switching to gemini-3-flash-preview for location resolution to ensure structured JSON output
    // Google Maps tool is removed here because it does not support responseMimeType: "application/json"
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Provide the precise latitude, longitude, and full formatted address for the following location: "${query}".`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            latitude: { type: Type.NUMBER },
            longitude: { type: Type.NUMBER },
            address: { type: Type.STRING }
          },
          required: ["latitude", "longitude", "address"]
        }
      },
    });

    const text = response.text;
    if (!text) throw new Error("Could not resolve location");
    const data = JSON.parse(text);
    return {
      ...data,
      timestamp: Date.now()
    };
  } catch (error) {
    console.error("Location resolution failed:", error);
    throw new Error("Location not found. Please try a more specific address or city.");
  }
};
