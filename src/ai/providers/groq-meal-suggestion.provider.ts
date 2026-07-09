import Groq from 'groq-sdk'
import {
  IMealSuggestionProvider,
  MealSuggestion,
  MealSuggestionInput,
} from '../interfaces/meal-suggestion-provider.interface';

export class GroqMealSuggestionProvider implements IMealSuggestionProvider{
  private client: Groq
  
  constructor(apiKey:string) {
    this.client = new Groq({apiKey});
  }
  
  async suggest(input:MealSuggestionInput): Promise<MealSuggestion[]> {
    //replace with real data from dtb later
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

    const prompt = `You are a meal-planning assistant.                                                                                                                            
  Available pantry ingredients: ${input.ingredients.join(', ')}.                                                                                                                    
  ${bodyText}The user's goal is to ${goalText}. ${dietaryText}                                                                                                                      
  For EACH of these meals: ${input.mealTypes.join(', ')}, suggest exactly ${input.dishesPerMeal} dishes that primarily use the available ingredients. Each dish must include clear, ordered step-by-step cooking instructions.                               
  Return ONLY valid JSON with no markdown or code blocks, in this exact shape:                                                                                                      
  {                                                                                                                                                                                 
    "suggestions": [                                                                                                                                                                
      {                                                                                                                                                                             
        "mealType": "breakfast",                                                                                                                                                    
        "dishes": [                                                                                                                                                                 
          { "name": "string", "ingredients": ["string"], "description": "one short sentence", "estimatedMinutes": 15, "instructions": ["step 1", "step 2", "step 3"] }                                                              
        ]                                                                                                                                                                           
      }                                                                                                                                                                             
    ]                                                                                                                                                                               
  }`;

    const response = await this.client.chat.completions.create({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      temperature: 0.4,
      messages: [{ role: 'user', content: prompt }],
    });
    const raw =response.choices[0].message.content?.trim()??'{}';
    const cleaned = raw.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    const parsed = JSON.parse(cleaned) as { suggestions?: MealSuggestion[] };
    return parsed.suggestions ?? [];

  }
}