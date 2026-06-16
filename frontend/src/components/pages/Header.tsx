import {useTranslation} from 'react-i18next';
import {Globe, LayoutDashboard, ListFilter, Search, Sparkles, User} from 'lucide-react';
import {Button} from "@/components/ui/button";

interface HeaderProps {
    currentRole: 'candidate' | 'recruiter';
    setCurrentRole: (role: 'candidate' | 'recruiter') => void;
    currentTab: string;
    setCurrentTab: (tab: string) => void;
    candidateMode: 'professional' | 'academic';
    setCandidateMode: (mode: 'professional' | 'academic') => void;
    onLogout?: () => void;
}

export default function Header({
                                   currentRole,
                                   setCurrentRole,
                                   currentTab,
                                   setCurrentTab,
                                   onLogout
                               }: HeaderProps) {
    const {t, i18n} = useTranslation();

    // Instantly flips the language between English and Bulgarian
    const toggleLanguage = () => {
        const newLang = i18n.language.startsWith('bg') ? 'en' : 'bg';
        i18n.changeLanguage(newLang);
    };

    const navItems = currentRole === 'candidate'
        ? [
            {id: 'dashboard', label: 'Табло', icon: LayoutDashboard},
            {id: 'profile', label: 'Профил', icon: User},
            {id: 'opportunities', label: 'Позиции', icon: Search},
            {id: 'aimatches', label: 'AI Анализ', icon: Sparkles},
        ]
        : [
            {id: 'recruiter_dashboard', label: 'Дашборд', icon: LayoutDashboard},
            {id: 'recruiter_applicants', label: 'Пайплайн', icon: ListFilter},
        ];

    return (
        <header className="sticky top-0 z-50 bg-white/60 backdrop-blur-xl border-b border-[#c6c6cd]/30 shadow-xs">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

                {/* Logo & Brand */}
                <div className="flex items-center gap-2 cursor-pointer"
                     onClick={() => setCurrentTab(currentRole === 'candidate' ? 'dashboard' : 'recruiter_dashboard')}>
                    <div className="w-8 h-8 bg-brand-blue rounded-xl flex items-center justify-center shadow-inner">
                        <Sparkles className="w-5 h-5 text-white"/>
                    </div>
                    <span className="text-xl font-display font-black tracking-tight text-grey-dark">
            Recruit<span className="text-brand-blue">AI</span>
          </span>
                </div>

                {/* Main Navigation */}
                <nav
                    className="hidden md:flex items-center gap-1 bg-[#f0edef]/50 p-1 rounded-2xl border border-[#c6c6cd]/30">
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

                {/* Right Action Bar */}
                <div className="flex items-center gap-4">
                    {/* Logout Button */}
                    {onLogout && (
                        <Button
                            variant="ghost"
                            onClick={onLogout}
                            className="text-red-500 hover:text-red-600 hover:bg-red-50 font-bold uppercase tracking-wider text-xs rounded-xl"
                        >
                            Изход
                        </Button>
                    )}
                    {/* Language Switcher */}
                    <Button
                        variant="ghost"
                        onClick={toggleLanguage}
                        className="hidden sm:flex items-center gap-2 text-grey-muted hover:text-brand-blue font-bold uppercase tracking-wider text-xs border border-transparent hover:border-[#c6c6cd]/50 hover:bg-[#c6c6cd]/10 rounded-xl"
                        title="Смяна на езика / Change Language"
                    >
                        <Globe className="w-4 h-4"/>
                        {i18n.language.startsWith('bg') ? 'EN' : 'БГ'}
                    </Button>

                    {/* Role Switcher */}
                    <div className="flex bg-[#f0edef] p-1 rounded-xl border border-[#c6c6cd]/40">
                        <button
                            onClick={() => {
                                setCurrentRole('candidate');
                                setCurrentTab('dashboard');
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                currentRole === 'candidate'
                                    ? 'bg-white text-brand-blue shadow-sm'
                                    : 'text-grey-muted hover:text-grey-dark'
                            }`}
                        >
                            {t('roles.candidate')}
                        </button>
                        <button
                            onClick={() => {
                                setCurrentRole('recruiter');
                                setCurrentTab('recruiter_dashboard');
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                currentRole === 'recruiter'
                                    ? 'bg-[#1b1b1d] text-white shadow-sm'
                                    : 'text-grey-muted hover:text-grey-dark'
                            }`}
                        >
                            {t('roles.recruiter')}
                        </button>
                    </div>

                </div>
            </div>
        </header>
    );
}