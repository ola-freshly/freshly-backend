export interface FoodAnalysisResult {
  name: string;
  category: string;
  expiryDate: string | null;
  usageInstruction: string | null;
  confidence: number;
  ocrRawText: string | null;
}

export interface IAiVisionProvider {
  analyzeFood(
    imageBase64: string,
    mimeType: string,
  ): Promise<FoodAnalysisResult>;
}
