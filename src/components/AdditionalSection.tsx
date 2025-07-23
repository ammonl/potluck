import React from 'react';
import { useState, useEffect } from 'react';
import { Registration, Category } from '../types';
import { RegistrationCard } from './RegistrationCard';
import { Language } from '../utils/translations';

interface AdditionalSectionProps {
  items: Registration[];
  onAddItem: (registration: Registration) => Promise<void>;
  onUpdateItem: (index: number, registration: Registration) => Promise<void>;
  onRemoveItem: (index: number) => void;
  category: Category;
  language: Language;
}

export const AdditionalSection: React.FC<AdditionalSectionProps> = ({
  items,
  onAddItem,
  onUpdateItem,
  onRemoveItem,
  category,
  language
}) => {
  const [title, setTitle] = useState('');

  // Update title when language or category changes
  useEffect(() => {
    setTitle(language === 'en' ? category.title_en : category.title_da);
  }, [category, language]);

  return (
    <div className="mb-12">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-4xl">{category.icon}</span>
        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">{title}</h2>
        <div className={`flex-1 h-1 bg-gradient-to-r ${category.color_class} rounded-full ml-4`}></div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item, index) => (
          <RegistrationCard
            key={item.id}
            registration={item}
            onSave={(registration) => onUpdateItem(index, registration)}
            onRemove={() => onRemoveItem(index)}
            category={category}
            isAdditional={true}
            language={language}
          />
        ))}
        
        <RegistrationCard
          registration={null}
          onSave={onAddItem}
          category={category}
          isAdditional={true}
          language={language}
        />
      </div>
    </div>
  );
};