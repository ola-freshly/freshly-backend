import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiVisionService, AI_VISION_PROVIDER } from './ai-vision.service';
import { GroqVisionProvider } from './providers/groq-vision.provider';

@Module({
  providers: [
    {
      provide: AI_VISION_PROVIDER,
      useFactory: (config: ConfigService) => {
        const provider = config.get<string>('AI_PROVIDER', 'groq');
        if (provider === 'groq') {
          return new GroqVisionProvider(config.get<string>('GROQ_API_KEY')!);
        }
        throw new Error(`Unknown AI provider: ${provider}`);
      },
      inject: [ConfigService],
    },
    AiVisionService,
  ],
  exports: [AiVisionService],
})
export class AiModule {}
