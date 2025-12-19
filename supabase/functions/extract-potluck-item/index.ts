import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import OpenAI from "https://esm.sh/openai@4.24.1"

const apiKey = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (!apiKey) {
      throw new Error('Missing OPENAI_API_KEY environment variable');
    }

    const openai = new OpenAI({
      apiKey: apiKey,
    });

    const { description, mode } = await req.json()

    if (mode !== 'random' && !description) {
      return new Response(
        JSON.stringify({ error: 'Description is required' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      )
    }

    let systemPrompt = "You are a helpful assistant that extracts the main food, drink, or other potluck item from a description. Return only the primary food, drink, or other potluck item name, nothing else. If multiple items are mentioned, return the most prominent one. Keep it simple and searchable (e.g., 'pizza', 'napkins', 'cookies', 'beer', 'salad'). If the description is in Danish, return the result in English.";
    let userPrompt = `Extract the main food, drink, or other potluck item from this description: "${description}"`;

    if (mode === 'random') {
      systemPrompt = "You are a helpful assistant. Return a single random common food or drink word that would make for a fun or appetizing GIF. Keep it simple and searchable (e.g. 'pizza', 'beer', 'cake', 'tacos', 'burger'). Return only the word, nothing else.";
      userPrompt = "Give me a random food or drink word.";
    }

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: userPrompt
        }
      ],
      max_tokens: 20,
      temperature: mode === 'random' ? 0.9 : 0.3 // Higher temperature for variety in random mode
    });

    const extractedItem = response.choices[0]?.message?.content?.trim();

    return new Response(
      JSON.stringify({ extractedItem }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    )
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    )
  }
})
