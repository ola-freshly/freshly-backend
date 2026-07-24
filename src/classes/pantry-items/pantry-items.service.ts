import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreatePantryItemDto } from './dto/create-pantry-item.dto';
import { UpdatePantryItemDto } from './dto/update-pantry-item.dto';
import { MergePantryItemsDto } from './dto/merge-pantry-items.dto';
import { ScanResultDto } from './dto/scan-result.dto';
import { ScanBarcodeDto } from './dto/scan-barcode.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PantryItem, PantryItemSource } from './entities/pantry-item.entity';
import { FoodCategory } from './entities/food-category.entity';
import { In, Repository } from 'typeorm';
import { AiVisionService } from '../../ai/ai-vision.service';
import * as fs from 'fs';

interface OpenFoodFactsProduct {
  product_name?: string;
  categories?: string;
}

interface OpenFoodFactsResponse {
  status: number;
  product?: OpenFoodFactsProduct;
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
        keywords: [
          'dairy',
          'dairies',
          'milk',
          'milks',
          'cheese',
          'cheeses',
          'yogurt',
          'yogurts',
        ],
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
        keywords: [
          'cereal',
          'cereals',
          'grain',
          'grains',
          'pasta',
          'bread',
          'rice',
        ],
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
        keywords: [
          'snack',
          'snacks',
          'chocolate',
          'chocolates',
          'confectionery',
        ],
      },
      {
        slug: 'condiment',
        keywords: [
          'condiment',
          'condiments',
          'sauce',
          'sauces',
          'oil',
          'oils',
          'vinegar',
          'vinegars',
        ],
      },
    ];

    for (const mapping of mappings) {
      if (
        mapping.keywords.some((keyword) =>
          this.containsWholeWord(category, keyword),
        )
      ) {
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
      relations: { units: true },
    });
    if (!category) {
      category = await this.foodCategoryRepository.findOne({
        where: { slug: 'other' },
        relations: { units: true },
      });
    }
    return category!;
  }

  // Rejects a unit that isn't in the category's allowed set (category_units).
  // A category with no configured units imposes no restriction (fail open).
  private assertUnitAllowed(category: FoodCategory, unit: string): void {
    const codes = (category.units ?? []).map((u) => u.code);
    const normalized = unit.trim().toLowerCase();
    if (codes.length > 0 && !codes.includes(normalized)) {
      throw new BadRequestException(
        `"${unit}" is not a valid unit for ${category.name}. Allowed units: ${codes.join(', ')}.`,
      );
    }
  }

  // Lists categories with their allowed units — the single source the add-item
  // unit picker and this service's validation both rely on.
  listCategories(): Promise<FoodCategory[]> {
    return this.foodCategoryRepository.find({
      relations: { units: true },
      order: { name: 'ASC' },
    });
  }

  async scanBarcode(dto: ScanBarcodeDto): Promise<ScanResultDto> {
    const response = await fetch(
      `${this.openFoodFactsUrl}/${dto.barcode}.json`,
    );

    if (!response.ok) {
      throw new BadRequestException('Failed to look up barcode');
    }

    const data = (await response.json()) as OpenFoodFactsResponse;

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

    if (category) {
      this.assertUnitAllowed(category, dto.unit);
    }

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
      relations: { category: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(userId: string, id: string): Promise<PantryItem> {
    const item = await this.pantryItemRepository.findOne({
      where: { id, user: { id: userId } },
      relations: { category: true },
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

    // Validate the resulting unit against the resulting category, whether either
    // is being changed or kept.
    const effectiveUnit = dto.unit ?? item.unit;
    if (item.category && effectiveUnit) {
      const categoryWithUnits = item.category.units
        ? item.category
        : await this.foodCategoryRepository.findOne({
            where: { id: item.category.id },
            relations: { units: true },
          });
      if (categoryWithUnits) {
        this.assertUnitAllowed(categoryWithUnits, effectiveUnit);
      }
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

  // Merges several of the user's pantry items into one. Units must match (you
  // can't sum different measures); expiry is resolved by the caller when the
  // selected items disagree.
  async merge(userId: string, dto: MergePantryItemsDto): Promise<PantryItem> {
    const items = await this.pantryItemRepository.find({
      where: { id: In(dto.itemIds), user: { id: userId } },
    });

    if (items.length !== dto.itemIds.length) {
      throw new NotFoundException('One or more items were not found');
    }
    const primary = items.find((i) => i.id === dto.primaryId);
    if (!primary) {
      throw new BadRequestException(
        'primaryId must be one of the selected items',
      );
    }

    // Category — a hard guard: only items of the same category may merge.
    const categories = new Set(items.map((i) => i.categoryId ?? null));
    if (categories.size > 1) {
      throw new BadRequestException(
        'Items must be in the same category to be merged.',
      );
    }

    // Unit compatibility — a hard guard (summing different units is meaningless).
    const units = new Set(items.map((i) => i.unit.trim().toLowerCase()));
    if (units.size > 1) {
      throw new BadRequestException(
        `Items use different units (${[...units].join(', ')}) and can't be merged.`,
      );
    }

    // Name: keep the shared name (case-insensitive, so "Eggs" == "eggs"), else
    // the caller picks one of the existing names.
    const nameKey = (n: string) => n.trim().toLowerCase();
    const names = new Set(items.map((i) => nameKey(i.name)));
    let finalName = primary.name;
    if (names.size > 1) {
      if (dto.name === undefined) {
        throw new BadRequestException(
          'Items have different names. Choose which to keep.',
        );
      }
      if (!items.some((i) => nameKey(i.name) === nameKey(dto.name!))) {
        throw new BadRequestException(
          "Chosen name must be one of the selected items' names.",
        );
      }
      finalName = dto.name.trim();
    }

    // Expiry: keep the single shared value, else the caller must resolve it, and
    // the chosen value must be one the selected items actually have.
    const normalise = (d?: Date | string | null): string | null =>
      d ? String(d).slice(0, 10) : null;
    const existing = new Set(items.map((i) => normalise(i.expiryDate)));
    let finalExpiry: string | null;
    if (existing.size <= 1) {
      finalExpiry = [...existing][0] ?? null;
    } else if (dto.expiryDate === undefined) {
      throw new BadRequestException(
        'Items have different expiry dates. Choose which to keep.',
      );
    } else {
      const chosen = normalise(dto.expiryDate);
      if (!existing.has(chosen)) {
        throw new BadRequestException(
          "Chosen expiry date must be one of the selected items' dates.",
        );
      }
      finalExpiry = chosen;
    }

    const totalQuantity = items.reduce((sum, i) => sum + Number(i.quantity), 0);
    const otherIds = dto.itemIds.filter((id) => id !== primary.id);

    await this.pantryItemRepository.manager.transaction(async (manager) => {
      await manager.update(PantryItem, primary.id, {
        name: finalName,
        quantity: totalQuantity,
        expiryDate: finalExpiry
          ? new Date(finalExpiry)
          : (null as unknown as Date),
      });
      await manager.delete(PantryItem, otherIds);
    });

    return this.findOne(userId, primary.id);
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
