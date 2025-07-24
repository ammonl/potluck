import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ArrowLeft, Save, Users, Settings, List, Trash2, Plus, Edit2, X, LogOut, ChevronUp, ChevronDown } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Category, PotluckCategory, Registration } from '../types';
import { loadCategories, loadAllPotluckCategories, savePotluckCategory, deletePotluckCategory } from '../utils/database';

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
  header_overlay_color?: string;
  header_overlay_opacity?: number;
  footer_emojis?: string | null;
  created_at?: string;
  updated_at?: string;
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
    header_overlay_color: 'black',
    header_overlay_opacity: 0.20,
    organizer_name: '',
    organizer_email: '',
    footer_emojis: '🍕 🍝 🍰 🥤 🎊 🎈 🎉'
  });

  // Categories state
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [potluckCategories, setPotluckCategories] = useState<PotluckCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  // Registrations state
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [registrationsLoading, setRegistrationsLoading] = useState(false);

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
          header_overlay_color: data.header_overlay_color || 'black',
          header_overlay_opacity: data.header_overlay_opacity ?? 0.20,
          organizer_name: data.organizer_name || '',
          organizer_email: data.organizer_email || '',
          footer_emojis: data.footer_emojis || ''
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
      if (activeTab === 'categories' && id) {
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
    { id: 'metadata' as const, label: 'Metadata', icon: <Settings className="w-4 h-4" /> },
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
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Potluck Metadata</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Slug (URL identifier)
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div>
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
                              backgroundColor: formData.header_overlay_color || 'black',
                              opacity: formData.header_overlay_opacity || 0.20
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Header Overlay Color
                  </label>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={formData.header_overlay_color || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, header_overlay_color: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      placeholder="black, #000000, rgb(0,0,0)"
                    />
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <p className="mb-2">Enter a CSS color value. Examples:</p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, header_overlay_color: 'black' }))}
                          className="text-left px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded text-xs hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                          black
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, header_overlay_color: '#1f2937' }))}
                          className="text-left px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded text-xs hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                          #1f2937
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, header_overlay_color: '#7c2d12' }))}
                          className="text-left px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded text-xs hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                          #7c2d12
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, header_overlay_color: '#1e40af' }))}
                          className="text-left px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded text-xs hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                          #1e40af
                        </button>
                      </div>
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
                <div className="space-y-4">
                  {registrations.map((registration) => (
                    <div key={registration.id} className="flex items-start justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 text-xs rounded-full">
                            {registration.category}
                            {registration.slot_number && ` #${registration.slot_number}`}
                          </span>
                        </div>
                        <h3 className="font-medium text-gray-800 dark:text-gray-100 mb-1">
                          {registration.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {registration.description}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          Created: {new Date(registration.created_at!).toLocaleDateString()}
                        </p>
                      </div>
                      
                      <button
                        onClick={() => handleDeleteRegistration(registration.id)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors duration-200"
                        title="Delete registration"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
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