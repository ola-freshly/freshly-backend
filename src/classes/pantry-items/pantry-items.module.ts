import { Module } from '@nestjs/common';
import { PantryItemsService } from './pantry-items.service';
import { PantryItemsController } from './pantry-items.controller';

@Module({
  controllers: [PantryItemsController],
  providers: [PantryItemsService],
})
export class PantryItemsModule {}
