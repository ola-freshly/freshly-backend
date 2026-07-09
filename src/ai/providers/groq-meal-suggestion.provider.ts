import Groq from 'groq-sdk';
import type {
  IMealSuggestionProvider,
  MealSuggestion,
  MealSuggestionInput,
} from '../interfaces/meal-suggestion-provider.interface';

export class GroqMealSuggestionProvider implements IMealSuggestionProvider {
  private client: Groq;

  constructor(apiKey: string) {
    this.client = new Groq({ apiKey });
  }

  async suggest(input: MealSuggestionInput): Promise<MealSuggestion[]> {
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

    const dietaryText = input.dietary?.length
      ? `Dietary constraints: ${input.dietary.join(', ')}. `
      : '';

    const pantryText = input.pantry
      .map((p) => `${p.name} (${p.quantity} ${p.unit})`)
      .join(', ');

    const prompt = `You are a meal-planning assistant.
The user's pantry currently contains: ${pantryText}.
${bodyText}The user's goal is to ${goalText}. ${dietaryText}
For EACH of these meals: ${input.mealTypes.join(', ')}, suggest exactly ${input.dishesPerMeal} dishes.
Dishes MAY require ingredients beyond what is in the pantry — that is encouraged for variety.
Rules for each dish:
- "ingredients": the FULL ingredient list with realistic amounts. Every item needs a numeric "quantity" and a "unit" (g, kg, ml, l, tbsp, tsp, pcs, slices, etc.).
- "shoppingList": ONLY the ingredients (with quantities) that are NOT in the pantry, or where the pantry amount is insufficient — i.e. exactly what the user still needs to buy.
- "instructions": clear, ordered steps that reference the ingredient amounts (e.g. "Dice 150 g of tomato").
- "nutrition": estimated values PER SERVING — "calories" in kcal, and "protein", "carbs", "fat" in grams.
Return ONLY valid JSON with no markdown or code blocks, in this exact shape:
{
  "suggestions": [
    {
      "mealType": "breakfast",
      "dishes": [
        {
          "name": "string",
          "description": "one short sentence",
          "estimatedMinutes": 15,
          "ingredients": [ { "name": "tomato", "quantity": 150, "unit": "g" } ],
          "shoppingList": [ { "name": "tomato sauce", "quantity": 50, "unit": "ml" } ],
          "instructions": ["step 1", "step 2"],
          "nutrition": { "calories": 320, "protein": 12, "carbs": 40, "fat": 9 }
        }
      ]
    }
  ]
}`;

    const response = await this.client.chat.completions.create({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      temperature: 0.4,
      messages: [{ role: 'user', content: prompt }],
    });

    const raw = response.choices[0].message.content?.trim() ?? '{}';
    const cleaned = raw.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    const parsed = JSON.parse(cleaned) as { suggestions?: MealSuggestion[] };
    return parsed.suggestions ?? [];
  }
}
