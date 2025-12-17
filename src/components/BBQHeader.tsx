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
  gradient_from?: string;
  gradient_to?: string;
  header_overlay_opacity?: number;
  icon?: string;
}

interface PotluckHeaderProps {
  potluck: Potluck | null;
}

export const BBQHeader: React.FC<PotluckHeaderProps> = ({ potluck }) => {
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

  const getGradientStyle = () => {
    const from = potluck?.gradient_from || '#ea580c'; // orange-600
    const to = potluck?.gradient_to || '#ca8a04'; // yellow-600
    const opacity = potluck?.header_overlay_opacity ?? 0.9;
    
    return {
      background: `linear-gradient(to right, ${from}, ${to})`,
      opacity
    };
  };

  const IconComponent = getIconComponent(potluck?.icon || 'Flame');

  return (
    <div className="text-white py-16 px-4 relative overflow-hidden">
      {/* Background flag image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
        style={{ backgroundImage: `url(${potluck?.header_background || '/background.JPG'})` }}
      ></div>
      <div 
        className="absolute inset-0 z-10" 
        style={getGradientStyle()}
      ></div>
      <div className="relative max-w-6xl mx-auto text-center z-20">

        
        <div className="flex justify-center items-center gap-4 mb-6">
          <IconComponent className="w-12 h-12 text-yellow-300 animate-pulse drop-shadow-lg" />
          <h1 className="text-5xl md:text-7xl font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            {getTitle()}
          </h1>
          <IconComponent className="w-12 h-12 text-yellow-300 animate-pulse drop-shadow-lg" />
        </div>
        
        <p className="text-xl md:text-2xl mb-8 font-light opacity-100 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
          {getSubtitle()}
        </p>
        
        <div className="flex flex-wrap justify-center gap-8 text-sm md:text-base drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
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
    </div>
  );
};