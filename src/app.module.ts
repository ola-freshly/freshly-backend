import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './mail/mail.module';
import { UsersModule } from './classes/users/users.module';
import { RecipesModule } from './classes/recipes/recipes.module';
import { PantryItemsModule } from './classes/pantry-items/pantry-items.module';
import { RecipeIngredientsModule } from './classes/recipe-ingredients/recipe-ingredients.module';
import { FavoriteRecipesModule } from './classes/favorite-recipes/favorite-recipes.module';
import { NutritionLogModule } from './classes/nutrition-log/nutrition-log.module';
import { NotificationModule } from './classes/notification/notification.module';
import { YoutubeImportModule } from './classes/youtube-import/youtube-import.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { MealPlansModule } from './classes/meal-plans/meal-plans.module';
import { MealPlanItemsModule } from './classes/meal-plan-items/meal-plan-items.module';
import { MealRecommendationsModule } from './classes/meal-recommendations/meal-recommendations.module';
import { ShoppingListModule } from './classes/shopping-list/shopping-list.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    MailModule,
    AuthModule,
    UsersModule,
    RecipesModule,
    PantryItemsModule,
    RecipeIngredientsModule,
    FavoriteRecipesModule,
    NutritionLogModule,
    NotificationModule,
    YoutubeImportModule,
    MealPlansModule,
    MealPlanItemsModule,
    MealRecommendationsModule,
    ShoppingListModule,
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: JwtAuthGuard }],
})
export class AppModule {}
