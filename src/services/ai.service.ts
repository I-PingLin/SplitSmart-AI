
import { Injectable } from '@angular/core';
import { GoogleGenAI, Type } from "@google/genai";
import { ReceiptItem } from '../models/bill.model';

@Injectable({ providedIn: 'root' })
export class AiService {
  private ai = new GoogleGenAI({ apiKey: (process as any).env.API_KEY });
  private model = 'gemini-2.5-flash';

  async parseReceipt(base64Image: string): Promise<{ items: Partial<ReceiptItem>[], tax: number, tip: number }> {
    const response = await this.ai.models.generateContent({
      model: this.model,
      contents: [
        {
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
            { text: "Extract items, their prices, tax, and tip from this receipt. Return as JSON." }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  price: { type: Type.NUMBER }
                },
                required: ["name", "price"]
              }
            },
            tax: { type: Type.NUMBER },
            tip: { type: Type.NUMBER }
          },
          required: ["items", "tax", "tip"]
        }
      }
    });

    return JSON.parse(response.text);
  }

  async interpretCommand(message: string, currentItems: ReceiptItem[]): Promise<{ intent: 'ASSIGN' | 'UNASSIGN' | 'UNKNOWN', people: string[], itemSearch: string }> {
    const itemNames = currentItems.map(i => i.name).join(', ');
    const prompt = `
      User says: "${message}"
      Available items: [${itemNames}]
      Extract who is involved and which item they are referring to.
      "intent" should be ASSIGN or UNASSIGN.
      "people" is an array of names.
      "itemSearch" is the item name or a fuzzy match.
    `;

    const response = await this.ai.models.generateContent({
      model: this.model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            intent: { type: Type.STRING, description: "ASSIGN or UNASSIGN" },
            people: { type: Type.ARRAY, items: { type: Type.STRING } },
            itemSearch: { type: Type.STRING }
          },
          required: ["intent", "people", "itemSearch"]
        }
      }
    });

    return JSON.parse(response.text);
  }
}
