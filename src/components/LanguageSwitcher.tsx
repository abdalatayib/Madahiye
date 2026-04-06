import React from 'react';
import { useLanguage, Language } from '../contexts/LanguageContext';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  const languages: { code: Language; label: string }[] = [
    { code: 'so', label: 'Soomaali' },
    { code: 'en', label: 'English' },
    { code: 'ar', label: 'العربية' },
  ];

  return (
    <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm p-1 rounded-full border border-slate-200 shadow-sm">
      <Globe className="w-4 h-4 text-slate-400 ml-2" />
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => setLanguage(lang.code)}
          className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
            language === lang.code
              ? 'bg-red-600 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}
