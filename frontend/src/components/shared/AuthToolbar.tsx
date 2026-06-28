import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Moon, Sun } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function AuthToolbar() {
    const { i18n } = useTranslation();
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) return savedTheme === 'dark';
        return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
    });

    useEffect(() => {
        document.documentElement.classList.toggle('dark', isDarkMode);
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    }, [isDarkMode]);

    const toggleLanguage = () => {
        const newLang = i18n.language.startsWith('bg') ? 'en' : 'bg';
        i18n.changeLanguage(newLang);
    };

    return (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
            <Button
                variant="ghost"
                onClick={() => setIsDarkMode((v) => !v)}
                className="h-10 w-10 p-0 text-grey-muted hover:text-brand-blue border border-[#c6c6cd]/30 hover:border-[#c6c6cd]/50 hover:bg-white/50 dark:hover:bg-slate-800 rounded-xl backdrop-blur-md bg-white/70 dark:bg-slate-900/70 shadow-sm"
                title={isDarkMode ? 'Light mode' : 'Dark mode'}
            >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>

            <Button
                variant="ghost"
                onClick={toggleLanguage}
                className="flex items-center gap-2 text-grey-muted hover:text-brand-blue font-bold uppercase tracking-wider text-xs border border-[#c6c6cd]/30 hover:border-[#c6c6cd]/50 hover:bg-white/50 dark:hover:bg-slate-800 rounded-xl backdrop-blur-md bg-white/70 dark:bg-slate-900/70 shadow-sm"
            >
                <Globe className="w-4 h-4" />
                {i18n.language.startsWith('bg') ? 'EN' : 'BG'}
            </Button>
        </div>
    );
}
