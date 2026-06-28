import {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Globe, LayoutDashboard, ListFilter, LogOut, Moon, Search, Sparkles, Sun, User} from 'lucide-react';
import {Button} from "@/components/ui/button";
import ModeToggle from '@/components/shared/ModeToggle';
import {CandidateMode} from '@/lib/mode';

interface HeaderProps {
    currentRole: 'candidate' | 'recruiter' | 'admin';
    setCurrentRole: (role: 'candidate' | 'recruiter' | 'admin') => void;
    currentTab: string;
    setCurrentTab: (tab: string) => void;
    candidateMode: CandidateMode;
    onSwitchMode: (mode: CandidateMode) => void;
    isSwitchingMode?: boolean;
    onLogout?: () => void;
}

export default function Header({
                                   currentRole,
                                   currentTab,
                                   setCurrentTab,
                                   candidateMode,
                                   onSwitchMode,
                                   isSwitchingMode,
                                   onLogout
                               }: HeaderProps) {
    const {t, i18n} = useTranslation();
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

    const navItems = currentRole === 'candidate'
        ? [
            {id: 'dashboard', label: t('nav.dashboard'), icon: LayoutDashboard},
            {id: 'applications', label: t('nav.applications', 'Кандидатствания'), icon: ListFilter},
            {id: 'profile', label: t('nav.profile'), icon: User},
            {id: 'opportunities', label: t('nav.opportunities'), icon: Search},
            {id: 'aimatches', label: t('nav.aiMatches'), icon: Sparkles},
        ]
        : [
            {id: 'recruiter_dashboard', label: t('nav.recruiterDashboard'), icon: LayoutDashboard},
            {id: 'recruiter_my_opportunities', label: t('nav.recruiterOpportunities', 'Обяви'), icon: Search},
            {id: 'recruiter_applicants', label: t('nav.pipeline'), icon: ListFilter},
        ];

    if (currentRole === 'admin') {
        navItems.splice(0, navItems.length, ...[
            {id: 'admin_dashboard', label: 'Админ Панел', icon: LayoutDashboard}
        ]);
    }

    return (
        <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-[#c6c6cd]/30 shadow-xs dark:bg-slate-950/70 dark:border-white/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">

                <div className="flex items-center gap-2 cursor-pointer shrink-0"
                     onClick={() => setCurrentTab(currentRole === 'candidate' ? 'dashboard' : (currentRole === 'admin' ? 'admin_dashboard' : 'recruiter_dashboard'))}>
                    <div className="w-8 h-8 bg-gradient-to-br from-brand-blue via-indigo-500 to-academic-purple rounded-xl flex items-center justify-center shadow-inner shadow-blue-900/20">
                        <Sparkles className="w-5 h-5 text-white"/>
                    </div>
                    <span className="text-xl font-display font-black tracking-tight text-grey-dark hidden sm:inline">
                        Recruit<span className="text-brand-blue">AI</span>
                    </span>
                </div>

                <nav
                    className="hidden lg:flex items-center gap-1 bg-[#f0edef]/50 p-1 rounded-2xl border border-[#c6c6cd]/30">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = currentTab === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setCurrentTab(item.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                                    isActive
                                        ? 'bg-white text-grey-dark shadow-sm border border-[#c6c6cd]/50'
                                        : 'text-grey-muted hover:text-grey-dark hover:bg-white/50'
                                }`}
                            >
                                <Icon className={`w-4 h-4 ${isActive ? 'text-brand-blue' : ''}`}/>
                                {item.label}
                            </button>
                        );
                    })}
                </nav>

                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    {currentRole === 'candidate' && (
                        <ModeToggle
                            mode={candidateMode}
                            onModeChange={onSwitchMode}
                            isLoading={isSwitchingMode}
                            compact
                        />
                    )}

                    {onLogout && (
                        <Button
                            variant="ghost"
                            onClick={onLogout}
                            className="text-red-500 hover:text-red-600 hover:bg-red-50 font-bold uppercase tracking-wider text-xs rounded-xl gap-1.5 px-2 sm:px-3"
                        >
                            <LogOut className="w-4 h-4"/>
                            <span className="hidden sm:inline">{t('nav.logout')}</span>
                        </Button>
                    )}

                    <Button
                        variant="ghost"
                        onClick={() => setIsDarkMode((value) => !value)}
                        className="h-10 w-10 p-0 text-grey-muted hover:text-brand-blue border border-transparent hover:border-[#c6c6cd]/50 hover:bg-[#c6c6cd]/10 rounded-xl dark:hover:border-white/10"
                        title={isDarkMode ? t('nav.lightMode', 'Light mode') : t('nav.darkMode', 'Dark mode')}
                    >
                        {isDarkMode ? <Sun className="w-4 h-4"/> : <Moon className="w-4 h-4"/>}
                    </Button>

                    <Button
                        variant="ghost"
                        onClick={toggleLanguage}
                        className="hidden sm:flex items-center gap-2 text-grey-muted hover:text-brand-blue font-bold uppercase tracking-wider text-xs border border-transparent hover:border-[#c6c6cd]/50 hover:bg-[#c6c6cd]/10 rounded-xl"
                        title={t('nav.languageToggle')}
                    >
                        <Globe className="w-4 h-4"/>
                        {i18n.language.startsWith('bg') ? 'EN' : 'BG'}
                    </Button>
                </div>
            </div>
        </header>
    );
}
