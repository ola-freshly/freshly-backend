import { Injectable, Logger } from '@nestjs/common';
import { CreatePantryItemDto } from './dto/create-pantry-item.dto';
import { UpdatePantryItemDto } from './dto/update-pantry-item.dto';
import { InjectRepository } from '@nestjs/typeorm';
import {
  AiProcessingStatus,
  PantryItem,
  PantryItemSource,
} from './entities/pantry-item.entity';
import { Repository } from 'typeorm';
import { AiVisionService } from '../../ai/ai-vision.service';
import * as fs from 'fs';

@Injectable()
export class PantryItemsService {
  private readonly logger = new Logger(PantryItemsService.name);
  constructor(
    @InjectRepository(PantryItem)
    private readonly pantryItemRepository: Repository<PantryItem>,
    private readonly aiVisionService: AiVisionService,
  ) {}
  private async processImage(
    itemId: string,
    filePath: string,
    mimeType: string,
  ): Promise<void> {
    try {
      const imageBase64 = fs.readFileSync(filePath).toString('base64');
      const result = await this.aiVisionService.analyzeFood(
        imageBase64,
        mimeType,
      );

      await this.pantryItemRepository.update(itemId, {
        name: result.name,
        category: result.category,
        expiryDate: result.expiryDate ? new Date(result.expiryDate) : undefined,
        usageInstruction: result.usageInstruction ?? undefined,
        aiConfidence: result.confidence,
        ocrResult: result.ocrRawText ?? undefined,
        aiProcessingStatus: AiProcessingStatus.COMPLETED,
      });
    } catch (error) {
      this.logger.error(error.message);
      await this.pantryItemRepository.update(itemId, {
        aiProcessingStatus: AiProcessingStatus.FAILED,
      })
    }
  }

  async scanImage(
    userId: string,
    file: Express.Multer.File,
  ): Promise<{ id: string; status: AiProcessingStatus }> {
    const imageUrl = `/uploads/${file.filename}`;
    const item = this.pantryItemRepository.create({
      user: { id: userId },
      name: 'Processing...',
      quantity: 0,
      unit: 'unit',
      imageUrl,
      source: PantryItemSource.AI,
      aiProcessingStatus: AiProcessingStatus.PROCESSING,
    });

    const savedItem = await this.pantryItemRepository.save(item);
    setImmediate(() =>
      this.processImage(savedItem.id, file.path, file.mimetype),
    );
    return { id: savedItem.id, status: AiProcessingStatus.PROCESSING };
  }

  create(createPantryItemDto: CreatePantryItemDto) {
    return createPantryItemDto;
  }

  findAll() {
    return `This action returns all pantryItems`;
  }

  findOne(id: string) {
    return this.pantryItemRepository.findOne({ where: { id } });
  }

  update(id: number, updatePantryItemDto: UpdatePantryItemDto) {
    return { id, ...updatePantryItemDto };
  }

  remove(id: number) {
    return `This action removes a #${id} pantryItem`;
  }
}
