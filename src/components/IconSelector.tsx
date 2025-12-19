import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { POPULAR_POTLUCK_ICONS, ALL_POTLUCK_ICONS, getIconComponent } from '../utils/lucideIcons';

interface IconSelectorProps {
  selectedIcon: string;
  onIconSelect: (icon: string) => void;
}

export const IconSelector: React.FC<IconSelectorProps> = ({ selectedIcon, onIconSelect }) => {
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
