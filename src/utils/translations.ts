export type Language = 'en' | 'da';

export const translations = {
  en: {
    // Form labels
    yourName: "Your Name",
    whatBringing: "What are you bringing?",
    enterName: "Enter your name",
    describeBringing: "Describe what you're bringing...",
    
    // Buttons and actions
    saving: "Saving...",
    cancel: "Cancel",
    clear: "Clear",
    clickToSignUp: "Click to sign up!",
    
    // Loading and errors
    loadingSignups: "Loading signups...",
    incompleteWarning: "⚠️ You have incomplete entries. Please fill in all names and descriptions before leaving.",
    
    // Additional
    by: "by"
  },
  da: {
    // Form labels
    yourName: "Dit navn",
    whatBringing: "Hvad medbringer du?",
    enterName: "Indtast dit navn",
    describeBringing: "Beskriv hvad du medbringer...",
    
    // Buttons and actions
    saving: "Gemmer...",
    cancel: "Annuller",
    clear: "Ryd",
    clickToSignUp: "Klik for at tilmelde dig!",
    
    // Loading and errors
    loadingSignups: "Indlæser potluck tilmeldinger...",
    incompleteWarning: "⚠️ Du har ufuldstændige indtastninger. Udfyld venligst alle navne og beskrivelser før du forlader siden.",
    
    // Additional
    by: "af"
  }
};

export const getTranslation = (language: Language, key: string): string => {
  const keys = key.split('.');
  let value: any = translations[language];
  
  for (const k of keys) {
    value = value?.[k];
  }
  
  return value || key;
};