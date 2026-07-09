import Groq from 'groq-sdk';
import type {
  IRecipeGenerationProvider,
  GeneratedRecipe,
  RecipeGenerationInput,
} from '../interfaces/recipe-generation-provider.interface';

export class GroqRecipeGenerationProvider implements IRecipeGenerationProvider {
  private client: Groq;

  constructor(apiKey: string) {
    this.client = new Groq({ apiKey });
  }

  async generate(input: RecipeGenerationInput): Promise<GeneratedRecipe> {
    const goalText =
      input.goal === 'gain'
        ? 'gain weight (favour higher-calorie, protein-rich dishes)'
        : input.goal === 'lose'
          ? 'lose weight (favour calorie-controlled, high-satiety dishes)'
          : 'maintain general balanced nutrition';

    const bodyText =
      input.height && input.weight
        ? `The user is ${input.height} cm tall and weighs ${input.weight} kg. `
        : '';

    const pantryText = input.pantry.length
      ? input.pantry.map((p) => `${p.name} (${p.quantity} ${p.unit})`).join(', ')
      : 'nothing';

    const mealText = input.mealType ? `for ${input.mealType} ` : '';
    const cuisineText = input.cuisine ? `${input.cuisine} cuisine, ` : '';

    const prompt = `You are a recipe generation assistant.
The user's pantry currently contains: ${pantryText}.
${bodyText}The user's goal is to ${goalText}.
Generate ONE ${cuisineText}recipe ${mealText}for ${input.servings} serving(s). The dish MAY require ingredients beyond the pantry.
Rules:
- "ingredients": the FULL ingredient list; every item has a numeric "quantity" and a "unit" (g, kg, ml, l, tbsp, tsp, pcs, slices).
- "missingIngredients": ONLY ingredients (with quantities) NOT in the pantry, or where the pantry amount is insufficient.
- "instructions": clear ordered steps that reference amounts (e.g. "Dice 150 g of tomato").
- "nutrition": PER SERVING — "calories" in kcal, and "protein", "carbs", "fat" in grams.
Return ONLY valid JSON with no markdown or code blocks, in this exact shape:
{
  "title": "string",
  "description": "one short sentence",
  "cuisine": "string or null",
  "servings": ${input.servings},
  "estimatedMinutes": 30,
  "ingredients": [ { "name": "tomato", "quantity": 150, "unit": "g" } ],
  "missingIngredients": [ { "name": "tomato", "quantity": 150, "unit": "g" } ],
  "instructions": ["step 1", "step 2"],
  "nutrition": { "calories": 500, "protein": 30, "carbs": 45, "fat": 18 }
}`;

    const response = await this.client.chat.completions.create({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      temperature: 0.4,
      messages: [{ role: 'user', content: prompt }],
    });

    const raw = response.choices[0].message.content?.trim() ?? '{}';
    const cleaned = raw.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    return JSON.parse(cleaned) as GeneratedRecipe;
  }
}
