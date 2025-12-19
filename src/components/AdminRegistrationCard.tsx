import React, { useState } from 'react';
import { Save, Trash2, Edit2, Search } from 'lucide-react';
import { Registration } from '../types';
import { searchGiphyGifs } from '../utils/giphy';

interface AdminRegistrationCardProps {
  registration: Registration;
  onUpdate: (updatedRegistration: Registration) => Promise<void>;
  onDelete: () => Promise<void>;
  categoryName?: string;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragEnter?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave?: (e: React.DragEvent<HTMLDivElement>) => void;
}

export const AdminRegistrationCard: React.FC<AdminRegistrationCardProps> = ({
  registration,
  onUpdate,
  onDelete,
  categoryName,
  draggable,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnter,
  onDragLeave
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: registration.name,
    description: registration.description,
    gif_url: registration.gif_url || ''
  });
  
  // GIF Search state
  const [gifSearchQuery, setGifSearchQuery] = useState('');
  const [gifSearchResults, setGifSearchResults] = useState<string[]>([]);
  const [isSearchingGifs, setIsSearchingGifs] = useState(false);
  const [showGifSearch, setShowGifSearch] = useState(false);
  const [preSearchGifUrl, setPreSearchGifUrl] = useState('');


  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updated: Registration = {
        ...registration,
        name: formData.name,
        description: formData.description,
        gif_url: formData.gif_url || null
      };
      await onUpdate(updated);
      setIsEditing(false);
      setShowGifSearch(false);
      setGifSearchResults([]);
    } catch (error) {
      console.error('Error saving registration:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: registration.name,
      description: registration.description,
      gif_url: registration.gif_url || ''
    });
    setIsEditing(false);
    setShowGifSearch(false);
    setGifSearchResults([]);
  };

  const handleSearchGifs = async () => {
    if (!gifSearchQuery.trim()) return;
    
    setIsSearchingGifs(true);
    try {
      const results = await searchGiphyGifs(gifSearchQuery);
      setGifSearchResults(results);
    } catch (error) {
      console.error('Error searching GIFs:', error);
    } finally {
      setIsSearchingGifs(false);
    }
  };

  if (isEditing) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-2 border-orange-200 dark:border-orange-900 shadow-lg">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              GIF URL
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.gif_url}
                onChange={(e) => setFormData(prev => ({ ...prev, gif_url: e.target.value }))}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                placeholder="https://media.giphy.com/..."
              />
              <button
                onClick={() => {
                   if (!showGifSearch) {
                       setPreSearchGifUrl(formData.gif_url);
                       setShowGifSearch(true);
                   } else {
                       setShowGifSearch(false);
                   }
                }}
                className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                title="Search for a GIF"
              >
                <Search className="w-4 h-4" />
              </button>

            </div>
          </div>

          {showGifSearch && (
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={gifSearchQuery}
                  onChange={(e) => setGifSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchGifs()}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  placeholder="Search Giphy..."
                />
                <button
                  onClick={handleSearchGifs}
                  disabled={isSearchingGifs}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {isSearchingGifs ? '...' : 'Search'}
                </button>
              </div>

            {gifSearchResults.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-60 overflow-y-auto p-1 mb-4">
                  {gifSearchResults.map((url, index) => (
                    <button
                      key={index}
                      onClick={() => setFormData(prev => ({ ...prev, gif_url: url }))}
                      className={`relative group rounded-lg overflow-hidden border-2 focus:outline-none ${
                        formData.gif_url === url 
                          ? 'border-orange-500 ring-2 ring-orange-200' 
                          : 'border-transparent hover:border-orange-500'
                      }`}
                    >
                      <img src={url} alt="Search result" className="w-full h-24 object-cover" />
                    </button>
                  ))}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => {
                        setFormData(prev => ({ ...prev, gif_url: preSearchGifUrl }));
                        setShowGifSearch(false);
                        setGifSearchResults([]);
                    }}
                    className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                        setShowGifSearch(false);
                        setGifSearchResults([]);
                    }}
                    className="px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    OK
                  </button>
              </div>
            </div>
          )}

          {formData.gif_url && (
            <div className="mt-2 text-center">
              <p className="text-xs text-gray-500 mb-1">Preview:</p>
              <img 
                src={formData.gif_url} 
                alt="GIF Preview" 
                className="h-32 mx-auto rounded-lg object-contain bg-black/5 dark:bg-white/5"
                onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
              />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      draggable={draggable && !isEditing}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      className={`flex flex-col sm:flex-row items-start gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow ${draggable && !isEditing ? 'cursor-move active:cursor-grabbing' : ''}`}
    >
      {registration.gif_url ? (
        <div className="w-full sm:w-32 h-32 flex-shrink-0 bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden">
          <img 
            src={registration.gif_url} 
            alt={registration.description} 
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="w-full sm:w-32 h-32 flex-shrink-0 bg-gray-100 dark:bg-gray-900 rounded-lg flex items-center justify-center text-gray-400">
          <span className="text-xs">No GIF</span>
        </div>
      )}

      <div className="flex-1 min-w-0 w-full">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {categoryName && (
                <span className="px-2 py-0.5 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 text-xs rounded-full font-medium">
                  {categoryName}
                </span>
              )}
              {registration.slot_number && (
                <span className="text-xs text-gray-500">Slot #{registration.slot_number}</span>
              )}
            </div>
            <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg">
              {registration.description}
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              {registration.name}
            </p>
            <div className="mt-2 text-xs text-gray-400 flex items-center gap-4">
              <span>Created: {new Date(registration.created_at || Date.now()).toLocaleDateString()}</span>
            </div>
          </div>
          
          <div className="flex gap-2 flex-shrink-0 ml-4">
            <button
              onClick={() => setIsEditing(true)}
              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
              title="Edit"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={onDelete}
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
