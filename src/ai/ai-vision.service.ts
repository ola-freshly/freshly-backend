import { Injectable, Inject } from '@nestjs/common';
import { FoodAnalysisResult } from './interfaces/ai-vision-provider.interface';
import type { IAiVisionProvider } from './interfaces/ai-vision-provider.interface';

export const AI_VISION_PROVIDER = 'AI_VISION_PROVIDER';

@Injectable()
export class AiVisionService {
  constructor(
    @Inject(AI_VISION_PROVIDER)
    private readonly provider: IAiVisionProvider,
  ) {}

  analyzeFood(
    imageBase64: string,
    mimeType: string,
  ): Promise<FoodAnalysisResult> {
    return this.provider.analyzeFood(imageBase64, mimeType);
  }
}
