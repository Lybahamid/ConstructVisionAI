import { GoogleGenAI, Type } from "@google/genai";
import { Detection } from "../types";

// Initialize Gemini on the client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function detectSafetyViolations(imageBase64: string): Promise<Detection[]> {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY is missing. AI features will not work.");
      return [];
    }

    const base64Data = imageBase64.split(",")[1] || imageBase64;
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          role: "user",
          parts: [
            { inlineData: { mimeType: "image/jpeg", data: base64Data } },
            { text: "Safety Check: Detect 'Person', 'Hard Hat', 'Safety Vest'. If gear is missing, label 'Violation: No Hat' or 'Violation: No Vest'. Return ONLY JSON: { \"detections\": [ { \"label\": string, \"confidence\": number, \"bbox\": [ymin, xmin, ymax, xmax] } ] }." }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
      }
    });

    // Resilience: Try to extract JSON even if model includes markdown markers
    let text = response.text || "{}";
    if (text.includes("```json")) {
      text = text.split("```json")[1].split("```")[0];
    } else if (text.includes("```")) {
      text = text.split("```")[1].split("```")[0];
    }
    
    const result = JSON.parse(text.trim());
    return (result.detections || []).map((d: any) => ({
      label: d.label || "Detected Object",
      confidence: typeof d.confidence === 'number' ? d.confidence : 0.8,
      bbox: {
        ymin: Array.isArray(d.bbox) ? d.bbox[0] : 0,
        xmin: Array.isArray(d.bbox) ? d.bbox[1] : 0,
        ymax: Array.isArray(d.bbox) ? d.bbox[2] : 1000,
        xmax: Array.isArray(d.bbox) ? d.bbox[3] : 1000,
      },
    }));
  } catch (error) {
    console.error("Gemini Detection Error:", error);
    return [];
  }
}
