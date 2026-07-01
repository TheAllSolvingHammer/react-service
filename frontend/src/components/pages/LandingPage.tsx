import { useTranslation } from 'react-i18next';
import { ArrowRight, Sparkles, Building2, GraduationCap, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';
import { useState, useEffect } from 'react';

interface LandingPageProps {
    onNavigateToLogin: () => void;
    onNavigateToRegister: () => void;
}

export default function LandingPage({ onNavigateToLogin, onNavigateToRegister }: LandingPageProps) {
    const { t, i18n } = useTranslation();

    const toggleLanguage = () => {
        const newLang = i18n.language === 'bg' ? 'en' : 'bg';
        i18n.changeLanguage(newLang);
    };

    const [isDark, setIsDark] = useState(() => {
        return document.documentElement.classList.contains('dark');
    });

    const toggleTheme = () => {
        const nextDark = !isDark;
        setIsDark(nextDark);
        document.documentElement.classList.toggle('dark', nextDark);
        localStorage.setItem('theme', nextDark ? 'dark' : 'light');
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 selection:bg-brand-blue/30 overflow-hidden relative">
            {/* Ambient Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-brand-blue/10 dark:bg-brand-blue/20 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/10 dark:bg-purple-600/20 blur-[120px]" />
            </div>

            {/* Navigation Bar */}
            <nav className="relative z-50 flex items-center justify-between px-6 py-4 lg:px-12 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 bg-white/50 dark:bg-slate-950/50">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-blue to-purple-600 flex items-center justify-center shadow-lg shadow-brand-blue/20">
                        <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-display font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-brand-blue to-purple-600">
                        TalentConnect
                    </span>
                </div>
                
                <div className="flex items-center gap-4">
                    <button 
                        onClick={toggleLanguage}
                        className="text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-brand-blue dark:hover:text-brand-blue-light transition-colors px-2 py-1"
                    >
                        {i18n.language === 'bg' ? 'EN' : 'BG'}
                    </button>
                    <button 
                        onClick={toggleTheme}
                        className="text-slate-600 dark:text-slate-300 hover:text-brand-blue dark:hover:text-brand-blue-light transition-colors p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                        {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>
                    <Button variant="ghost" onClick={onNavigateToLogin} className="hidden sm:flex font-bold hover:bg-brand-blue/10 hover:text-brand-blue">
                        {t('landing.login', 'Вход')}
                    </Button>
                    <Button onClick={onNavigateToRegister} className="bg-brand-blue hover:bg-brand-blue-dark text-white font-bold rounded-full px-6 shadow-lg shadow-brand-blue/20 transition-transform hover:scale-105">
                        {t('landing.register', 'Регистрация')}
                    </Button>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="relative z-10 flex flex-col lg:flex-row items-center justify-center min-h-[calc(100vh-80px)] px-6 lg:px-12 gap-12 max-w-7xl mx-auto py-12">
                
                <div className="flex-1 text-center lg:text-left flex flex-col items-center lg:items-start gap-8 animate-fade-in">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-blue/10 dark:bg-brand-blue/20 border border-brand-blue/20 text-brand-blue dark:text-brand-blue-light font-semibold text-sm mb-4">
                        <Sparkles className="w-4 h-4" />
                        <span>{t('landing.badge', 'Платформа за бъдещето')}</span>
                    </div>
                    
                    <h1 className="text-5xl lg:text-7xl font-display font-black tracking-tight leading-[1.1]">
                        {t('landing.title1', 'Свързваме')}{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-purple-600">
                            {t('landing.titleHighlight', 'Таланти')}
                        </span>
                        <br />
                        {t('landing.title2', 'с Възможности')}
                    </h1>
                    
                    <p className="text-lg lg:text-xl text-slate-600 dark:text-slate-400 max-w-2xl font-medium leading-relaxed">
                        {t('landing.subtitle', 'Открийте идеалната университетска програма или мечтаната кариера. Ние събираме кандидати, университети и компании на едно място.')}
                    </p>
                    
                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mt-4">
                        <Button 
                            onClick={onNavigateToRegister} 
                            size="lg" 
                            className="w-full sm:w-auto bg-brand-blue hover:bg-brand-blue-dark text-white font-bold rounded-full px-8 h-14 text-lg shadow-xl shadow-brand-blue/20 transition-all hover:scale-105 group"
                        >
                            {t('landing.getStarted', 'Започни сега')}
                            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                        <Button 
                            onClick={onNavigateToLogin} 
                            variant="outline" 
                            size="lg" 
                            className="w-full sm:w-auto rounded-full px-8 h-14 text-lg font-bold border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                        >
                            {t('landing.loginExisting', 'Вече имате акаунт?')}
                        </Button>
                    </div>

                    <div className="grid grid-cols-3 gap-6 w-full max-w-lg mt-8 pt-8 border-t border-slate-200 dark:border-slate-800">
                        <div className="flex flex-col items-center lg:items-start gap-2">
                            <Users className="w-6 h-6 text-brand-blue" />
                            <span className="text-2xl font-black">10k+</span>
                            <span className="text-sm text-slate-500 font-medium">{t('landing.statCandidates', 'Кандидати')}</span>
                        </div>
                        <div className="flex flex-col items-center lg:items-start gap-2">
                            <Building2 className="w-6 h-6 text-purple-500" />
                            <span className="text-2xl font-black">500+</span>
                            <span className="text-sm text-slate-500 font-medium">{t('landing.statCompanies', 'Компании')}</span>
                        </div>
                        <div className="flex flex-col items-center lg:items-start gap-2">
                            <GraduationCap className="w-6 h-6 text-emerald-500" />
                            <span className="text-2xl font-black">50+</span>
                            <span className="text-sm text-slate-500 font-medium">{t('landing.statUniversities', 'Университети')}</span>
                        </div>
                    </div>
                </div>

                <div className="flex-1 w-full max-w-lg lg:max-w-none relative animate-fade-in-up">
                    <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-brand-blue/20 border border-white/20 dark:border-slate-800/50 aspect-[4/3] sm:aspect-square lg:aspect-[4/3]">
                        {/* Placeholder for the generated image. Will add logic to show real image if we have it in public, otherwise a CSS gradient placeholder */}
                        <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/20 to-purple-600/20 backdrop-blur-3xl mix-blend-overlay z-10" />
                        <img 
                            src="/hero-landing.jpg" 
                            alt="Platform Preview" 
                            className="w-full h-full object-cover relative z-0"
                            onError={(e) => {
                                // Fallback if image not found in public folder
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.parentElement!.classList.add('bg-gradient-to-br', 'from-slate-800', 'to-slate-900');
                            }}
                        />
                        
                        {/* Floating glassmorphism cards */}
                        <div className="absolute top-8 -left-8 lg:-left-12 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-4 rounded-2xl shadow-xl border border-white/40 dark:border-slate-700/50 flex items-center gap-4 animate-bounce-slow z-20">
                            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                <GraduationCap className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-sm font-bold">{t('landing.float1Title', 'Приет!')}</p>
                                <p className="text-xs text-slate-500">{t('landing.float1Sub', 'Технически Университет')}</p>
                            </div>
                        </div>

                        <div className="absolute bottom-12 -right-4 lg:-right-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-4 rounded-2xl shadow-xl border border-white/40 dark:border-slate-700/50 flex items-center gap-4 animate-bounce-slow-delayed z-20">
                            <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                <Building2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <p className="text-sm font-bold">{t('landing.float2Title', 'Нова позиция')}</p>
                                <p className="text-xs text-slate-500">{t('landing.float2Sub', 'Senior Developer')}</p>
                            </div>
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
}
