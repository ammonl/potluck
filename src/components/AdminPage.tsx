import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Users, Calendar, Settings, Edit2, Trash2, Globe, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { loadCategories, saveCategory, deleteCategory } from '../utils/database';
import { getCategoryBorderColor } from '../utils/colors';
import { DefaultCategory } from '../types';
import { getIconComponent } from '../utils/lucideIcons';
import { IconSelector } from './IconSelector';
import { UserInfo } from './UserInfo';


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
  const [categories, setCategories] = useState<DefaultCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewPotluckForm, setShowNewPotluckForm] = useState(false);
  const [showNewCategoryForm, setShowNewCategoryForm] = useState(false);


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
  // Color class options moved to utils/colors.ts

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
                        Potluck ID (URL identifier)
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
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Default Categories</h2>
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
                    onEdit={() => navigate(`/admin/category/${category.id}`)}
                    onDelete={() => handleDeleteCategory(category.id)}
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



interface CategoryCardProps {
  category: DefaultCategory;
  onEdit: () => void;
  onDelete: () => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  onEdit,
  onDelete
}) => {
  return (
    <div className="bg-white dark:bg-gray-700 rounded-lg p-6 border-2 relative" style={{
      borderColor: getCategoryBorderColor(category.color_class)
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
      <div className={`absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-r ${category.color_class} rounded-b-lg`}></div>
    </div>
  );
};