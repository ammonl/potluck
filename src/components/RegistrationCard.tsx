import React, { useState } from 'react';
import { useEffect } from 'react';
import { Edit2, Save, X, Trash2 } from 'lucide-react';
import { Registration, Category } from '../types';
import { Language, getTranslation } from '../utils/translations';
import { getCategoryBorderColor } from '../utils/colors';
import { getIconComponent } from '../utils/lucideIcons';


interface RegistrationCardProps {
  registration: Registration | null;
  onSave: (registration: Registration) => Promise<void>;
  onRemove?: () => void;
  category: Category;
  slotNumber?: number;
  isAdditional?: boolean;
  placeholder?: string;
  language: Language;
  potluckIcon?: string;
}

export const RegistrationCard: React.FC<RegistrationCardProps> = ({
  registration,
  onSave,
  onRemove,
  category,
  slotNumber,
  isAdditional = false,
  placeholder,
  language,
  potluckIcon
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(registration?.name || '');
  const [description, setDescription] = useState(registration?.description || '');
  const [isLoading, setIsLoading] = useState(false);
  const [singularTitle, setSingularTitle] = useState('');

  // Update singular title when language or category changes
  useEffect(() => {
    const title = language === 'en' ? category.singular_en : category.singular_da;
    const fallback = language === 'en' ? 'Dish' : 'Ret';
    setSingularTitle(title || fallback);
  }, [category, language]);

  // Update local state when registration prop changes
  useEffect(() => {
    if (registration) {
      setName(registration.name);
      setDescription(registration.description);
    } else {
      // Only reset if we are NOT currently editing a new item, or if we want to ensure blank cards are blank
      // However, resetting on null registration is generally safe as it likely means we went from filled -> empty
      setName('');
      setDescription('');
    }
  }, [registration]);

  const getPlaceholderText = () => {
    if (placeholder) {
      return placeholder;
    }
    
    const categoryPlaceholder = language === 'en' ? category.placeholder_en : category.placeholder_da;
    if (categoryPlaceholder.trim()) {
      return categoryPlaceholder;
    }
    
    return getTranslation(language, 'describeBringing');
  };


  const handleSave = async () => {
    // If both name and description are empty for an existing registration, delete it
    if (registration && !name.trim() && !description.trim()) {
      if (onRemove) {
        onRemove();
        return;
      }
    }
    
    // Don't save if either field is empty
    if (!name.trim() || !description.trim()) return;
    
    setIsLoading(true);
    try {
      const newRegistration: Registration = {
        id: registration?.id || crypto.randomUUID(),
        name: name.trim(),
        description: description.trim(),
        category: registration?.category || category.id,
        slot_number: isAdditional ? null : slotNumber,
        gif_url: registration?.gif_url
      };
      
      await onSave(newRegistration);
      // Clear data - if item stays here, useEffect will repopulate it.
      // If it moves (gravity), this ensures the slot is clean.
      setName('');
      setDescription('');
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving registration:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (registration) {
      setName(registration.name);
      setDescription(registration.description);
    } else {
      setName('');
      setDescription('');
    }
    setIsEditing(false);
  };

  const handleRemove = () => {
    if (onRemove) {
      onRemove();
      setName('');
      setDescription('');
      setIsEditing(false);
    }
  };

  const IconComponent = getIconComponent(potluckIcon || 'Flame');

  // Handle escape key to cancel editing
  useEffect(() => {
    if (isEditing) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          if (registration) {
            setName(registration.name);
            setDescription(registration.description);
          } else {
            setName('');
            setDescription('');
          }
          setIsEditing(false);
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isEditing, registration]);

  if (isEditing) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-2 transform hover:scale-105 transition-all duration-300`} style={{
        borderColor: getCategoryBorderColor(category.color_class)
      }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{category.icon}</span>
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
              {isAdditional ? singularTitle : `${singularTitle} ${slotNumber ? `#${slotNumber}` : ''}`}
            </h3>
          </div>
          {onRemove && registration && (
            <button
              onClick={handleRemove}
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
              title={getTranslation(language, 'clear')}
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {getTranslation(language, 'yourName')}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder={getTranslation(language, 'enterName')}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {getTranslation(language, 'whatBringing')}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder={getPlaceholderText()}
              rows={3}
            />
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (registration && !name.trim() && !description.trim()) {
                  handleRemove();
                } else {
                  handleSave();
                }
              }}
              disabled={isLoading}
              className={`flex-1 bg-gradient-to-r ${category.color_class} text-white px-4 py-2 rounded-lg font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2`}
            >
              <Save className="w-4 h-4" />
              {isLoading ? getTranslation(language, 'saving') : (registration && !name.trim() && !description.trim() ? getTranslation(language, 'clear') : getTranslation(language, 'save'))}
            </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                {getTranslation(language, 'cancel')}
              </button>
          </div>
        </div>
      </div>
    );
  }

  if (!registration) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl shadow-md p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-orange-300 dark:hover:border-orange-600 transition-all duration-300 cursor-pointer group"
           onClick={() => setIsEditing(true)}>
        <div className="text-center">
        
            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-200">
              {category.icon}
            </div>
          <h3 className="text-lg font-bold text-gray-600 dark:text-gray-300 mb-2">
            {isAdditional ? singularTitle : `${singularTitle} ${slotNumber ? `#${slotNumber}` : ''}`}
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {getTranslation(language, 'clickToSignUp')}
          </p>
          <IconComponent className="w-6 h-6 text-orange-500 mx-auto mt-2 group-hover:text-orange-600 transition-colors duration-200" />
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-2 transform hover:scale-105 transition-all duration-300 flex flex-col h-[300px]`} style={{
      borderColor: getCategoryBorderColor(category.color_class)
    }}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-2">
          <span className="text-2xl">{category.icon}</span>
          <div>
            <h3 
              className="text-lg font-bold text-gray-800 dark:text-gray-100 overflow-hidden"
              style={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical'
              }}
              title={registration.description}
            >
              {registration.description}
            </h3>
            <p className="text-base text-gray-600 dark:text-gray-400">{getTranslation(language, 'by')} {registration.name}</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900 rounded-lg transition-all duration-200"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          {isAdditional && onRemove && (
            <button
              onClick={onRemove}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-all duration-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      

      
      <div className="mt-auto">
        {registration.gif_url && (
          <div className="rounded-lg overflow-hidden mb-2 flex-shrink-0">
            <img
              src={registration.gif_url}
              alt={registration.description}
              className="w-full h-32 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        )}
        
        <div className={`h-2 bg-gradient-to-r ${category.color_class} rounded-full flex-shrink-0`} />
      </div>
    </div>
  );
};
