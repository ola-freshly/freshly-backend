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
import {
  FoodCategory,
  PantryItem,
  PantryItemSource,
} from './entities/pantry-item.entity';
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

  private mapCategory(category: string | null): string {
    if (!category) return FoodCategory.OTHER;

    const mappings: Record<string, FoodCategory> = {
      dairies: FoodCategory.DAIRY,
      milks: FoodCategory.DAIRY,
      cheeses: FoodCategory.DAIRY,
      yogurts: FoodCategory.DAIRY,
      vegetables: FoodCategory.VEGETABLE,
      legumes: FoodCategory.VEGETABLE,
      fruits: FoodCategory.FRUIT,
      meats: FoodCategory.MEAT,
      ' poultry': FoodCategory.MEAT,
      seafood: FoodCategory.SEAFOOD,
      fish: FoodCategory.SEAFOOD,
      cereals: FoodCategory.GRAIN,
      grains: FoodCategory.GRAIN,
      pasta: FoodCategory.GRAIN,
      bread: FoodCategory.GRAIN,
      rice: FoodCategory.GRAIN,
      spices: FoodCategory.SPICE,
      herbs: FoodCategory.SPICE,
      beverages: FoodCategory.BEVERAGE,
      drinks: FoodCategory.BEVERAGE,
      snacks: FoodCategory.SNACK,
      chocolates: FoodCategory.SNACK,
      confectionery: FoodCategory.SNACK,
      condiments: FoodCategory.CONDIMENT,
      sauces: FoodCategory.CONDIMENT,
      oils: FoodCategory.CONDIMENT,
      vinegars: FoodCategory.CONDIMENT,
    };

    for (const [key, value] of Object.entries(mappings)) {
      if (category.includes(key)) return value;
    }

    return FoodCategory.OTHER;
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
      : null;

    return {
      name: product.product_name || `Product (${dto.barcode})`,
      category: this.mapCategory(category ?? null),
      expirationDate: null,
      usageInstruction: null,
      confidence: 1,
    };
  }

  async create(userId: string, dto: CreatePantryItemDto): Promise<PantryItem> {
    const item = this.pantryItemRepository.create({
      ...dto,
      user: { id: userId },
      expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : undefined,
      category: dto.category as FoodCategory,
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
    Object.assign(item, dto);
    if (dto.expiryDate) {
      item.expiryDate = new Date(dto.expiryDate);
    }
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
