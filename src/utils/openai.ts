import { supabase } from '../lib/supabase';

export const extractPotluckItem = async (description: string): Promise<string> => {
  try {
    const { data, error } = await supabase.functions.invoke('extract-potluck-item', {
      body: { description }
    });

    if (error) {
      console.error('Error calling extract-potluck-item function:', error);
      return description;
    }

    const extractedItem = data?.extractedItem;
    
    if (extractedItem && extractedItem.length > 0) {
      return extractedItem;
    }
    
    return description;
  } catch (error) {
    console.error('Error extracting food item:', error);
    return description;
  }
};

export const generateRandomFoodItem = async (): Promise<string> => {
  try {
    const { data, error } = await supabase.functions.invoke('extract-potluck-item', {
      body: { mode: 'random' }
    });

    if (error) {
      console.error('Error calling extract-potluck-item function for random word:', error);
      return '';
    }

    const extractedItem = data?.extractedItem;
    
    if (extractedItem && extractedItem.length > 0) {
      return extractedItem;
    }
    
    return '';
  } catch (error) {
    console.error('Error generating random food item:', error);
    return '';
  }
};