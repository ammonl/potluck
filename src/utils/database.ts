import { supabase } from '../lib/supabase';
import { Registration, PotluckData, Category, PotluckCategory } from '../types';
import { fetchGiphyGif } from './giphy';
import { extractPotluckItem } from './openai';

export const loadPotluckCategories = async (potluckId: string): Promise<PotluckCategory[]> => {
  try {
    const { data, error } = await supabase
      .from('potluck_categories')
      .select(`
        *,
        category:categories(*)
      `)
      .eq('potluck_id', potluckId)
      .eq('is_enabled', true)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error loading potluck categories:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error loading potluck categories:', error);
    return [];
  }
};

export const loadAllPotluckCategories = async (potluckId: string): Promise<PotluckCategory[]> => {
  try {
    const { data, error } = await supabase
      .from('potluck_categories')
      .select(`
        *,
        category:categories(*)
      `)
      .eq('potluck_id', potluckId)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error loading all potluck categories:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error loading all potluck categories:', error);
    return [];
  }
};

export const savePotluckCategory = async (potluckCategory: Omit<PotluckCategory, 'id' | 'created_at' | 'updated_at'>): Promise<PotluckCategory | null> => {
  try {
    const { data, error } = await supabase
      .from('potluck_categories')
      .upsert({
        potluck_id: potluckCategory.potluck_id,
        category_id: potluckCategory.category_id,
        sort_order: potluckCategory.sort_order,
        is_enabled: potluckCategory.is_enabled
      }, { 
        onConflict: 'potluck_id,category_id',
        ignoreDuplicates: false 
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving potluck category:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error saving potluck category:', error);
    return null;
  }
};

export const deletePotluckCategory = async (potluckId: string, categoryId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('potluck_categories')
      .delete()
      .eq('potluck_id', potluckId)
      .eq('category_id', categoryId);

    if (error) {
      console.error('Error deleting potluck category:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error deleting potluck category:', error);
    return false;
  }
};

export const saveCategory = async (category: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<Category | null> => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .insert([category])
      .select()
      .single();

    if (error) {
      console.error('Error saving category:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error saving category:', error);
    return null;
  }
};

export const updateCategory = async (id: string, category: Partial<Category>): Promise<Category | null> => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .update(category)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating category:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error updating category:', error);
    return null;
  }
};

export const deleteCategory = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting category:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error deleting category:', error);
    return false;
  }
};

export const loadCategories = async (): Promise<Category[]> => {
  try {
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .order('title_en', { ascending: true });

    if (error) {
      console.error('Error loading categories:', error);
      return getDefaultCategories();
    }

    return categories || getDefaultCategories();
  } catch (error) {
    console.error('Error loading categories:', error);
    return getDefaultCategories();
  }
};

export const getDefaultCategories = (): Category[] => [
  {
    id: 'default',
    name: 'default',
    title_en: 'Default',
    title_da: 'Default',
    singular_en: 'Default',
    singular_da: 'Default',
    placeholder_en: '',
    placeholder_da: '',
    icon: '✅',
    color_class: 'from-red-400 to-red-600',
    slots: 3
  }
];

export const loadPotluckData = async (potluckId?: string): Promise<PotluckData> => {
  try {
    if (!potluckId) {
      return getInitialData();
    }

    // Load potluck categories to get the dynamic structure
    const potluckCategories = await loadPotluckCategories(potluckId);
    const enabledCategories = potluckCategories.map(pc => pc.category!).filter(Boolean);

    const { data: registrations, error } = await supabase
      .from('potluck_registrations')
      .select('*')
      .eq('potluck_id', potluckId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error loading BBQ data:', error);
      return getInitialData();
    }

    // Create dynamic data structure based on enabled categories
    const data: any = {};
    
    enabledCategories.forEach(category => {
      if (category.id === 'additional') {
        data[getCategoryKey(category.name)] = [];
      } else {
        // Default slot counts for different categories
        const defaultSlots = category.slots;
        data[getCategoryKey(category.id)] = Array(defaultSlots).fill(null);
      }
    });

    registrations?.forEach((reg) => {
      const registration: Registration = {
        id: reg.id,
        name: reg.name,
        description: reg.description,
        category: reg.category, // Now a UUID
        slot_number: reg.slot_number,
        gif_url: reg.gif_url,
        created_at: reg.created_at,
        updated_at: reg.updated_at
      };

      if (reg.category === 'additional') {
        // Find the category to determine if it's additional
        const category = enabledCategories.find(c => c.id === reg.category);
        if (category && category.title_en === 'Additional Items') {
          const key = getCategoryKey(category.id);
          if (data[key]) {
            data[key].push(registration);
          }
        }
      } else if (reg.slot_number !== null) {
        const index = reg.slot_number - 1;
        const category = enabledCategories.find(c => c.id === reg.category);
        if (category) {
          const key = getCategoryKey(category.id);
          if (data[key]) {
            // Expand array if needed
            while (data[key].length <= index) {
              data[key].push(null);
            }
            if (index >= 0) data[key][index] = registration;
          }
        }
      }
    });

    // Add one extra slot to each non-additional category if all default slots are filled
    enabledCategories.forEach(category => {
      if (category.title_en !== 'Additional Items') {
        const key = getCategoryKey(category.id);
        const defaultCount = category.slots;
        if (data[key] && data[key].length === defaultCount && data[key].every((item: any) => item !== null)) {
          data[key].push(null);
        }
      }
    });

    return data as PotluckData;
  } catch (error) {
    console.error('Error loading BBQ data:', error);
    return getInitialData();
  }
};

// Helper function to convert category ID to data key
const getCategoryKey = (categoryId: string): string => {
  // For backward compatibility, we'll use a simple mapping based on common patterns
  // This could be enhanced to use a lookup table if needed
  if (categoryId.includes('main') || categoryId === 'main-dish') return 'mainDishes';
  if (categoryId.includes('side') || categoryId === 'side-dish') return 'sideDishes';
  if (categoryId.includes('dessert')) return 'desserts';
  if (categoryId.includes('drink')) return 'drinks';
  if (categoryId.includes('additional')) return 'additional';
  if (categoryId.includes('other')) return 'other';
  
  // For new categories, create a camelCase key from the ID
  return categoryId.replace(/-/g, '').toLowerCase();
};

export const saveRegistration = async (registration: Registration, potluckId: string): Promise<Registration | null> => {
  try {
        // Extract food item using OpenAI and fetch GIF if we don't have one
    let gifUrl = registration.gif_url;
    if (!gifUrl && registration.description) {
      const foodItem = await extractPotluckItem(registration.description);
      gifUrl = await fetchGiphyGif(foodItem);
    }

    const registrationData = {
      id: registration.id,
      name: registration.name,
      description: registration.description,
      category: registration.category,
      slot_number: registration.slot_number,
      gif_url: gifUrl,
      potluck_id: potluckId
    };

    console.log('Saving registration:', registrationData);

    const { data, error } = await supabase
      .from('potluck_registrations')
      .upsert(registrationData, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      console.error('Error saving registration:', error);
      return null;
    }

    console.log('Registration saved successfully:', data);

    // If this is a slotted registration, reorganize slots to fill gaps
    if (data.slot_number !== null) {
      await reorganizeSlots(potluckId, data.category);
    }

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      category: data.category,
      slot_number: data.slot_number,
      gif_url: data.gif_url,
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  } catch (error) {
    console.error('Error saving registration:', error);
    return null;
  }
};

export const deleteRegistration = async (id: string): Promise<boolean> => {
  try {
    // Get the registration details before deleting
    const { data: registrationToDelete, error: fetchError } = await supabase
      .from('potluck_registrations')
      .select('potluck_id, category, slot_number')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Error fetching registration for deletion:', fetchError);
      return false;
    }

    const { error } = await supabase
      .from('potluck_registrations')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting registration:', error);
      return false;
    }

    // If this was a slotted registration, reorganize slots to fill gaps
    if (registrationToDelete?.slot_number !== null) {
      await reorganizeSlots(registrationToDelete.potluck_id, registrationToDelete.category);
    }

    return true;
  } catch (error) {
    console.error('Error deleting registration:', error);
    return false;
  }
};

// Helper function to reorganize slots and fill gaps
const reorganizeSlots = async (potluckId: string, categoryId: string): Promise<void> => {
  try {
    // Get all registrations for this category, ordered by slot_number
    const { data: registrations, error } = await supabase
      .from('potluck_registrations')
      .select('*')
      .eq('potluck_id', potluckId)
      .eq('category', categoryId)
      .not('slot_number', 'is', null)
      .order('slot_number', { ascending: true });

    if (error) {
      console.error('Error fetching registrations for reorganization:', error);
      return;
    }

    if (!registrations || registrations.length === 0) {
      return;
    }

    // Reassign slot numbers sequentially starting from 1
    const updates = registrations.map((reg, index) => ({
      id: reg.id,
      slot_number: index + 1
    }));

    // Update all registrations with new slot numbers
    for (const update of updates) {
      const { error: updateError } = await supabase
        .from('potluck_registrations')
        .update({ slot_number: update.slot_number })
        .eq('id', update.id);

      if (updateError) {
        console.error('Error updating slot number:', updateError);
      }
    }
  } catch (error) {
    console.error('Error reorganizing slots:', error);
  }
};

export const getInitialData = (): PotluckData => ({
});

export const hasIncompleteEntries = (data: PotluckData): boolean => {
  if (!data) return false;
  
  const allEntries: Registration[] = [];
  
  // Collect all entries from all categories
  Object.values(data).forEach(categoryData => {
    if (Array.isArray(categoryData)) {
      categoryData.forEach(entry => {
        if (entry && typeof entry === 'object' && 'name' in entry && 'description' in entry) {
          allEntries.push(entry);
        }
      });
    }
  });

  return allEntries.some(entry => 
    !entry?.name?.trim() || !entry?.description?.trim()
  );
};

export const subscribeToChanges = (callback: (data: PotluckData) => void, potluckId?: string) => {
  const channel = supabase
    .channel('potluck_registrations_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'potluck_registrations'
      },
      async () => {
        // Reload data when any change occurs
        const newData = await loadPotluckData(potluckId);
        callback(newData);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};