import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Trash2, LogOut, Edit2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Category } from '../types';
import { updateCategory, deleteCategory } from '../utils/database';
import { getCategoryBorderColor, COLOR_CLASS_OPTIONS } from '../utils/colors';

import { UserInfo } from './UserInfo';

interface CategoryEditPageProps {
  onBack: () => void;
}

export const CategoryEditPage: React.FC<CategoryEditPageProps> = ({ onBack }) => {
  const { id } = useParams<{ id: string }>();
  // If no onBack provided (direct access), we can default to navigating back
  const navigate = useNavigate();
  const handleBack = onBack || (() => navigate('/admin'));

  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    title_en: '',
    title_da: '',
    singular_en: '',
    singular_da: '',
    placeholder_en: '',
    placeholder_da: '',
    icon: '',
    color_class: '',
    slots: 3
  });

  useEffect(() => {
    const loadCategory = async () => {
      if (!id) return;
      
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          console.error('Error loading category:', error);
          return;
        }

        setCategory(data);
        setFormData({
          name: data.name,
          title_en: data.title_en,
          title_da: data.title_da,
          singular_en: data.singular_en,
          singular_da: data.singular_da,
          placeholder_en: data.placeholder_en || '',
          placeholder_da: data.placeholder_da || '',
          icon: data.icon,
          color_class: data.color_class,
          slots: data.slots
        });
      } catch (error) {
        console.error('Error loading category:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCategory();
  }, [id]);

  const handleSave = async () => {
    if (!id) return;
    
    setSaving(true);
    try {
      const updatedCategory = await updateCategory(id, formData);
      if (updatedCategory) {
        handleBack();
      }
    } catch (error) {
      console.error('Error saving category:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !confirm('Are you sure you want to delete this category? This will also remove it from all potlucks.')) {
      return;
    }

    try {
      const success = await deleteCategory(id);
      if (success) {
        handleBack();
      }
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚙️</div>
          <p className="text-xl text-gray-600 dark:text-gray-300">Loading category...</p>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <p className="text-xl text-gray-600 dark:text-gray-300">Category not found</p>
          <button
            onClick={handleBack}
            className="mt-4 px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors duration-200"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 via-orange-700 to-orange-800 dark:from-orange-800 dark:via-orange-900 dark:to-gray-800 text-white py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBack}
                className="p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-all duration-200"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                <span className="text-2xl">{formData.icon || '📦'}</span>
              </div>
              <h1 className="text-3xl font-bold">Edit Category</h1>
            </div>
            
            <div className="bg-white bg-opacity-20 rounded-lg p-2 flex items-center gap-3">
              <UserInfo />
              <button
                onClick={() => {
                  supabase.auth.signOut();
                }}
                className="p-2 text-white text-opacity-80 hover:text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-all duration-200"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
          <p className="text-lg opacity-90">{formData.title_en || 'New Category'}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-700 rounded-lg shadow-lg border-2" style={{
          borderColor: getCategoryBorderColor(formData.color_class)
        }}>
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-600 pb-4">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-gray-500" />
                Category Details
              </h2>
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors duration-200"
              >
                <Trash2 className="w-4 h-4" />
                Delete Category
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Icon
                </label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  placeholder="🥗"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Internal Name (ID reference)
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  placeholder="appetizers"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title (English)
                </label>
                <input
                  type="text"
                  value={formData.title_en}
                  onChange={(e) => setFormData(prev => ({ ...prev, title_en: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
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
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Singular Item Name (English)
                </label>
                <input
                  type="text"
                  value={formData.singular_en}
                  onChange={(e) => setFormData(prev => ({ ...prev, singular_en: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  placeholder="Dish"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Singular Item Name (Danish)
                </label>
                <input
                  type="text"
                  value={formData.singular_da}
                  onChange={(e) => setFormData(prev => ({ ...prev, singular_da: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  placeholder="Ret"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description / Placeholder (English)
                </label>
                <input
                  type="text"
                  value={formData.placeholder_en}
                  onChange={(e) => setFormData(prev => ({ ...prev, placeholder_en: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  placeholder="Optional description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description / Placeholder (Danish)
                </label>
                <input
                  type="text"
                  value={formData.placeholder_da}
                  onChange={(e) => setFormData(prev => ({ ...prev, placeholder_da: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  placeholder="Valgfri beskrivelse"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Color Theme
                </label>
                <select
                  value={formData.color_class}
                  onChange={(e) => setFormData(prev => ({ ...prev, color_class: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  {COLOR_CLASS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <div className={`mt-2 h-4 rounded bg-gradient-to-r ${formData.color_class}`}></div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Default Slots
                </label>
                <input
                  type="number"
                  value={formData.slots}
                  onChange={(e) => setFormData(prev => ({ ...prev, slots: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
                <p className="text-xs text-gray-500 mt-1">Number of empty slots to show by default</p>
              </div>
            </div>

            <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-gray-600">
              <button
                onClick={handleSave}
                disabled={saving}
                className={`flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors duration-200 ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Save className="w-5 h-5" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={handleBack}
                disabled={saving}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
