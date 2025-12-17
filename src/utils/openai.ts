import OpenAI from 'openai';

const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

// Only instantiate the client if we have an API key, otherwise set to null
// This prevents the application from crashing on load if the key is missing
const openai = apiKey ? new OpenAI({
  apiKey: apiKey,
  dangerouslyAllowBrowser: true
}) : null;

export const extractPotluckItem = async (description: string): Promise<string> => {
  try {
    if (!openai) {
      console.warn('OpenAI API key not found, using original description');
      return description;
    }

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that extracts the main food, drink, or other potluck item from a description. Return only the primary food, drink, or other potluck item name, nothing else. If multiple items are mentioned, return the most prominent one. Keep it simple and searchable (e.g., 'pizza', 'napkins', 'cookies', 'beer', 'salad')."
        },
        {
          role: "user",
          content: `Extract the main food, drink, or other potluck item from this description: "${description}"`
        }
      ],
      max_tokens: 20,
      temperature: 0.3
    });

    const extractedItem = response.choices[0]?.message?.content?.trim();
    
    if (extractedItem && extractedItem.length > 0) {
      return extractedItem;
    }
    
    return description;
  } catch (error) {
    console.error('Error extracting food item with OpenAI:', error);
    return description;
  }
};