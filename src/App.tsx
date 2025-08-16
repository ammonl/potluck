import { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useNavigate, useLocation, useParams } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { Settings } from 'lucide-react';
import { AuthGuard } from './components/AuthGuard';
import { BBQData, Registration, Category } from './types';
import { loadBBQData, hasIncompleteEntries, subscribeToChanges, saveRegistration, deleteRegistration, loadPotluckCategories } from './utils/database';
import { useLanguage } from './contexts/LanguageContext';
import { getTranslation } from './utils/translations';
import { BBQHeader } from './components/BBQHeader';
import { CategorySection } from './components/CategorySection';
import { AdditionalSection } from './components/AdditionalSection';
import { AdminPage } from './components/AdminPage';
import { PrivacyPage } from './components/PrivacyPage';
import { TermsPage } from './components/TermsPage';
import { PotluckEditPage } from './components/PotluckEditPage';

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
  organizer_name?: string;
  organizer_email?: string;
  footer_emojis?: string | null;
  icon?: string;
}

function App() {
  const location = useLocation();
  const navigate = useNavigate();

  // Handle authentication callback
  useEffect(() => {
    // Check if we're on any page with auth tokens in the URL
    if (location.hash && location.hash.includes('access_token')) {
      // Let Supabase handle the auth callback
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          // Clear the hash and redirect to admin
          window.history.replaceState({}, document.title, '/admin');
          navigate('/admin', { replace: true });
        }
      });
    }
  }, [location, navigate]);

  return (
    <Routes>
      <Route path="/" element={<AuthGuard><MainApp /></AuthGuard>} />
      <Route path="/:slug" element={<AuthGuard><MainApp /></AuthGuard>} />
      <Route path="/admin" element={<AuthGuard requireAuth><AdminPageWithTitle onBack={() => window.location.href = '/'} /></AuthGuard>} />
      <Route path="/admin/potluck/:id" element={<AuthGuard requireAuth><PotluckEditPageWithTitle onBack={() => navigate('/admin')} /></AuthGuard>} />
      <Route path="/privacy" element={<AuthGuard><PrivacyPageWithTitle onBack={() => window.location.href = '/'} /></AuthGuard>} />
      <Route path="/terms" element={<AuthGuard><TermsPageWithTitle onBack={() => window.location.href = '/'} /></AuthGuard>} />
    </Routes>
  );
}

// Wrapper components to set page titles
function AdminPageWithTitle(props: any) {
  useEffect(() => {
    document.title = 'Potluck Organizer - Admin';
  }, []);
  return <AdminPage {...props} />;
}

function PotluckEditPageWithTitle(props: any) {
  useEffect(() => {
    document.title = 'Potluck Organizer - Edit Potluck';
  }, []);
  return <PotluckEditPage {...props} />;
}

function PrivacyPageWithTitle(props: any) {
  useEffect(() => {
    document.title = 'Potluck Organizer - Privacy Policy';
  }, []);
  return <PrivacyPage {...props} />;
}

function TermsPageWithTitle(props: any) {
  useEffect(() => {
    document.title = 'Potluck Organizer - Terms of Service';
  }, []);
  return <TermsPage {...props} />;
}

function MainApp() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { slug } = useParams<{ slug?: string }>();
  const [potluck, setPotluck] = useState<Potluck | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [data, setData] = useState<BBQData>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [slugInput, setSlugInput] = useState('');
  const [slugError, setSlugError] = useState('');
  const [footerTitle, setFooterTitle] = useState('');
  const [footerText, setFooterText] = useState('');

  // Update page title when potluck or language changes
  useEffect(() => {
    if (potluck) {
      const title = language === 'en' ? potluck.title_en : potluck.title_da;
      document.title = title;
    } else {
      document.title = 'Potluck Organizer';
    }
  }, [potluck, language]);

  // Update footer content when potluck or language changes
  useEffect(() => {
    const newFooterTitle = potluck
      ? language === 'en' ? potluck.footer_en : potluck.footer_da
      : '';
    
    const newFooterText = language === 'en' 
      ? "Thanks for signing up to bring something delicious. Can't wait to see everyone there!" 
      : 'Tak fordi du tilmelder dig til at medbringe noget lækkert. Glæder mig til at se alle sammen!';

    setFooterTitle(newFooterTitle);
    setFooterText(newFooterText);
  }, [potluck, language]); // Remove footerTitle and footerText from dependencies

  // Load potluck metadata
  useEffect(() => {
    const loadPotluckData = async () => {
      try {
        let query = supabase.from('potlucks').select('*');
        
        if (slug) {
          // Load specific potluck by slug
          query = query.eq('slug', slug).eq('is_active', true);
        } else {
          // Load the default potluck for home page
          query = query.eq('slug', import.meta.env.VITE_DEFAULT_POTLUCK).eq('is_active', true);
        }
        
        const { data: potlucks, error } = await query;

        if (error) {
          console.error('Error loading potluck:', error);
          return;
        }

        if (potlucks && potlucks.length > 0) {
          setPotluck(potlucks[0]);
        } else if (slug) {
          // If slug provided but no potluck found, redirect to home
          navigate('/', { replace: true });
        }
      } catch (error) {
        console.error('Error loading potluck:', error);
      }
    };

    loadPotluckData();
  }, [slug, navigate]);

  // Load categories
  useEffect(() => {
    const loadCategoriesData = async () => {
      if (potluck) {
        const potluckCategories = await loadPotluckCategories(potluck.id);
        const categoriesData = potluckCategories.map(pc => pc.category!).filter(Boolean);
        setCategories(categoriesData);
      }
    };

    loadCategoriesData();
  }, [potluck]);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      if (!potluck) return;
      
      setIsLoading(true);
      const initialData = await loadBBQData(potluck.id);
      setData(initialData);
      setIsLoading(false);
    };

    loadInitialData();
  }, [potluck]);

  // Subscribe to real-time changes
  useEffect(() => {
    if (!potluck) return;
    
    const unsubscribe = subscribeToChanges((newData) => {
      setData(newData);
    }, potluck.id);

    return unsubscribe;
  }, [potluck]);

  // Check for incomplete entries and warn before page unload
  useEffect(() => {
    const incomplete = hasIncompleteEntries(data);
    setHasUnsavedChanges(incomplete);

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (incomplete) {
        e.preventDefault();
        e.returnValue = 'You have incomplete entries. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    if (incomplete) {
      window.addEventListener('beforeunload', handleBeforeUnload);
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [data]);

  // Generic handlers for any category
  const handleUpdateItem = useCallback(async (categoryId: string, index: number, registration: Registration): Promise<void> => {
    if (!potluck) return;
    
    const updatedRegistration = {
      ...registration,
      category: categoryId,
      slot_number: index + 1
    };
    
    const saved = await saveRegistration(updatedRegistration, potluck.id);
    if (saved) {
      const newData = { ...data };
      const key = getCategoryKey(categoryId);
      // Expand array if needed
      if (!newData[key]) {
        newData[key] = [];
      }
      const items = newData[key] as (Registration | null)[];
      while (items.length <= index) {
        items.push(null);
      }
      items[index] = saved;

      ensureOneEmptySlot(items)
      
      setData(newData);
    }
  }, [data, potluck]);

  const handleRemoveItem = useCallback(async (category: Category, index: number) => {
    if (!potluck) return;

    const key = getCategoryKey(category.id);
    const items = data[key] as (Registration | null)[] || [];
    const registration = items[index];
    if (registration && await deleteRegistration(registration.id)) {
      const newData = { ...data };
      const updatedItems = [...items];
      updatedItems[index] = null;
      
      // Remove trailing empty slots (keep at least the default number)
      const defaultCount = category.slots;
      while (updatedItems.length > defaultCount && 
             updatedItems[updatedItems.length - 1] === null) {
        updatedItems.pop();
      }
      ensureOneEmptySlot(updatedItems)
      newData[key] = updatedItems;
      setData(newData);
    }
  }, [data, potluck]);

  const handleAddAdditional = useCallback(async (registration: Registration): Promise<void> => {
    if (!potluck) return;
    
    const updatedRegistration = {
      ...registration,
      category: categories.find(c => c.title_en === 'Additional Items')?.id || 'additional',
      slot_number: null
    };
    
    const saved = await saveRegistration(updatedRegistration, potluck.id);
    if (saved) {
      const newData = { ...data };
      (newData.additional as Registration[] || []).push(saved);
      setData(newData);
    }
  }, [data, potluck, categories]);

  const handleUpdateAdditional = useCallback(async (index: number, registration: Registration): Promise<void> => {
    if (!potluck) return;
    
    const updatedRegistration = {
      ...registration,
      category: categories.find(c => c.title_en === 'Additional Items')?.id || 'additional',
      slot_number: null
    };
    
    const saved = await saveRegistration(updatedRegistration, potluck.id);
    if (saved) {
      const newData = { ...data };
      const additional = newData.additional as Registration[] || [];
      additional[index] = saved;
      newData.additional = additional;
      setData(newData);
    }
  }, [data, potluck, categories]);

  const handleRemoveAdditional = useCallback(async (index: number) => {
    const additional = data.additional as Registration[] || [];
    const registration = additional[index];
    if (registration && await deleteRegistration(registration.id)) {
      const newData = { ...data };
      const updatedAdditional = [...additional];
      updatedAdditional.splice(index, 1);
      newData.additional = updatedAdditional;
      setData(newData);
    }
  }, [data]);

  if (!potluck) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="mb-8 text-6xl">🎉 🍽️ 🥗</div>
          <h1 className="text-4xl font-bold mb-6 text-gray-800 dark:text-white">
            {language === 'en' ? 'Welcome to Potluck Organizer!' : 'Velkommen til Potluck Organizer!'}
          </h1>
          <p className="text-xl mb-8 text-gray-600 dark:text-gray-300">
            {language === 'en' 
              ? 'The easiest way to organize your next gathering.'
              : 'Den nemmeste måde at organisere din næste sammenkomst.'}
          </p>

          <div className="max-w-md mx-auto mb-12">
            <form onSubmit={async (e) => {
              e.preventDefault();
              setSlugError('');
              if (!slugInput.trim()) {
                setSlugError(language === 'en' ? 'Please enter a potluck code' : 'Indtast venligst en potluck-kode');
                return;
              }
              
              const { data: potlucks, error } = await supabase
                .from('potlucks')
                .select('*')
                .eq('slug', slugInput.trim())
                .eq('is_active', true)
                .limit(1);

              if (error) {
                console.error('Error checking potluck:', error);
                setSlugError(language === 'en' ? 'An error occurred' : 'Der opstod en fejl');
                return;
              }

              if (!potlucks || potlucks.length === 0) {
                setSlugError(language === 'en' ? 'Potluck not found' : 'Potluck blev ikke fundet');
                return;
              }

              navigate(`/${slugInput.trim()}`);
            }}>
              <div className="flex flex-col gap-2 mb-4">
                <label htmlFor="potluck-slug" className="text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                  {language === 'en' ? 'Enter your potluck code' : 'Indtast din potluck-kode'}
                </label>
                <input
                  id="potluck-slug"
                  type="text"
                  value={slugInput}
                  onChange={(e) => {
                    setSlugInput(e.target.value);
                    setSlugError('');
                  }}
                  placeholder={language === 'en' ? 'e.g., summer-bbq' : 'f.eks. sommer-grillfest'}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
                {slugError && (
                  <p className="text-sm text-red-600 dark:text-red-400">{slugError}</p>
                )}
              </div>
              <button
                type="submit"
                className="w-full px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg shadow-lg transition-colors duration-200"
              >
                {language === 'en' ? 'Join Potluck' : 'Deltag i Potluck'}
              </button>
            </form>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <div className="text-4xl mb-4">🤝</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">
                {language === 'en' ? 'Easy to Share' : 'Nem at Dele'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {language === 'en' 
                  ? 'Share a simple link with your guests'
                  : 'Del et simpelt link med dine gæster'}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">
                {language === 'en' ? 'Mobile Friendly' : 'Mobilvenlig'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {language === 'en'
                  ? 'Works great on all devices'
                  : 'Fungerer perfekt på alle enheder'}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <div className="text-4xl mb-4">🔄</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">
                {language === 'en' ? 'Real-time Updates' : 'Realtidsopdateringer'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {language === 'en'
                  ? 'See changes instantly'
                  : 'Se ændringer med det samme'}
              </p>
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={() => navigate('/admin')}
              className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg shadow-lg transition-colors duration-200 flex items-center gap-2"
            >
              <Settings className="w-5 h-5" />
              {language === 'en' ? 'Open Admin Panel' : 'Åbn Adminpanel'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🍲</div>
          <p className="text-xl text-gray-600 dark:text-gray-300">{getTranslation(language, 'loadingBBQ')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <BBQHeader potluck={potluck} />
      
      {hasUnsavedChanges && (
        <div className="bg-yellow-100 dark:bg-yellow-900 border-l-4 border-yellow-500 text-yellow-700 dark:text-yellow-300 p-4 mx-4 mt-4 rounded-r-lg">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm font-medium">
                {getTranslation(language, 'incompleteWarning')}
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="max-w-7xl mx-auto px-4 py-12">
        {categories.map((category) => {
          if (category.title_en === 'Additional Items') {
            return (
              <AdditionalSection
                key={category.id}
                items={data.additional as Registration[] || []}
                onAddItem={handleAddAdditional}
                onUpdateItem={handleUpdateAdditional}
                onRemoveItem={handleRemoveAdditional}
                category={category}
                language={language}
              />
            );
          }

          // Get the appropriate data and handlers for this category
          const getCategoryData = () => {
            const key = getCategoryKey(category.id);
            const items = data[key] as (Registration | null)[] || [];
            ensureOneEmptySlot(items);

            return {
              items,
              onUpdateItem: (index: number, registration: Registration) => handleUpdateItem(category.id, index, registration),
              onRemoveItem: (index: number) => handleRemoveItem(category, index),
          };
          };

          const categoryData = getCategoryData();
          if (!categoryData) return null;

          return (
            <CategorySection
              key={category.id}
              category={category}
              items={categoryData.items}
              onUpdateItem={categoryData.onUpdateItem}
              onRemoveItem={categoryData.onRemoveItem}
              language={language}
              potluckIcon={potluck?.icon}
            />
          );
        })}
      </div>
      
      <footer className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex justify-center items-center gap-2 mb-4">
            <h3 className="text-2xl font-bold">{footerTitle}</h3>
          </div>
          <p className="text-gray-300">
            {footerText}
          </p>
          {potluck?.footer_emojis && (
            <div className="mt-6 text-4xl space-x-4">
              {potluck.footer_emojis}
            </div>
          )}
          
          {/* Event Organizer Contact */}
          {potluck?.organizer_name && potluck?.organizer_email && (
            <div className="mt-8 pt-6 border-t border-gray-700">
              <div className="bg-gray-800 rounded-lg p-4 max-w-md mx-auto">
                <h4 className="text-lg font-semibold text-white mb-2">
                  {language === 'en' ? 'Questions?' : 'Spørgsmål?'}
                </h4>
                <p className="text-gray-300 text-sm mb-3">
                  {language === 'en' 
                    ? 'Contact the event organizer for any questions about this potluck:'
                    : 'Kontakt arrangøren for spørgsmål om denne potluck:'
                  }
                </p>
                <div className="text-center">
                  <a 
                    href={`mailto:${potluck.organizer_email}`} 
                    className="text-orange-300 hover:text-orange-200 transition-colors duration-200 font-medium"
                  >
                    {potluck.organizer_name}
                  </a>
                </div>
              </div>
            </div>
          )}
          
          {/* Footer Links */}
          <div className="mt-8 pt-6 border-t border-gray-700">
            <div className="flex justify-center gap-6 text-sm items-center">
              <button
                onClick={() => navigate('/privacy')}
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                {language === 'en' ? 'Privacy Policy' : 'Privatlivspolitik'}
              </button>
              <span className="text-gray-600">•</span>
              <button
                onClick={() => navigate('/terms')}
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                {language === 'en' ? 'Terms of Service' : 'Servicevilkår'}
              </button>
              <span className="text-gray-600">•</span>
              <button
                onClick={() => navigate('/admin')}
                className="text-gray-400 hover:text-white transition-colors duration-200 p-1"
                title="Admin Panel"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Helper function to convert category ID to data key (same as in database.ts)
const getCategoryKey = (categoryId: string): string => {
  // For backward compatibility, we'll use a simple mapping based on common patterns
  if (categoryId.includes('main') || categoryId === 'main-dish') return 'mainDishes';
  if (categoryId.includes('side') || categoryId === 'side-dish') return 'sideDishes';
  if (categoryId.includes('dessert')) return 'desserts';
  if (categoryId.includes('drink')) return 'drinks';
  if (categoryId.includes('additional')) return 'additional';
  if (categoryId.includes('other')) return 'other';
  
  // For new categories, create a camelCase key from the ID
  return categoryId.replace(/-/g, '').toLowerCase();
};

const ensureOneEmptySlot = (items: (Registration | null)[]): (Registration | null)[] => {
  if (items[items.length - 1] !== null) {
    items.push(null);
  }
  return items;
};



export default App;