import React from 'react';
import { useState, useEffect } from 'react';
import { Registration, Category } from '../types';
import { RegistrationCard } from './RegistrationCard';
import { Language } from '../utils/translations';

interface CategorySectionProps {
  category: Category;
  items: (Registration | null)[];
  onUpdateItem: (index: number, registration: Registration) => Promise<void>;
  onRemoveItem: (index: number) => void;
  language: Language;
  potluckIcon?: string;
}

export const CategorySection: React.FC<CategorySectionProps> = ({
  category,
  items,
  onUpdateItem,
  onRemoveItem,
  language,
  potluckIcon
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // Update titles when language or category changes
  useEffect(() => {
    setTitle(language === 'en' ? category.title_en : category.title_da);
    setDescription(language === 'en' ? category.placeholder_en : category.placeholder_da);
  }, [category, language]);

  const getPlaceholder = () => {
    return language === 'en' ? category.placeholder_en : category.placeholder_da;
  };

  return (
    <div className="mb-12">
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{category.icon}</span>
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">{title}</h2>
          <div className={`flex-1 h-1 bg-gradient-to-r ${category.color_class} rounded-full ml-4`}></div>
        </div>
        {description && (
          <p className="text-gray-600 dark:text-gray-400 text-lg mt-2">{description}</p>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item, index) => (
          <RegistrationCard
            key={`${category.name}-${index}`}
            registration={item}
            onSave={(registration) => onUpdateItem(index, registration)}
            onRemove={() => onRemoveItem(index)}
            category={category}
            slotNumber={index + 1}
            placeholder={getPlaceholder()}
            language={language}
            potluckIcon={potluckIcon}
          />
        ))}
      </div>
    </div>
  );
};