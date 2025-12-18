import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Users, Calendar, Settings, Edit2, Trash2, Globe, LogOut, Save, X, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { loadCategories, saveCategory, updateCategory, deleteCategory } from '../utils/database';
import { getCategoryBorderColor } from '../utils/colors';
import { Category } from '../types';
import { POPULAR_POTLUCK_ICONS, ALL_POTLUCK_ICONS, getIconComponent } from '../utils/lucideIcons';

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
  organizer_name?: string | null;
  organizer_email?: string | null;
  created_at?: string;
  updated_at?: string;
  icon?: string;
}

interface AdminPageProps {
  onBack: () => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onBack }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'potlucks' | 'categories'>('potlucks');
  const [potlucks, setPotlucks] = useState<Potluck[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewPotluckForm, setShowNewPotluckForm] = useState(false);
  const [showNewCategoryForm, setShowNewCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);

  // New potluck form state
  const [newPotluck, setNewPotluck] = useState({
    slug: '',
    title_en: '',
    title_da: '',
    subtitle_en: '',
    subtitle_da: '',
    footer_en: '',
    footer_da: '',
    event_datetime: '',
    is_active: true,
    organizer_name: '',
    organizer_email: '',
    icon: 'Flame'
  });

  // New category form state
  const [newCategory, setNewCategory] = useState({
    name: '',
    title_en: '',
    title_da: '',
    singular_en: '',
    singular_da: '',
    placeholder_en: '',
    placeholder_da: '',
    icon: '📦',
    color_class: 'from-gray-400 to-gray-600',
    slots: 3
  });

  // Color class options
  const colorClassOptions = [
    { value: 'from-red-400 to-red-600', label: 'Red', preview: 'bg-gradient-to-r from-red-400 to-red-600' },
    { value: 'from-orange-400 to-orange-600', label: 'Orange', preview: 'bg-gradient-to-r from-orange-400 to-orange-600' },
    { value: 'from-yellow-400 to-yellow-600', label: 'Yellow', preview: 'bg-gradient-to-r from-yellow-400 to-yellow-600' },
    { value: 'from-green-400 to-green-600', label: 'Green', preview: 'bg-gradient-to-r from-green-400 to-green-600' },
    { value: 'from-blue-400 to-blue-600', label: 'Blue', preview: 'bg-gradient-to-r from-blue-400 to-blue-600' },
    { value: 'from-indigo-400 to-indigo-600', label: 'Indigo', preview: 'bg-gradient-to-r from-indigo-400 to-indigo-600' },
    { value: 'from-purple-400 to-purple-600', label: 'Purple', preview: 'bg-gradient-to-r from-purple-400 to-purple-600' },
    { value: 'from-pink-400 to-pink-600', label: 'Pink', preview: 'bg-gradient-to-r from-pink-400 to-pink-600' },
    { value: 'from-gray-400 to-gray-600', label: 'Gray', preview: 'bg-gradient-to-r from-gray-400 to-gray-600' },
    { value: 'from-teal-400 to-teal-600', label: 'Teal', preview: 'bg-gradient-to-r from-teal-400 to-teal-600' },
    { value: 'from-cyan-400 to-cyan-600', label: 'Cyan', preview: 'bg-gradient-to-r from-cyan-400 to-cyan-600' },
    { value: 'from-emerald-400 to-emerald-600', label: 'Emerald', preview: 'bg-gradient-to-r from-emerald-400 to-emerald-600' },
    { value: 'from-lime-400 to-lime-600', label: 'Lime', preview: 'bg-gradient-to-r from-lime-400 to-lime-600' },
    { value: 'from-amber-400 to-amber-600', label: 'Amber', preview: 'bg-gradient-to-r from-amber-400 to-amber-600' },
    { value: 'from-rose-400 to-rose-600', label: 'Rose', preview: 'bg-gradient-to-r from-rose-400 to-rose-600' },
    { value: 'from-violet-400 to-violet-600', label: 'Violet', preview: 'bg-gradient-to-r from-violet-400 to-violet-600' },
    { value: 'from-fuchsia-400 to-fuchsia-600', label: 'Fuchsia', preview: 'bg-gradient-to-r from-fuchsia-400 to-fuchsia-600' },
    { value: 'from-sky-400 to-sky-600', label: 'Sky', preview: 'bg-gradient-to-r from-sky-400 to-sky-600' }
  ];

  // Load potlucks
  useEffect(() => {
    const loadPotlucks = async () => {
      try {
        const { data, error } = await supabase
          .from('potlucks')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error loading potlucks:', error);
          return;
        }

        setPotlucks(data || []);
      } catch (error) {
        console.error('Error loading potlucks:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPotlucks();
  }, []);

  // Load categories when categories tab is active
  useEffect(() => {
    const loadCategoriesData = async () => {
      if (activeTab === 'categories') {
        const categoriesData = await loadCategories();
        setCategories(categoriesData);
      }
    };

    loadCategoriesData();
  }, [activeTab]);

  const handleCreatePotluck = async () => {
    try {
      const { data, error } = await supabase
        .from('potlucks')
        .insert([newPotluck])
        .select()
        .single();

      if (error) {
        console.error('Error creating potluck:', error);
        return;
      }

      setPotlucks(prev => [data, ...prev]);
      setShowNewPotluckForm(false);
      setNewPotluck({
        slug: '',
        title_en: '',
        title_da: '',
        subtitle_en: '',
        subtitle_da: '',
        footer_en: '',
        footer_da: '',
        event_datetime: '',
        is_active: true,
        organizer_name: '',
        organizer_email: '',
        icon: 'Flame'
      });
    } catch (error) {
      console.error('Error creating potluck:', error);
    }
  };

  const handleCreateCategory = async () => {
    try {
      const savedCategory = await saveCategory(newCategory);
      if (savedCategory) {
        setCategories(prev => [...prev, savedCategory]);
        setShowNewCategoryForm(false);
        setNewCategory({
          name: '',
          title_en: '',
          title_da: '',
          singular_en: '',
          singular_da: '',
          placeholder_en: '',
          placeholder_da: '',
          icon: '📦',
          color_class: 'from-gray-400 to-gray-600',
          slots: 3
        });
      }
    } catch (error) {
      console.error('Error creating category:', error);
    }
  };

  const handleUpdateCategory = async (id: string, updates: Partial<Category>) => {
    try {
      const updatedCategory = await updateCategory(id, updates);
      if (updatedCategory) {
        setCategories(prev => prev.map(cat => cat.id === id ? updatedCategory : cat));
        setEditingCategory(null);
      }
    } catch (error) {
      console.error('Error updating category:', error);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category? This will also remove it from all potlucks.')) {
      return;
    }

    try {
      const success = await deleteCategory(id);
      if (success) {
        setCategories(prev => prev.filter(cat => cat.id !== id));
      }
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const handleDeletePotluck = async (id: string) => {
    if (!confirm('Are you sure you want to delete this potluck? This will also delete all registrations.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('potlucks')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting potluck:', error);
        return;
      }

      setPotlucks(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting potluck:', error);
    }
  };

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚙️</div>
          <p className="text-xl text-gray-600 dark:text-gray-300">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'potlucks' as const, label: 'Potlucks', icon: <Calendar className="w-4 h-4" /> },
    { id: 'categories' as const, label: 'Categories', icon: <Settings className="w-4 h-4" /> }
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
              <Settings className="w-8 h-8" />
              <h1 className="text-3xl font-bold">Admin Panel</h1>
            </div>
            
            {/* User info moved here */}
            <div className="bg-white bg-opacity-20 rounded-lg p-2 flex items-center gap-3">
              <UserInfo />
              <button
                onClick={() => {
                  // Sign out functionality - we'll need to import supabase
                  import('../lib/supabase').then(({ supabase }) => {
                    supabase.auth.signOut();
                  });
                }}
                className="p-2 text-white text-opacity-80 hover:text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-all duration-200"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
          <p className="text-lg opacity-90">Manage potluck events and categories</p>
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
          {activeTab === 'potlucks' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Potluck Events</h2>
                <button
                  onClick={() => setShowNewPotluckForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors duration-200"
                >
                  <Plus className="w-4 h-4" />
                  New Potluck
                </button>
              </div>

              {showNewPotluckForm && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">Create New Potluck</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Slug (URL identifier)
                      </label>
                      <input
                        type="text"
                        value={newPotluck.slug}
                        onChange={(e) => setNewPotluck(prev => ({ ...prev, slug: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder="summer-bbq"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Icon
                      </label>
                      <IconSelector
                        selectedIcon={newPotluck.icon}
                        onIconSelect={(icon) => setNewPotluck(prev => ({ ...prev, icon }))}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Event Date & Time
                      </label>
                      <input
                        type="datetime-local"
                        value={newPotluck.event_datetime}
                        onChange={(e) => setNewPotluck(prev => ({ ...prev, event_datetime: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Title (English)
                      </label>
                      <input
                        type="text"
                        value={newPotluck.title_en}
                        onChange={(e) => setNewPotluck(prev => ({ ...prev, title_en: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder="Summer BBQ"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Title (Danish)
                      </label>
                      <input
                        type="text"
                        value={newPotluck.title_da}
                        onChange={(e) => setNewPotluck(prev => ({ ...prev, title_da: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder="Sommer Grillfest"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Subtitle (English)
                      </label>
                      <input
                        type="text"
                        value={newPotluck.subtitle_en}
                        onChange={(e) => setNewPotluck(prev => ({ ...prev, subtitle_en: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder="Join us for an amazing barbecue experience!"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Subtitle (Danish)
                      </label>
                      <input
                        type="text"
                        value={newPotluck.subtitle_da}
                        onChange={(e) => setNewPotluck(prev => ({ ...prev, subtitle_da: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder="Kom og vær med til en fantastisk grilloplevelse!"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={handleCreatePotluck}
                      className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors duration-200"
                    >
                      Create Potluck
                    </button>
                    <button
                      onClick={() => setShowNewPotluckForm(false)}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {potlucks.map((potluck) => (
                  <div key={potluck.id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-600 relative">
                    <div className="absolute top-4 right-4 flex gap-2">
                      <button
                        onClick={() => navigate(`/admin/potluck/${potluck.id}`)}
                        className="p-2 text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900 rounded-lg transition-all duration-200"
                        title="Edit potluck"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePotluck(potluck.id)}
                        className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-all duration-200"
                        title="Delete potluck"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="pl-2 pr-16">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 flex gap-2">
                          {(() => {
                            const IconComponent = getIconComponent(potluck.icon || 'Flame');
                            return <IconComponent className="w-6 h-6 text-orange-500 mt-0.5" />;
                          })()}
                          {potluck.title_en}
                        </h3>
                        {potluck.is_active && (
                          <span className="absolute top-15 right-4 flex gap-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded-full">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-500 mb-2">
                        <Calendar className="w-4 h-4" />
                        {formatDateTime(potluck.event_datetime)}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-500">
                        <Globe className="w-4 h-4" />
                        <a 
                          href={`/${potluck.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline transition-colors duration-200"
                        >
                          /{potluck.slug}
                        </a>
                      </div>
                      {potluck.organizer_name && (
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-500 mt-1">
                          <Users className="w-4 h-4" />
                          <span>{potluck.organizer_name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {potlucks.length === 0 && !showNewPotluckForm && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🍽️</div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">No potlucks yet</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">Create your first potluck event to get started</p>
                  <button
                    onClick={() => setShowNewPotluckForm(true)}
                    className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors duration-200"
                  >
                    Create First Potluck
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'categories' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Food Categories</h2>
                <button
                  onClick={() => setShowNewCategoryForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors duration-200"
                >
                  <Plus className="w-4 h-4" />
                  New Category
                </button>
              </div>

              {showNewCategoryForm && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">Create New Category</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Icon (emoji)
                      </label>
                      <input
                        type="text"
                        value={newCategory.icon}
                        onChange={(e) => setNewCategory(prev => ({ ...prev, icon: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder="🥗"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        value={newCategory.name}
                        onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder="appetizers"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Title (English)
                      </label>
                      <input
                        type="text"
                        value={newCategory.title_en}
                        onChange={(e) => setNewCategory(prev => ({ ...prev, title_en: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder="Appetizers"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Title (Danish)
                      </label>
                      <input
                        type="text"
                        value={newCategory.title_da}
                        onChange={(e) => setNewCategory(prev => ({ ...prev, title_da: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder="Forretter"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={handleCreateCategory}
                      className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors duration-200"
                    >
                      Create Category
                    </button>
                    <button
                      onClick={() => setShowNewCategoryForm(false)}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((category) => (
                  <CategoryCard
                    key={category.id}
                    category={category}
                    isEditing={editingCategory === category.id}
                    onEdit={() => setEditingCategory(category.id)}
                    onSave={(updates) => handleUpdateCategory(category.id, updates)}
                    onCancel={() => setEditingCategory(null)}
                    onDelete={() => handleDeleteCategory(category.id)}
                    colorClassOptions={colorClassOptions}
                  />
                ))}
              </div>

              {categories.length === 0 && !showNewCategoryForm && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📂</div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">No categories yet</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">Create your first food category to organize potluck items</p>
                  <button
                    onClick={() => setShowNewCategoryForm(true)}
                    className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors duration-200"
                  >
                    Create First Category
                  </button>
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
        className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
      >
        <div className="flex items-center gap-2">
          <SelectedIconComponent className="w-5 h-5" />
          <span>{selectedIcon}</span>
        </div>
        <div className="text-gray-400">▼</div>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-80 overflow-hidden">
          <div className="p-3 border-b border-gray-200 dark:border-gray-600">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search icons..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
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

interface CategoryCardProps {
  category: Category;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (updates: Partial<Category>) => void;
  onCancel: () => void;
  onDelete: () => void;
  colorClassOptions: { value: string; label: string; preview: string }[];
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  colorClassOptions
}) => {
  const [formData, setFormData] = useState({
    name: category.name,
    title_en: category.title_en,
    title_da: category.title_da,
    singular_en: category.singular_en,
    singular_da: category.singular_da,
    placeholder_en: category.placeholder_en || '',
    placeholder_da: category.placeholder_da || '',
    icon: category.icon,
    color_class: category.color_class,
    slots: category.slots
  });

  const handleSave = () => {
    onSave(formData);
  };

  const handleCancel = () => {
    setFormData({
      name: category.name,
      title_en: category.title_en,
      title_da: category.title_da,
      singular_en: category.singular_en,
      singular_da: category.singular_da,
      placeholder_en: category.placeholder_en || '',
      placeholder_da: category.placeholder_da || '',
      icon: category.icon,
      color_class: category.color_class,
      slots: category.slots
    });
    onCancel();
  };

  // Use formData.color_class when editing, category.color_class when not editing
  const currentColorClass = isEditing ? formData.color_class : category.color_class;
  if (isEditing) {
    return (
      <div className="bg-white dark:bg-gray-700 rounded-lg p-6 border-2 shadow-lg" style={{
        borderColor: getCategoryBorderColor(currentColorClass)
      }}>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Icon
              </label>
              <input
                type="text"
                value={formData.icon}
                onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Title (English)
              </label>
              <input
                type="text"
                value={formData.title_en}
                onChange={(e) => setFormData(prev => ({ ...prev, title_en: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Title (Danish)
              </label>
              <input
                type="text"
                value={formData.title_da}
                onChange={(e) => setFormData(prev => ({ ...prev, title_da: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Singular (English)
              </label>
              <input
                type="text"
                value={formData.singular_en}
                onChange={(e) => setFormData(prev => ({ ...prev, singular_en: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Singular (Danish)
              </label>
              <input
                type="text"
                value={formData.singular_da}
                onChange={(e) => setFormData(prev => ({ ...prev, singular_da: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description (English)
              </label>
              <input
                type="text"
                value={formData.placeholder_en}
                onChange={(e) => setFormData(prev => ({ ...prev, placeholder_en: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                placeholder="Optional description"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description (Danish)
              </label>
              <input
                type="text"
                value={formData.placeholder_da}
                onChange={(e) => setFormData(prev => ({ ...prev, placeholder_da: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                placeholder="Valgfri beskrivelse"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Color
              </label>
              <select
                value={formData.color_class}
                onChange={(e) => setFormData(prev => ({ ...prev, color_class: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                {colorClassOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Default Slots
              </label>
              <input
                type="number"
                value={formData.slots}
                onChange={(e) => setFormData(prev => ({ ...prev, slots: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>
          <div className={`mt-2 h-4 rounded bg-gradient-to-r ${currentColorClass}`}></div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={handleSave}
              className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors duration-200"
            >
              <Save className="w-3 h-3" />
              Save
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center gap-1 px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              <X className="w-3 h-3" />
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border-2 relative" style={{
      borderColor: getCategoryBorderColor(currentColorClass)
    }}>
      <div className="absolute top-4 right-4 flex gap-2">
        <button
          onClick={onEdit}
          className="p-2 text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900 rounded-lg transition-all duration-200"
          title="Edit category"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button
          onClick={onDelete}
          className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-all duration-200"
          title="Delete category"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      
      <div className="pr-16 pb-4">
        <div className="flex items-top gap-3 mb-3">
          <span className="text-4xl">{category.icon}</span>
          <div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
              {category.title_en}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {category.name}
            </p>
          </div>
        </div>
      </div>
      <div className={`absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-r ${currentColorClass} rounded-b-lg`}></div>
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