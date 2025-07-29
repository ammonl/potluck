import React from 'react';
import { Users, Calendar, Sun, Moon } from 'lucide-react';
import { useDarkMode } from '../hooks/useDarkMode';
import { useLanguage } from '../contexts/LanguageContext';
import { getIconComponent } from '../utils/lucideIcons';

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
  icon?: string;
}

interface BBQHeaderProps {
  potluck: Potluck | null;
}

export const BBQHeader: React.FC<BBQHeaderProps> = ({ potluck }) => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { language, toggleLanguage } = useLanguage();

  const formatDateTime = (dateTimeString: string, language: string) => {
    // Parse the UTC datetime and convert to local time for display
    const date = new Date(dateTimeString);
    
    if (language === 'da') {
      // Danish formatting
      return date.toLocaleString('da-DK', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        timeZone: 'UTC'
      });
    }      

    return date.toLocaleString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: 'UTC'
    });
  };

  const getTitle = () => {
    if (!potluck) return language === 'en' ? 'Loading...' : 'Indlæser...';
    return language === 'en' ? potluck.title_en : potluck.title_da;
  };

  const getSubtitle = () => {
    if (!potluck) return '';
    return language === 'en' ? potluck.subtitle_en : potluck.subtitle_da;
  };

  const getFormattedDate = () => {
    if (!potluck) return '';
    return formatDateTime(potluck.event_datetime, language);
  };

  const getOverlayStyle = () => {
    const color = potluck?.header_overlay_color || 'black';
    const opacity = potluck?.header_overlay_opacity ?? 0.20;
    
    // Handle different color formats
    if (color.startsWith('#') || color.startsWith('rgb') || color.startsWith('hsl')) {
      return { backgroundColor: color, opacity };
    } else {
      // Named colors or other formats
      return { backgroundColor: color, opacity };
    }
  };

  const IconComponent = getIconComponent(potluck?.icon || 'Flame');

  return (
    <div className="bg-gradient-to-r from-orange-600 via-red-600 to-yellow-600 dark:from-orange-800 dark:via-red-800 dark:to-yellow-800 text-white py-16 px-4 relative overflow-hidden">
      {/* Background flag image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
        style={{ backgroundImage: `url(${potluck?.header_background || '/background.JPG'})` }}
      ></div>
      <div 
        className="absolute inset-0 dark:opacity-[0.4]" 
        style={getOverlayStyle()}
      ></div>
      <div className="relative max-w-6xl mx-auto text-center">
        {/* Controls */}
        <div className="absolute top-4 right-4 flex gap-2 z-50">
          {language === 'en' ? (
            <button
              onClick={toggleLanguage}
              className="p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-all duration-200 relative z-50"
              aria-label="Switch to Danish"
              title="Switch to Danish"
            >
              <img 
                src="https://un17hub.com/images/flag-dk.png" 
                alt="Danish flag"
                className="w-8 h-6 rounded object-cover"
              />
            </button>
          ) : (
            <button
              onClick={toggleLanguage}
              className="p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-all duration-200 relative z-50"
              aria-label="Switch to English"
              title="Switch to English"
            >
              <img 
                src="https://flagcdn.com/w40/gb.png" 
                alt="British flag"
                className="w-8 h-6 rounded object-cover"
              />
            </button>
          )}
          <button
            onClick={toggleDarkMode}
            className="p-3 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-all duration-200 relative z-50"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? (
              <Sun className="w-6 h-6 text-yellow-300" />
            ) : (
              <Moon className="w-6 h-6 text-blue-200" />
            )}
          </button>
        </div>
        
        <div className="flex justify-center items-center gap-4 mb-6">
          <IconComponent className="w-12 h-12 text-yellow-300 animate-pulse" />
          <h1 className="text-5xl md:text-7xl font-bold">
            {getTitle()}
          </h1>
          <IconComponent className="w-12 h-12 text-yellow-300 animate-pulse" />
        </div>
        
        <p className="text-xl md:text-2xl mb-8 font-light opacity-90">
          {getSubtitle()}
        </p>
        
        <div className="flex flex-wrap justify-center gap-8 text-sm md:text-base">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            <span>{getFormattedDate()}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            <span>{language === 'en' ? "You're Invited" : 'Du er inviteret'}</span>
          </div>
          <div className="flex items-center gap-2">
            <IconComponent className="w-5 h-5" />
            <span>{language === 'en' ? 'Bring Your Appetite' : 'Tag din appetit med'}</span>
          </div>
        </div>
      </div>
      
      {/* Decorative BBQ icons */}
      <div className="absolute top-4 left-4 text-6xl opacity-10">🔥</div>
      <div className="absolute top-8 right-8 text-4xl opacity-10">🍖</div>
      <div className="absolute bottom-4 left-8 text-5xl opacity-10">🌭</div>
      <div className="absolute bottom-8 right-4 text-3xl opacity-10">🍺</div>
    </div>
  );
};