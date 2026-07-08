import { Module, Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiVisionService, AI_VISION_PROVIDER } from './ai-vision.service';
import { GroqVisionProvider } from './providers/groq-vision.provider';
import {
  MealSuggestionService,
  MEAL_SUGGESTION_PROVIDER,
} from './meal-suggestion.service';
import { GroqMealSuggestionProvider } from './providers/groq-meal-suggestion.provider';

/** Config-driven Groq provider factory — one place for the AI_PROVIDER/API-key logic. */
function groqProvider<T>(
  provide: string,
  ctor: new (apiKey: string) => T,
): Provider {
  return {
    provide,
    useFactory: (config: ConfigService): T => {
      const name = config.get<string>('AI_PROVIDER', 'groq');
      if (name !== 'groq') {
        throw new Error(`Unknown AI provider: ${name}`);
      }
      return new ctor(config.get<string>('GROQ_API_KEY')!);
    },
    inject: [ConfigService],
  };
}

@Module({
  providers: [
    groqProvider(AI_VISION_PROVIDER, GroqVisionProvider),
    groqProvider(MEAL_SUGGESTION_PROVIDER, GroqMealSuggestionProvider),
    AiVisionService,
    MealSuggestionService,
  ],
  exports: [AiVisionService, MealSuggestionService],
})
export class AiModule {}
