import {
  FoodAnalysisResult,
  IAiVisionProvider,
} from '../interfaces/ai-vision-provider.interface';
import Groq from 'groq-sdk';

export class GroqVisionProvider implements IAiVisionProvider {
  private client: Groq;

  constructor(apiKey: string) {
    this.client = new Groq({ apiKey });
  }

  async analyzeFood(
    imageBase64: string,
    mimeType: string,
  ): Promise<FoodAnalysisResult> {
    const response = await this.client.chat.completions.create({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      temperature: 0.1,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: `data:${mimeType};base64,${imageBase64}` },
            },
            {
              type: 'text',
              text: `Analyze this food/ingredient image and return ONLY valid JSON with no markdown or code blocks:                                                                                                                   
  {                                                                                                                                                                                                                                     
    "name": "specific ingredient name",                                                                                                                                                                                                 
    "category": "one of: dairy, vegetable, fruit, meat, seafood, grain, spice, beverage, snack, condiment, other",                                                                                                                      
    "expiryDate": "YYYY-MM-DD if visible on packaging, otherwise null",                                                                                                                                                                 
    "usageInstruction": "brief storage or usage tip, or null",                                                                                                                                                                          
    "confidence": 0.95,                                                                                                                                                                                                                 
    "ocrRawText": "any text visible in the image, or null"                                                                                                                                                                              
  }`,
            },
          ],
        },
      ],
    });

    const raw = response.choices[0].message.content?.trim() ?? '{}';
    const cleaned = raw.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    return JSON.parse(cleaned) as FoodAnalysisResult;
  }
}
