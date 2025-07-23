import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Eye, Lock, Database, Mail } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useDarkMode } from '../hooks/useDarkMode';

interface PrivacyPageProps {
  onBack?: () => void;
}

export const PrivacyPage: React.FC<PrivacyPageProps> = ({ onBack }) => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { isDarkMode } = useDarkMode();

  const content = {
    en: {
      title: "Privacy Policy",
      lastUpdated: "Last updated: January 2025",
      sections: [
        {
          icon: <Eye className="w-6 h-6" />,
          title: "Information We Collect",
          content: [
            "When you sign up for our potluck events, we collect:",
            "• Your name (as provided by you)",
            "• Description of items you're bringing",
            "• Category selection for your contribution",
            "• Automatically generated GIF images related to your food items"
          ]
        },
        {
          icon: <Database className="w-6 h-6" />,
          title: "How We Use Your Information",
          content: [
            "We use the information you provide to:",
            "• Display your registration on the potluck signup page",
            "• Organize food contributions by category",
            "• Enable real-time updates for all participants",
            "• Enhance the visual experience with relevant GIFs"
          ]
        },
        {
          icon: <Lock className="w-6 h-6" />,
          title: "Data Storage and Security",
          content: [
            "Your data is stored securely using Supabase infrastructure:",
            "• All data is encrypted in transit and at rest",
            "• We implement industry-standard security measures",
            "• Access is limited to necessary functionality only",
            "• No sensitive personal information is collected"
          ]
        },
        {
          icon: <Shield className="w-6 h-6" />,
          title: "Third-Party Services",
          content: [
            "We use the following third-party services:",
            "• Supabase for database and real-time functionality",
            "• Giphy API for food-related GIF images",
            "• OpenAI API for food item extraction (optional)",
            "• These services have their own privacy policies"
          ]
        },
        {
          icon: <Mail className="w-6 h-6" />,
          title: "Your Rights",
          content: [
            "You have the right to:",
            "• Edit or delete your registrations at any time",
            "• Request removal of your data",
            "• Access information about how your data is used",
            "• Contact us with privacy-related questions"
          ]
        }
      ],
      contact: "If you have any questions about this Privacy Policy, please contact the event organizer."
    },
    da: {
      title: "Privatlivspolitik",
      lastUpdated: "Sidst opdateret: Januar 2025",
      sections: [
        {
          icon: <Eye className="w-6 h-6" />,
          title: "Oplysninger Vi Indsamler",
          content: [
            "Når du tilmelder dig vores potluck-arrangementer, indsamler vi:",
            "• Dit navn (som angivet af dig)",
            "• Beskrivelse af hvad du medbringer",
            "• Kategori-valg for dit bidrag",
            "• Automatisk genererede GIF-billeder relateret til dine madvarer"
          ]
        },
        {
          icon: <Database className="w-6 h-6" />,
          title: "Hvordan Vi Bruger Dine Oplysninger",
          content: [
            "Vi bruger de oplysninger, du giver, til at:",
            "• Vise din tilmelding på potluck-tilmeldingssiden",
            "• Organisere mad-bidrag efter kategori",
            "• Muliggøre realtidsopdateringer for alle deltagere",
            "• Forbedre den visuelle oplevelse med relevante GIF'er"
          ]
        },
        {
          icon: <Lock className="w-6 h-6" />,
          title: "Datalagring og Sikkerhed",
          content: [
            "Dine data gemmes sikkert ved hjælp af Supabase-infrastruktur:",
            "• Alle data er krypteret under transport og hvile",
            "• Vi implementerer branchestandarder for sikkerhed",
            "• Adgang er begrænset til nødvendig funktionalitet",
            "• Ingen følsomme personlige oplysninger indsamles"
          ]
        },
        {
          icon: <Shield className="w-6 h-6" />,
          title: "Tredjepartstjenester",
          content: [
            "Vi bruger følgende tredjepartstjenester:",
            "• Supabase til database og realtidsfunktionalitet",
            "• Giphy API til mad-relaterede GIF-billeder",
            "• OpenAI API til udvinding af madvarer (valgfrit)",
            "• Disse tjenester har deres egne privatlivspolitikker"
          ]
        },
        {
          icon: <Mail className="w-6 h-6" />,
          title: "Dine Rettigheder",
          content: [
            "Du har ret til at:",
            "• Redigere eller slette dine tilmeldinger når som helst",
            "• Anmode om fjernelse af dine data",
            "• Få adgang til oplysninger om hvordan dine data bruges",
            "• Kontakte os med privatlivsrelaterede spørgsmål"
          ]
        }
      ],
      contact: "Hvis du har spørgsmål om denne privatlivspolitik, bedes du kontakte arrangøren."
    }
  };

  const currentContent = content[language];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 dark:from-blue-800 dark:via-purple-800 dark:to-blue-900 text-white py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={onBack || (() => navigate('/'))}
              className="p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-all duration-200"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <Shield className="w-8 h-8" />
            <h1 className="text-3xl font-bold">{currentContent.title}</h1>
          </div>
          <p className="text-lg opacity-90">{currentContent.lastUpdated}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-8">
          {currentContent.sections.map((section, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg text-blue-600 dark:text-blue-300">
                  {section.icon}
                </div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{section.title}</h2>
              </div>
              <div className="space-y-2">
                {section.content.map((paragraph, pIndex) => (
                  <p key={pIndex} className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <Mail className="w-6 h-6 text-blue-600 dark:text-blue-300" />
            <h3 className="text-lg font-bold text-blue-800 dark:text-blue-200">Contact</h3>
          </div>
          <p className="text-blue-700 dark:text-blue-300">{currentContent.contact}</p>
        </div>
      </div>
    </div>
  );
};