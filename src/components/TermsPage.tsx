import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Users, AlertTriangle, Scale, Clock } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useDarkMode } from '../hooks/useDarkMode';

interface TermsPageProps {
  onBack?: () => void;
}

export const TermsPage: React.FC<TermsPageProps> = ({ onBack }) => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { isDarkMode } = useDarkMode();

  const content = {
    en: {
      title: "Terms of Service",
      lastUpdated: "Last updated: January 2025",
      sections: [
        {
          icon: <Users className="w-6 h-6" />,
          title: "Acceptance of Terms",
          content: [
            "By using this potluck registration application, you agree to these Terms of Service.",
            "If you do not agree with any part of these terms, please do not use the application.",
            "These terms apply to all users of the potluck registration system."
          ]
        },
        {
          icon: <FileText className="w-6 h-6" />,
          title: "Use of the Service",
          content: [
            "This application is provided for organizing potluck events and managing food contributions.",
            "You may use the service to:",
            "• Register items you plan to bring to potluck events",
            "• View what others are bringing",
            "• Edit or remove your own registrations",
            "• Participate in real-time updates during events"
          ]
        },
        {
          icon: <AlertTriangle className="w-6 h-6" />,
          title: "User Responsibilities",
          content: [
            "When using this service, you agree to:",
            "• Provide accurate information about your food contributions",
            "• Respect other users and their contributions",
            "• Not submit inappropriate, offensive, or misleading content",
            "• Actually bring the items you register (when possible)",
            "• Notify organizers if you cannot attend or bring registered items"
          ]
        },
        {
          icon: <Scale className="w-6 h-6" />,
          title: "Content and Liability",
          content: [
            "You are responsible for the content you submit to the application.",
            "The application organizers are not responsible for:",
            "• Food safety or quality of contributed items",
            "• Allergic reactions or dietary restrictions",
            "• Coordination between participants outside the app",
            "• Technical issues that may affect your registration"
          ]
        },
        {
          icon: <Clock className="w-6 h-6" />,
          title: "Modifications and Termination",
          content: [
            "We reserve the right to:",
            "• Modify these terms at any time with notice",
            "• Remove inappropriate content or registrations",
            "• Temporarily or permanently suspend access if terms are violated",
            "• Update the application features and functionality",
            "• Archive or delete old potluck events and their data"
          ]
        }
      ],
      disclaimer: "This application is provided 'as is' without warranties. Use at your own discretion for potluck event coordination.",
      contact: "Questions about these terms? Contact the event organizer."
    },
    da: {
      title: "Servicevilkår",
      lastUpdated: "Sidst opdateret: Januar 2025",
      sections: [
        {
          icon: <Users className="w-6 h-6" />,
          title: "Accept af Vilkår",
          content: [
            "Ved at bruge denne potluck-tilmeldingsapplikation accepterer du disse servicevilkår.",
            "Hvis du ikke er enig i nogen del af disse vilkår, bedes du ikke bruge applikationen.",
            "Disse vilkår gælder for alle brugere af potluck-tilmeldingssystemet."
          ]
        },
        {
          icon: <FileText className="w-6 h-6" />,
          title: "Brug af Tjenesten",
          content: [
            "Denne applikation leveres til organisering af potluck-arrangementer og håndtering af mad-bidrag.",
            "Du må bruge tjenesten til at:",
            "• Tilmelde ting du planlægger at medbringe til potluck-arrangementer",
            "• Se hvad andre medbringer",
            "• Redigere eller fjerne dine egne tilmeldinger",
            "• Deltage i realtidsopdateringer under arrangementer"
          ]
        },
        {
          icon: <AlertTriangle className="w-6 h-6" />,
          title: "Brugeransvar",
          content: [
            "Når du bruger denne tjeneste, accepterer du at:",
            "• Give nøjagtige oplysninger om dine mad-bidrag",
            "• Respektere andre brugere og deres bidrag",
            "• Ikke indsende upassende, stødende eller vildledende indhold",
            "• Faktisk medbringe de ting du tilmelder (når muligt)",
            "• Underrette arrangører hvis du ikke kan deltage eller medbringe tilmeldte ting"
          ]
        },
        {
          icon: <Scale className="w-6 h-6" />,
          title: "Indhold og Ansvar",
          content: [
            "Du er ansvarlig for det indhold du indsender til applikationen.",
            "Applikationens arrangører er ikke ansvarlige for:",
            "• Fødevaresikkerhed eller kvalitet af bidragede ting",
            "• Allergiske reaktioner eller diætrestriktioner",
            "• Koordinering mellem deltagere uden for appen",
            "• Tekniske problemer der kan påvirke din tilmelding"
          ]
        },
        {
          icon: <Clock className="w-6 h-6" />,
          title: "Ændringer og Opsigelse",
          content: [
            "Vi forbeholder os retten til at:",
            "• Ændre disse vilkår når som helst med varsel",
            "• Fjerne upassende indhold eller tilmeldinger",
            "• Midlertidigt eller permanent suspendere adgang hvis vilkår overtrædes",
            "• Opdatere applikationens funktioner og funktionalitet",
            "• Arkivere eller slette gamle potluck-arrangementer og deres data"
          ]
        }
      ],
      disclaimer: "Denne applikation leveres 'som den er' uden garantier. Brug efter eget skøn til potluck-arrangementkoordinering.",
      contact: "Spørgsmål om disse vilkår? Kontakt arrangøren."
    }
  };

  const currentContent = content[language];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 via-teal-600 to-green-800 dark:from-green-800 dark:via-teal-800 dark:to-green-900 text-white py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={onBack || (() => navigate('/'))}
              className="p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-all duration-200"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <FileText className="w-8 h-8" />
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
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg text-green-600 dark:text-green-300">
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

        {/* Disclaimer */}
        <div className="mt-8 bg-yellow-50 dark:bg-yellow-900 rounded-xl p-6 border-l-4 border-yellow-400">
          <div className="flex items-center gap-3 mb-3">
            <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-300" />
            <h3 className="text-lg font-bold text-yellow-800 dark:text-yellow-200">Disclaimer</h3>
          </div>
          <p className="text-yellow-700 dark:text-yellow-300">{currentContent.disclaimer}</p>
        </div>

        {/* Contact Section */}
        <div className="mt-4 bg-green-50 dark:bg-green-900 rounded-xl p-6">
          <p className="text-green-700 dark:text-green-300">{currentContent.contact}</p>
        </div>
      </div>
    </div>
  );
};