import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreatePantryItemDto } from './dto/create-pantry-item.dto';
import { UpdatePantryItemDto } from './dto/update-pantry-item.dto';
import { ScanResultDto } from './dto/scan-result.dto';
import { ScanBarcodeDto } from './dto/scan-barcode.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PantryItem, PantryItemSource } from './entities/pantry-item.entity';
import { FoodCategory } from './entities/food-category.entity';
import { Repository } from 'typeorm';
import { AiVisionService } from '../../ai/ai-vision.service';
import * as fs from 'fs';

interface OpenFoodFactsProduct {
  product_name?: string;
  categories?: string;
}

@Injectable()
export class PantryItemsService {
  private readonly logger = new Logger(PantryItemsService.name);

  private readonly openFoodFactsUrl =
    'https://world.openfoodfacts.org/api/v0/product';

  constructor(
    @InjectRepository(PantryItem)
    private readonly pantryItemRepository: Repository<PantryItem>,
    @InjectRepository(FoodCategory)
    private readonly foodCategoryRepository: Repository<FoodCategory>,
    private readonly aiVisionService: AiVisionService,
  ) {}

  async scanImage(file: Express.Multer.File): Promise<ScanResultDto> {
    try {
      const imageBase64 = fs.readFileSync(file.path).toString('base64');
      const result = await this.aiVisionService.analyzeFood(
        imageBase64,
        file.mimetype,
      );
      return {
        name: result.name,
        category: result.category,
        expirationDate: result.expiryDate,
        usageInstruction: result.usageInstruction,
        confidence: result.confidence,
      };
    } finally {
      fs.unlink(file.path, (err) => {
        if (err)
          this.logger.error(`Failed to delete temp file: ${err.message}`);
      });
    }
  }

  private mapCategory(inputCategory?: string): string {
    if (!inputCategory?.trim()) return 'other';

    const category = inputCategory
      .toLowerCase()
      .trim()
      .replace(/[_-]+/g, ' ')
      .replace(/\s+/g, ' ');

    const mappings: Array<{ slug: string; keywords: string[] }> = [
      {
        slug: 'dairy',
        keywords: ['dairy', 'dairies', 'milk', 'milks', 'cheese', 'cheeses', 'yogurt', 'yogurts'],
      },
      {
        slug: 'vegetable',
        keywords: ['vegetable', 'vegetables', 'legume', 'legumes'],
      },
      {
        slug: 'fruit',
        keywords: ['fruit', 'fruits'],
      },
      {
        slug: 'meat',
        keywords: ['meat', 'meats', 'poultry', 'chicken', 'beef', 'pork'],
      },
      {
        slug: 'seafood',
        keywords: ['seafood', 'fish', 'shellfish'],
      },
      {
        slug: 'grain',
        keywords: ['cereal', 'cereals', 'grain', 'grains', 'pasta', 'bread', 'rice'],
      },
      {
        slug: 'spice',
        keywords: ['spice', 'spices', 'herb', 'herbs'],
      },
      {
        slug: 'beverage',
        keywords: ['beverage', 'beverages', 'drink', 'drinks'],
      },
      {
        slug: 'snack',
        keywords: ['snack', 'snacks', 'chocolate', 'chocolates', 'confectionery'],
      },
      {
        slug: 'condiment',
        keywords: ['condiment', 'condiments', 'sauce', 'sauces', 'oil', 'oils', 'vinegar', 'vinegars'],
      },
    ];

    for (const mapping of mappings) {
      if (mapping.keywords.some((keyword) => this.containsWholeWord(category, keyword))) {
        return mapping.slug;
      }
    }

    return 'other';
  }

  private containsWholeWord(value: string, keyword: string): boolean {
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(`(^|\\s)${escaped}(?=\\s|$)`, 'i');
    return pattern.test(value);
  }

  private async resolveCategory(slug: string): Promise<FoodCategory> {
    let category = await this.foodCategoryRepository.findOne({
      where: { slug },
    });
    if (!category) {
      category = await this.foodCategoryRepository.findOne({
        where: { slug: 'other' },
      });
    }
    return category!;
  }

  async scanBarcode(dto: ScanBarcodeDto): Promise<ScanResultDto> {
    const response = await fetch(
      `${this.openFoodFactsUrl}/${dto.barcode}.json`,
    );

    if (!response.ok) {
      throw new BadRequestException('Failed to look up barcode');
    }

    const data = (await response.json()) as {
      status: number;
      product?: OpenFoodFactsProduct;
    };

    if (data.status === 0 || !data.product) {
      throw new NotFoundException(
        `Product not found for barcode ${dto.barcode}`,
      );
    }

    const { product } = data;

    const category = product.categories
      ? product.categories.split(',').map((c) => c.trim().toLowerCase())[0]
      : undefined;

    return {
      name: product.product_name || `Product (${dto.barcode})`,
      category: this.mapCategory(category),
      expirationDate: null,
      usageInstruction: null,
      confidence: 1,
    };
  }

  async create(userId: string, dto: CreatePantryItemDto): Promise<PantryItem> {
    const category = dto.category
      ? await this.resolveCategory(dto.category)
      : undefined;

    const item = this.pantryItemRepository.create({
      name: dto.name,
      quantity: dto.quantity,
      unit: dto.unit,
      category,
      barcode: dto.barcode,
      imageUrl: dto.imageUrl,
      expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : undefined,
      usageInstruction: dto.usageInstruction,
      user: { id: userId },
      source: dto.source ?? PantryItemSource.MANUAL,
    });
    return this.pantryItemRepository.save(item);
  }

  findAll(userId: string): Promise<PantryItem[]> {
    return this.pantryItemRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(userId: string, id: string): Promise<PantryItem> {
    const item = await this.pantryItemRepository.findOne({
      where: { id, user: { id: userId } },
    });
    if (!item) {
      throw new NotFoundException(`Pantry item ${id} not found`);
    }
    return item;
  }

  async update(
    userId: string,
    id: string,
    dto: UpdatePantryItemDto,
  ): Promise<PantryItem> {
    const item = await this.findOne(userId, id);

    if (dto.category) {
      item.category = await this.resolveCategory(dto.category);
    }
    if (dto.expiryDate) {
      item.expiryDate = new Date(dto.expiryDate);
    }

    Object.assign(item, {
      name: dto.name ?? item.name,
      quantity: dto.quantity ?? item.quantity,
      unit: dto.unit ?? item.unit,
      barcode: dto.barcode ?? item.barcode,
      imageUrl: dto.imageUrl ?? item.imageUrl,
      usageInstruction: dto.usageInstruction ?? item.usageInstruction,
      source: dto.source ?? item.source,
    });

    return this.pantryItemRepository.save(item);
  }

  async remove(
    userId: string,
    id: string,
  ): Promise<{ deleted: boolean; id: string }> {
    const item = await this.findOne(userId, id);
    await this.pantryItemRepository.remove(item);
    return { deleted: true, id };
  }
}
