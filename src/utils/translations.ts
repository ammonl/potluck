export type Language = 'en' | 'da';

export const translations = {
  en: {
    // Header
    title: "Grillaften 2: Revenge of the Sausages",
    subtitle: "Sign up to bring delicious food & drinks to our epic barbecue!",
    date: "Friday July 25th 7PM",
    invited: "You're Invited",
    bringAppetite: "Bring Your Appetite",
    
    // Categories
    mainDishes: "Main Dishes",
    sideDishes: "Side Dishes",
    desserts: "Desserts",
    drinks: "Drinks",
    other: "Other",
    additionalItems: "Additional Items",
    
    // Singular forms
    mainDish: "Main Dish",
    sideDish: "Side Dish",
    dessert: "Dessert",
    drink: "Drink",
    additional: "Additional",
    
    // Form labels
    yourName: "Your Name",
    whatBringing: "What are you bringing?",
    enterName: "Enter your name",
    describeBringing: "Describe what you're bringing...",
    
    // Buttons and actions
    save: "Save",
    saving: "Saving...",
    cancel: "Cancel",
    clear: "Clear",
    clickToSignUp: "Click to sign up!",
    addSomethingExtra: "Add Something Extra",
    gotSomethingSpecial: "Got something special to bring?",
    
    // Placeholders
    placeholders: {
      hotDogs: "Hot dogs",
      buns: "Buns",
      otherMeat: "Other meat",
      fire: "Fire",
      plates: "Plates",
      cups: "Cups",
      utensils: "Utensils",
      napkins: "Napkins"
    },
    
    // Footer
    footerTitle: "Let's Make This BBQ Epic!",
    footerText: "Thanks for signing up to bring something delicious. Can't wait to see everyone there!",
    
    // Loading and errors
    loadingBBQ: "Loading signups...",
    incompleteWarning: "⚠️ You have incomplete entries. Please fill in all names and descriptions before leaving.",
    
    // Additional
    additionalItem: "Additional Item",
    by: "by"
  },
  da: {
    // Header
    title: "Grillaften 2: Pølsernes Hævn",
    subtitle: "Tilmeld dig for at medbringe lækker mad og drikke til vores episke grillfest!",
    date: "Fredag d. 25. juli kl. 19",
    invited: "Du er inviteret",
    bringAppetite: "Tag din appetit med",
    
    // Categories
    mainDishes: "Hovedretter",
    sideDishes: "Tilbehør",
    desserts: "Desserter",
    drinks: "Drikkevarer",
    other: "Andet",
    additionalItems: "Ekstra Ting",
    
    // Singular forms
    mainDish: "Hovedret",
    sideDish: "Tilbehør",
    dessert: "Dessert",
    drink: "Drikkevare",
    additional: "Ekstra",
    
    // Form labels
    yourName: "Dit navn",
    whatBringing: "Hvad medbringer du?",
    enterName: "Indtast dit navn",
    describeBringing: "Beskriv hvad du medbringer...",
    
    // Buttons and actions
    save: "Gem",
    saving: "Gemmer...",
    cancel: "Annuller",
    clear: "Ryd",
    clickToSignUp: "Klik for at tilmelde dig!",
    addSomethingExtra: "Tilføj Noget Ekstra",
    gotSomethingSpecial: "Har du noget særligt at medbringe?",
    
    // Placeholders
    placeholders: {
      hotDogs: "Pølser",
      buns: "Pølsebrød",
      otherMeat: "Andet kød",
      fire: "Ild",
      plates: "Tallerkener",
      cups: "Kopper",
      utensils: "Bestik",
      napkins: "Servietter"
    },
    
    // Footer
    footerTitle: "Lad os gøre denne grillfest episk!",
    footerText: "Tak fordi du tilmelder dig til at medbringe noget lækkert. Glæder mig til at se alle sammen!",
    
    // Loading and errors
    loadingBBQ: "Indlæser grillfest tilmeldinger...",
    incompleteWarning: "⚠️ Du har ufuldstændige indtastninger. Udfyld venligst alle navne og beskrivelser før du forlader siden.",
    
    // Additional
    additionalItem: "Ekstra Ting",
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