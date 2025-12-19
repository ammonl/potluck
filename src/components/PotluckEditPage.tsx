import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ArrowLeft, Save, Users, Settings, List, Plus, Edit2, LogOut, ChevronUp, ChevronDown, ChevronRight, Search, X } from 'lucide-react';

import { supabase } from '../lib/supabase';
import { Category, PotluckCategory, Registration } from '../types';
import { loadCategories, loadAllPotluckCategories, savePotluckCategory, deletePotluckCategory } from '../utils/database';
import { POPULAR_POTLUCK_ICONS, ALL_POTLUCK_ICONS, getIconComponent } from '../utils/lucideIcons';
import { AdminRegistrationCard } from './AdminRegistrationCard';



interface Potluck {
  id: string;
  slug: string;
  title_en: string;
  title_da: string;
  subtitle_en: string;
  subtitle_da: string;
  footer_en: string;
  footer_da: string;
  event_datetime: string;
  is_active: boolean;
  header_background?: string | null;
  gradient_from?: string;
  gradient_to?: string;
  header_overlay_opacity?: number;
  organizer_name?: string | null;
  organizer_email?: string | null;
  footer_emojis?: string | null;
  created_at?: string;
  updated_at?: string;
  icon?: string;
}

interface PotluckEditPageProps {
  onBack: () => void;
}

export const PotluckEditPage: React.FC<PotluckEditPageProps> = ({ onBack }) => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<'metadata' | 'categories' | 'registrations'>('metadata');
  const [potluck, setPotluck] = useState<Potluck | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Metadata form state
  const [formData, setFormData] = useState({
    slug: '',
    title_en: '',
    title_da: '',
    subtitle_en: '',
    subtitle_da: '',
    footer_en: '',
    footer_da: '',
    event_datetime: '',
    is_active: true,
    header_background: '/background.JPG',
    gradient_from: '#ea580c',
    gradient_to: '#ca8a04',
    header_overlay_opacity: 0.9,
    organizer_name: '',
    organizer_email: '',
    footer_emojis: '🍕 🍝 🍰 🥤 🎊 🎈 🎉',
    icon: 'Flame',
  });

  // Categories state
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [potluckCategories, setPotluckCategories] = useState<PotluckCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  // Registrations state
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [registrationsLoading, setRegistrationsLoading] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'category' | 'name' | 'description'>('date');
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  const [draggedRegistrationId, setDraggedRegistrationId] = useState<string | null>(null);


  const toggleCategoryCollapse = (categoryId: string) => {
    setCollapsedCategories(prev => {
        const next = new Set(prev);
        if (next.has(categoryId)) {
            next.delete(categoryId);
        } else {
            next.add(categoryId);
        }
        return next;
    });
  };



  // Load potluck data
  useEffect(() => {
    const loadPotluck = async () => {
      if (!id) return;
      
      try {
        const { data, error } = await supabase
          .from('potlucks')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          console.error('Error loading potluck:', error);
          return;
        }

        setPotluck(data);
        setFormData({
          slug: data.slug,
          title_en: data.title_en,
          title_da: data.title_da,
          subtitle_en: data.subtitle_en,
          subtitle_da: data.subtitle_da,
          footer_en: data.footer_en,
          footer_da: data.footer_da,
          event_datetime: data.event_datetime ? new Date(data.event_datetime).toISOString().slice(0, 16) : '',
          is_active: data.is_active,
          header_background: data.header_background || '/background.JPG',
          gradient_from: data.gradient_from || '#ea580c',
          gradient_to: data.gradient_to || '#ca8a04',
          header_overlay_opacity: data.header_overlay_opacity ?? 0.9,
          organizer_name: data.organizer_name || '',
          organizer_email: data.organizer_email || '',
          footer_emojis: data.footer_emojis || '',
          icon: data.icon || 'Flame'
        });
      } catch (error) {
        console.error('Error loading potluck:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPotluck();
  }, [id]);

  // Load categories when categories tab is active
  useEffect(() => {
    const loadCategoriesData = async () => {
      if ((activeTab === 'categories' || activeTab === 'registrations') && id) {
        setCategoriesLoading(true);
        try {
          const [categories, potluckCats] = await Promise.all([
            loadCategories(),
            loadAllPotluckCategories(id)
          ]);
          setAllCategories(categories);
          setPotluckCategories(potluckCats);
        } catch (error) {
          console.error('Error loading categories:', error);
        } finally {
          setCategoriesLoading(false);
        }
      }
    };

    loadCategoriesData();
  }, [activeTab, id]);

  // Load registrations when registrations tab is active
  useEffect(() => {
    const loadRegistrations = async () => {
      if (activeTab === 'registrations' && id) {
        setRegistrationsLoading(true);
        try {
          const { data, error } = await supabase
            .from('potluck_registrations')
            .select('*')
            .eq('potluck_id', id)
            .order('category', { ascending: true })
            .order('slot_number', { ascending: true })
            .order('created_at', { ascending: true });

          if (error) {
            console.error('Error loading registrations:', error);
            return;
          }

          setRegistrations(data || []);
        } catch (error) {
          console.error('Error loading registrations:', error);
        } finally {
          setRegistrationsLoading(false);
        }
      }
    };

    loadRegistrations();
  }, [activeTab, id]);

  const handleSaveMetadata = async () => {
    if (!id) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('potlucks')
        .update(formData)
        .eq('id', id);

      if (error) {
        console.error('Error saving potluck:', error);
        return;
      }

      // Update local state
      setPotluck(prev => prev ? { ...prev, ...formData } : null);
    } catch (error) {
      console.error('Error saving potluck:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleCategory = async (categoryId: string, isEnabled: boolean) => {
    if (!id) return;

    try {
      if (isEnabled) {
        // Add category to potluck
        const maxSortOrder = Math.max(...potluckCategories.map(pc => pc.sort_order), -1);
        await savePotluckCategory({
          potluck_id: id,
          category_id: categoryId,
          sort_order: maxSortOrder + 1,
          is_enabled: true
        });
      } else {
        // Remove category from potluck
        await deletePotluckCategory(id, categoryId);
      }

      // Reload categories
      const potluckCats = await loadAllPotluckCategories(id);
      setPotluckCategories(potluckCats);
    } catch (error) {
      console.error('Error toggling category:', error);
    }
  };

  const handleMoveCategoryUp = async (categoryId: string) => {
    if (!id) return;

    const enabledCategories = potluckCategories
      .filter(pc => pc.is_enabled)
      .sort((a, b) => a.sort_order - b.sort_order);
    
    const currentIndex = enabledCategories.findIndex(pc => pc.category_id === categoryId);
    if (currentIndex <= 0) return; // Already at top or not found

    // Swap sort orders
    const current = enabledCategories[currentIndex];
    const previous = enabledCategories[currentIndex - 1];
    
    try {
      await Promise.all([
        savePotluckCategory({
          potluck_id: id,
          category_id: current.category_id,
          sort_order: previous.sort_order,
          is_enabled: true
        }),
        savePotluckCategory({
          potluck_id: id,
          category_id: previous.category_id,
          sort_order: current.sort_order,
          is_enabled: true
        })
      ]);

      // Reload categories
      const potluckCats = await loadAllPotluckCategories(id);
      setPotluckCategories(potluckCats);
    } catch (error) {
      console.error('Error moving category up:', error);
    }
  };

  const handleMoveCategoryDown = async (categoryId: string) => {
    if (!id) return;

    const enabledCategories = potluckCategories
      .filter(pc => pc.is_enabled)
      .sort((a, b) => a.sort_order - b.sort_order);
    
    const currentIndex = enabledCategories.findIndex(pc => pc.category_id === categoryId);
    if (currentIndex < 0 || currentIndex >= enabledCategories.length - 1) return; // Already at bottom or not found

    // Swap sort orders
    const current = enabledCategories[currentIndex];
    const next = enabledCategories[currentIndex + 1];
    
    try {
      await Promise.all([
        savePotluckCategory({
          potluck_id: id,
          category_id: current.category_id,
          sort_order: next.sort_order,
          is_enabled: true
        }),
        savePotluckCategory({
          potluck_id: id,
          category_id: next.category_id,
          sort_order: current.sort_order,
          is_enabled: true
        })
      ]);

      // Reload categories
      const potluckCats = await loadAllPotluckCategories(id);
      setPotluckCategories(potluckCats);
    } catch (error) {
      console.error('Error moving category down:', error);
    }
  };

  const handleDeleteRegistration = async (registrationId: string) => {
    try {
      const { error } = await supabase
        .from('potluck_registrations')
        .delete()
        .eq('id', registrationId);

      if (error) {
        console.error('Error deleting registration:', error);
        return;
      }

      // Remove from local state
      setRegistrations(prev => prev.filter(r => r.id !== registrationId));
    } catch (error) {
      console.error('Error deleting registration:', error);
    }
  };

  const handleUpdateRegistration = async (updatedRegistration: Registration) => {
    if (!id) return;
    
    try {
      const { data, error } = await supabase
        .from('potluck_registrations')
        .update({
            name: updatedRegistration.name,
            description: updatedRegistration.description,
            gif_url: updatedRegistration.gif_url,
            // We generally don't update category/slot via this card editor yet, but keeping them same
        })
        .eq('id', updatedRegistration.id)
        .select()
        .single();

      if (error) {
         throw error;
      }

      // Update local state
      setRegistrations(prev => prev.map(r => r.id === updatedRegistration.id ? data : r));

    } catch (error) {
      console.error('Error updating registration:', error);
    }
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, registrationId: string) => {
    // Only allow dragging if sorted by category
    if (sortBy !== 'category') return;
    
    setDraggedRegistrationId(registrationId);
    e.dataTransfer.effectAllowed = 'move';
    // Transparent drag image or default? Default is fine.
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (sortBy !== 'category' || !draggedRegistrationId) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>, targetRegistrationId: string, categoryId: string) => {
    e.preventDefault();
    
    if (sortBy !== 'category' || !draggedRegistrationId || draggedRegistrationId === targetRegistrationId) {
        setDraggedRegistrationId(null);
        return;
    }

    const draggedItem = registrations.find(r => r.id === draggedRegistrationId);
    const targetItem = registrations.find(r => r.id === targetRegistrationId);

    if (!draggedItem || !targetItem) {
        setDraggedRegistrationId(null);
        return;
    }

    // Ensure we are in the same category
    if (draggedItem.category !== targetItem.category || draggedItem.category !== categoryId) {
        setDraggedRegistrationId(null);
        return;
    }

    // Get all items in this category
    const categoryRegistrations = registrations
        .filter(r => r.category === categoryId)
        .sort((a, b) => (a.slot_number || 0) - (b.slot_number || 0));

    // Find indexes
    const oldIndex = categoryRegistrations.findIndex(r => r.id === draggedRegistrationId);
    const newIndex = categoryRegistrations.findIndex(r => r.id === targetRegistrationId);

    if (oldIndex === -1 || newIndex === -1) {
        setDraggedRegistrationId(null);
        return;
    }

    // Reorder
    const newOrder = [...categoryRegistrations];
    const [movedItem] = newOrder.splice(oldIndex, 1);
    newOrder.splice(newIndex, 0, movedItem);

    // Update slot numbers locally
    // We update slot numbers to be 1-based index
    const updates = newOrder.map((item, index) => ({
        ...item,
        slot_number: index + 1
    }));

    // Update global registrations state
    setRegistrations(prev => {
        const next = [...prev];
        updates.forEach(updatedItem => {
            const idx = next.findIndex(r => r.id === updatedItem.id);
            if (idx !== -1) {
                next[idx] = updatedItem;
            }
        });
        return next;
    });

    setDraggedRegistrationId(null);

    // Save to DB
    try {
        await Promise.all(updates.map(item => 
            supabase
                .from('potluck_registrations')
                .update({ slot_number: item.slot_number })
                .eq('id', item.id)
        ));
    } catch (error) {
        console.error('Error updating slot order:', error);
        // Could revert state here if needed, but keeping simple for now
    }
  };


  const sortedRegistrations = [...registrations].sort((a, b) => {
    switch (sortBy) {
        case 'date':
            return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        case 'category':
            // Sort by category title if possible, else category ID
            // We need to look up category names from allCategories
            // Actually 'category' field in registration is category ID.
            // Let's group by category sort order?
            // Simple string sort on category ID for now, or better:
            // Find category in allCategories or potluckCategories to get name/order
            const catA = allCategories.find(c => c.id === a.category);
            const catB = allCategories.find(c => c.id === b.category);
             // Sort by potluck order if available?
            const pcA = potluckCategories.find(pc => pc.category_id === a.category);
            const pcB = potluckCategories.find(pc => pc.category_id === b.category);
             if (pcA && pcB) return pcA.sort_order - pcB.sort_order;
             if (pcA) return -1;
             if (pcB) return 1;
            return (catA?.name || a.category).localeCompare(catB?.name || b.category);
        case 'name':
            return a.name.localeCompare(b.name);
        case 'description':
            return a.description.localeCompare(b.description);
        default:
            return 0;
    }
  });


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚙️</div>
          <p className="text-xl text-gray-600 dark:text-gray-300">Loading potluck...</p>
        </div>
      </div>
    );
  }

  if (!potluck) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <p className="text-xl text-gray-600 dark:text-gray-300">Potluck not found</p>
          <button
            onClick={onBack}
            className="mt-4 px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors duration-200"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'metadata' as const, label: 'Details', icon: <Settings className="w-4 h-4" /> },
    { id: 'categories' as const, label: 'Categories', icon: <List className="w-4 h-4" /> },
    { id: 'registrations' as const, label: 'Registrations', icon: <Users className="w-4 h-4" /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 via-orange-700 to-orange-800 dark:from-orange-800 dark:via-orange-900 dark:to-gray-800 text-white py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-all duration-200"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <Edit2 className="w-8 h-8" />
              <h1 className="text-3xl font-bold">Edit Potluck</h1>
            </div>
            
            {/* User info moved here */}
            <div className="bg-white bg-opacity-20 rounded-lg p-2 flex items-center gap-3">
              <UserInfo />
              <button
                onClick={() => {
                  // Sign out functionality
                  supabase.auth.signOut();
                }}
                className="p-2 text-white text-opacity-80 hover:text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-all duration-200"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
          <p className="text-lg opacity-90">{potluck.title_en}</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Tab Navigation */}
        <div className="bg-gray-100 dark:bg-gray-800 rounded-t-lg p-1 mb-0">
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-6 py-3 rounded-t-lg font-medium transition-all duration-200 relative -mb-px
                  ${activeTab === tab.id
                    ? 'bg-white dark:bg-gray-700 text-orange-600 dark:text-orange-400 border-t-2 border-l border-r border-orange-500 z-10'
                    : 'bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 border-t-2 border-transparent'
                  }
                `}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white dark:bg-gray-700 rounded-b-lg rounded-tr-lg border border-gray-200 dark:border-gray-600 shadow-lg p-6">
          {activeTab === 'metadata' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Potluck Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Potluck ID (URL identifier)
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div md:col-span-2>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Icon
                  </label>
                  <IconSelector
                    selectedIcon={formData.icon}
                    onIconSelect={(icon) => setFormData(prev => ({ ...prev, icon }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Title (English)
                  </label>
                  <input
                    type="text"
                    value={formData.title_en}
                    onChange={(e) => setFormData(prev => ({ ...prev, title_en: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Title (Danish)
                  </label>
                  <input
                    type="text"
                    value={formData.title_da}
                    onChange={(e) => setFormData(prev => ({ ...prev, title_da: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Subtitle (English)
                  </label>
                  <textarea
                    value={formData.subtitle_en}
                    onChange={(e) => setFormData(prev => ({ ...prev, subtitle_en: e.target.value }))}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Subtitle (Danish)
                  </label>
                  <textarea
                    value={formData.subtitle_da}
                    onChange={(e) => setFormData(prev => ({ ...prev, subtitle_da: e.target.value }))}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Event Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.event_datetime}
                    onChange={(e) => setFormData(prev => ({ ...prev, event_datetime: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Header Background Image
                  </label>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={formData.header_background || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, header_background: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      placeholder="/background.JPG or https://example.com/image.jpg"
                    />
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <p className="mb-2">Enter a URL or path to an image. Examples:</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, header_background: '/background.JPG' }))}
                          className="text-left px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded text-xs hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                          /background.JPG (default)
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, header_background: 'https://images.pexels.com/photos/1565982/pexels-photo-1565982.jpeg' }))}
                          className="text-left px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded text-xs hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                          BBQ Grill
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, header_background: 'https://images.pexels.com/photos/1260968/pexels-photo-1260968.jpeg' }))}
                          className="text-left px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded text-xs hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                          Outdoor Party
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, header_background: 'https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg' }))}
                          className="text-left px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded text-xs hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                          Food Spread
                        </button>
                      </div>
                    </div>
                    {formData.header_background && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Preview:</p>
                        <div className="relative h-32 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
                          <img
                            src={formData.header_background}
                            alt="Header background preview"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2Y3ZjdmNyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBub3QgZm91bmQ8L3RleHQ+PC9zdmc+';
                            }}
                          />
                          <div 
                            className="absolute inset-0 flex items-center justify-center"
                            style={{
                              background: `linear-gradient(to right, ${formData.gradient_from || '#ea580c'}, ${formData.gradient_to || '#ca8a04'})`,
                              opacity: formData.header_overlay_opacity || 0.9
                            }}
                          >
                            <div className="text-white text-center">
                              <h3 className="text-lg font-bold">Sample Header Text</h3>
                              <p className="text-sm opacity-90">This is how your background will look</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Gradient From Color
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={formData.gradient_from || '#ea580c'}
                        onChange={(e) => setFormData(prev => ({ ...prev, gradient_from: e.target.value }))}
                        className="h-10 w-10 p-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={formData.gradient_from || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, gradient_from: e.target.value }))}
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        placeholder="#ea580c"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Gradient To Color
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={formData.gradient_to || '#ca8a04'}
                        onChange={(e) => setFormData(prev => ({ ...prev, gradient_to: e.target.value }))}
                        className="h-10 w-10 p-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={formData.gradient_to || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, gradient_to: e.target.value }))}
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        placeholder="#ca8a04"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Header Overlay Opacity
                  </label>
                  <div className="space-y-3">
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={formData.header_overlay_opacity || 0.20}
                        onChange={(e) => setFormData(prev => ({ ...prev, header_overlay_opacity: parseFloat(e.target.value) }))}
                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[3rem]">
                        {Math.round((formData.header_overlay_opacity || 0.20) * 100)}%
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <p>Adjust the opacity of the overlay. Lower values make the background more visible, higher values make text more readable.</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Footer (English)
                  </label>
                  <textarea
                    value={formData.footer_en}
                    onChange={(e) => setFormData(prev => ({ ...prev, footer_en: e.target.value }))}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Footer (Danish)
                  </label>
                  <textarea
                    value={formData.footer_da}
                    onChange={(e) => setFormData(prev => ({ ...prev, footer_da: e.target.value }))}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Organizer Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.organizer_name || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, organizer_name: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Organizer Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={formData.organizer_email || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, organizer_email: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    placeholder="john@example.com"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Footer Emojis (Optional)
                  </label>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={formData.footer_emojis || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, footer_emojis: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      placeholder="🍕 🍝 🍰 🥤 🎊 🎈 🎉"
                    />
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <p className="mb-2">Enter emojis to display in the footer. Leave empty to hide the emoji line. Examples:</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, footer_emojis: '🍕 🍝 🍰 🥤 🎊 🎈 🎉' }))}
                          className="text-left px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded text-xs hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                          🍖 🌭 🍔 🥩 🌽 🍺 🎉 (BBQ)
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, footer_emojis: '🥗 🍕 🍝 🍰 🥤 🎊 🎈' }))}
                          className="text-left px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded text-xs hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                          🥗 🍕 🍝 🍰 🥤 🎊 🎈 (Party)
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, footer_emojis: '🎃 🍂 🦃 🥧 🍷 🕯️ 🍁' }))}
                          className="text-left px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded text-xs hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                          🎃 🍂 🦃 🥧 🍷 🕯️ 🍁 (Thanksgiving)
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, footer_emojis: '' }))}
                          className="text-left px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded text-xs hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                          (No emojis)
                        </button>
                      </div>
                    </div>
                    {formData.footer_emojis && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Preview:</p>
                        <div className="bg-gray-800 rounded-lg p-4 text-center">
                          <div className="text-4xl space-x-4 text-white">
                            {formData.footer_emojis}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                  className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 dark:focus:ring-orange-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Active (visible to users)
                </label>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSaveMetadata}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'categories' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Manage Categories</h2>
              
              {categoriesLoading ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">⏳</div>
                  <p className="text-gray-600 dark:text-gray-400">Loading categories...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Available Categories */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">Available Categories</h3>
                    <div className="space-y-3">
                      {allCategories
                        .filter(category => !potluckCategories.some(pc => pc.category_id === category.id && pc.is_enabled))
                        .map((category) => (
                          <div key={category.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                            <div className="flex items-center gap-3">
                              <span className="text-xl">{category.icon}</span>
                              <div>
                                <h4 className="font-medium text-gray-800 dark:text-gray-100">
                                  {category.title_en} / {category.title_da}
                                </h4>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                  {category.name}
                                </p>
                              </div>
                            </div>
                            
                            <button
                              onClick={() => handleToggleCategory(category.id, true)}
                              className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors duration-200"
                            >
                              <Plus className="w-3 h-3" />
                              Add
                            </button>
                          </div>
                        ))}
                      {allCategories.filter(category => !potluckCategories.some(pc => pc.category_id === category.id && pc.is_enabled)).length === 0 && (
                        <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                          All categories have been added to this potluck
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Enabled Categories */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">Potluck Categories (in display order)</h3>
                    <div className="space-y-3">
                      {potluckCategories
                        .filter(pc => pc.is_enabled)
                        .sort((a, b) => a.sort_order - b.sort_order)
                        .map((potluckCategory, index, enabledCategories) => {
                          const category = allCategories.find(c => c.id === potluckCategory.category_id);
                          if (!category) return null;
                          
                          return (
                            <div key={category.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm">
                              <div className="flex items-top gap-3">
                                <span className="text-xl">{category.icon}</span>
                                <div>
                                  <h4 className="font-medium text-gray-800 dark:text-gray-100">
                                    {category.title_en} / {category.title_da}
                                  </h4>
                                  <p className="text-xs text-gray-600 dark:text-gray-400">
                                    {category.name}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleMoveCategoryUp(category.id)}
                                  disabled={index === 0}
                                  className="p-1 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                                  title="Move up"
                                >
                                  <ChevronUp className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleMoveCategoryDown(category.id)}
                                  disabled={index === enabledCategories.length - 1}
                                  className="p-1 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                                  title="Move down"
                                >
                                  <ChevronDown className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleToggleCategory(category.id, false)}
                                  className="p-1 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded transition-all duration-200"
                                  title="Remove from potluck"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      {potluckCategories.filter(pc => pc.is_enabled).length === 0 && (
                        <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                          No categories added yet. Add categories from the left panel.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'registrations' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Manage Registrations</h2>
              
              {registrationsLoading ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">⏳</div>
                  <p className="text-gray-600 dark:text-gray-400">Loading registrations...</p>
                </div>
              ) : registrations.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">📝</div>
                  <p className="text-gray-600 dark:text-gray-400">No registrations yet</p>
                </div>
              ) : (
                <div>
                    <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400 self-center mr-2">Sort by:</span>
                        <button
                            onClick={() => setSortBy('date')}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                                sortBy === 'date' 
                                ? 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200' 
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                        >
                            Date Created
                        </button>
                        <button
                            onClick={() => setSortBy('category')}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                                sortBy === 'category' 
                                ? 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200' 
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                        >
                            Category
                        </button>
                        <button
                            onClick={() => setSortBy('name')}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                                sortBy === 'name' 
                                ? 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200' 
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                        >
                            By (Name)
                        </button>
                        <button
                            onClick={() => setSortBy('description')}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                                sortBy === 'description' 
                                ? 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200' 
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                        >
                            Description
                        </button>
                    </div>

                  <div className="space-y-4">
                    {sortBy === 'category' ? (
                        // Group by category when sorting by category
                        (() => {
                            // Get unique categories from registrations and potluckCategories
                            const categoryGroups = new Map<string, Registration[]>();
                            
                            // Initialize groups based on potluckCategories order
                            potluckCategories
                                .filter(pc => pc.is_enabled)
                                .sort((a, b) => a.sort_order - b.sort_order)
                                .forEach(pc => {
                                    categoryGroups.set(pc.category_id, []);
                                });

                            // Also handle registrations for categories not in potluckCategories (if any)
                            registrations.forEach(reg => {
                                if (!categoryGroups.has(reg.category)) {
                                    categoryGroups.set(reg.category, []);
                                }
                                categoryGroups.get(reg.category)?.push(reg);
                            });
                            
                            // Convert map to array and render
                            return Array.from(categoryGroups.keys()).map(categoryId => {
                                const categoryRegistrations = categoryGroups.get(categoryId) || [];
                                const category = allCategories.find(c => c.id === categoryId);
                                const isCollapsed = collapsedCategories.has(categoryId);
                                
                                // Skip empty categories if desired, or show them as empty sections
                                // Let's show them even if empty to be explicit, or maybe only if they have registrations?
                                // User request implies grouping the items, so if no items, maybe skip?
                                // But usually nice to see structure. Let's show only if has items OR if it's an active potluck category?
                                // Let's show all that have items for now to keep it clean, or follow potluckCategories.
                                if (categoryRegistrations.length === 0) return null;

                                return (
                                    <div key={categoryId} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                                        <button
                                            onClick={() => toggleCategoryCollapse(categoryId)}
                                            className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                        >
                                            <div className="flex items-center gap-2">
                                                {isCollapsed ? <ChevronRight className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                                                <span className="text-lg">{category?.icon}</span>
                                                <h3 className="font-bold text-gray-700 dark:text-gray-200">
                                                    {category ? (category.title_en || category.name) : categoryId}
                                                </h3>
                                                <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full">
                                                    {categoryRegistrations.length}
                                                </span>
                                            </div>
                                        </button>
                                        
                                        {!isCollapsed && (
                                            <div className="p-4 space-y-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
                                                {categoryRegistrations
                                                    // Ensure they are sorted by slot_number for display in the draggable list
                                                    // Although they should be coming from map logic/filter sort, let's be sure
                                                    .sort((a, b) => (a.slot_number || 0) - (b.slot_number || 0))
                                                    .map(registration => (
                                                    <AdminRegistrationCard
                                                        key={registration.id}
                                                        registration={registration}
                                                        onUpdate={handleUpdateRegistration}
                                                        onDelete={() => handleDeleteRegistration(registration.id)}
                                                        categoryName={category ? (category.title_en || category.name) : registration.category}
                                                        draggable={sortBy === 'category'}
                                                        onDragStart={(e) => handleDragStart(e, registration.id)}
                                                        onDragOver={handleDragOver}
                                                        onDrop={(e) => handleDrop(e, registration.id, categoryId)}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            });
                        })()
                    ) : (
                        sortedRegistrations.map((registration) => {
                            const category = allCategories.find(c => c.id === registration.category);
                            return (
                                <AdminRegistrationCard
                                    key={registration.id}
                                    registration={registration}
                                    onUpdate={handleUpdateRegistration}
                                    onDelete={() => handleDeleteRegistration(registration.id)}
                                    categoryName={category ? (category.title_en || category.name) : registration.category}
                                />
                            );
                        })
                    )}
                  </div>

                </div>

              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface IconSelectorProps {
  selectedIcon: string;
  onIconSelect: (icon: string) => void;
}

const IconSelector: React.FC<IconSelectorProps> = ({ selectedIcon, onIconSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAll, setShowAll] = useState(false);

  const filteredIcons = (showAll ? ALL_POTLUCK_ICONS : POPULAR_POTLUCK_ICONS)
    .filter(iconName => 
      iconName.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const SelectedIconComponent = getIconComponent(selectedIcon);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
      >
        <div className="flex items-center gap-2">
          <SelectedIconComponent className="w-5 h-5" />
          <span>{selectedIcon}</span>
        </div>
        <div className="text-gray-400">▼</div>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-80 overflow-hidden">
          <div className="p-3 border-b border-gray-200 dark:border-gray-600">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search icons..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={() => setShowAll(false)}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  !showAll 
                    ? 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200' 
                    : 'bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-500'
                }`}
              >
                Popular
              </button>
              <button
                type="button"
                onClick={() => setShowAll(true)}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  showAll 
                    ? 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200' 
                    : 'bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-500'
                }`}
              >
                All Icons
              </button>
            </div>
          </div>
          <div className="grid grid-cols-6 gap-1 p-2 max-h-60 overflow-y-auto">
            {filteredIcons.map((iconName) => {
              const IconComponent = getIconComponent(iconName);
              return (
                <button
                  key={iconName}
                  type="button"
                  onClick={() => {
                    onIconSelect(iconName);
                    setIsOpen(false);
                  }}
                  className={`p-3 rounded-lg transition-all duration-200 flex flex-col items-center gap-1 ${
                    selectedIcon === iconName
                      ? 'bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-300 ring-2 ring-orange-500'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400'
                  }`}
                  title={iconName}
                >
                  <IconComponent className="w-5 h-5" />
                  <span className="text-xs truncate w-full text-center">{iconName}</span>
                </button>
              );
            })}
          </div>
          {filteredIcons.length === 0 && (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              No icons found matching "{searchTerm}"
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Separate component for user info to avoid hooks issues
const UserInfo: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);

  return (
    <div className="flex items-center gap-2 px-3">
      <img
        src={user?.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.user_metadata?.full_name || 'Admin')}&background=ea580c&color=fff`}
        alt="Profile"
        className="w-8 h-8 rounded-full"
      />
      <div className="text-sm">
        <p className="font-medium text-white">
          {user?.user_metadata?.full_name || 'Admin'}
        </p>
        <p className="text-white text-opacity-80 text-xs">
          {user?.email || 'Authenticated'}
        </p>
      </div>
    </div>
  );
};