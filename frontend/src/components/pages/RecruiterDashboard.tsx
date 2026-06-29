import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {ArrowRight, Briefcase, Clock, Eye, TrendingUp, UserCheck, Users} from 'lucide-react';
import {Applicant} from '@/lib/types';
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import { Profile } from '@/lib/types';

interface RecruiterDashboardProps {
    profile: Profile;
    applicants: Applicant[];
    opportunityCount: number;
    setCurrentTab: (tab: string) => void;
    setSelectedApplicantId: (id: string | null) => void;
}

//@ts-ignore
export default function RecruiterDashboard({
                                               profile,
                                               applicants,
                                               opportunityCount,
                                               setCurrentTab,
                                               setSelectedApplicantId
                                           }: RecruiterDashboardProps) {
    const {t} = useTranslation();

    const newApplicants = applicants.filter(a => a.status === 'Ново').length;
    //@ts-ignore
    const reviewingApplicants = applicants.filter(a => a.status === 'Преглед').length;

    const [selectedOppId, setSelectedOppId] = useState('all');

    const uniqueOpportunities = Array.from(new Set(applicants.map(a => a.opportunityId))).map(id => {
        return {
            id,
            title: applicants.find(a => a.opportunityId === id)?.role || 'Неизвестна обява'
        };
    }).filter(opp => opp.id);

    const recentApplicants = [...applicants]
        .filter(a => selectedOppId === 'all' || a.opportunityId === selectedOppId)
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 5);

    const handleViewApplicant = (id: string) => {
        setSelectedApplicantId(id);
        setCurrentTab('recruiter_applicant_detail');
    };

    return (
        <div className="space-y-6 animate-fade-in relative pb-12">
            <div
                className="absolute top-0 right-0 w-96 h-96 bg-brand-blue/5 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

            <header className="pb-6 border-b border-[#c6c6cd]/30">
                <h1 className="text-4xl font-display font-extrabold text-grey-dark tracking-tight leading-tight">
                    {t('recruiter.welcome', 'Команден център')}
                </h1>
                <p className="text-lg text-grey-muted mt-2">
                    {t('recruiter.subtitle', 'Управлявайте вашите обяви и открийте най-добрите таланти чрез AI анализ.')}
                </p>
            </header>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card
                    onClick={() => setCurrentTab('recruiter_my_opportunities')}
                    className="cursor-pointer rounded-3xl border-0 shadow-sm bg-white dark:bg-slate-900 p-6 flex flex-col justify-center gap-2 group hover:shadow-md transition-shadow relative overflow-hidden">
                    <div
                        className="absolute -right-4 -top-4 w-24 h-24 bg-brand-blue/5 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                    <div className="flex justify-between items-center z-10">
                        <span
                            className="text-xs font-bold text-grey-muted uppercase tracking-wider">{t('recruiter.activeJobs', 'Активни Обяви')}</span>
                        <div
                            className="w-10 h-10 rounded-xl bg-brand-blue/10 flex items-center justify-center text-brand-blue group-hover:bg-brand-blue group-hover:text-white transition-colors">
                            <Briefcase className="w-5 h-5"/>
                        </div>
                    </div>
                    <span className="text-4xl font-black text-grey-dark z-10">{opportunityCount}</span>
                </Card>

                <Card
                    className="rounded-3xl border-0 shadow-sm bg-white dark:bg-slate-900 p-6 flex flex-col justify-center gap-2 group hover:shadow-md transition-shadow relative overflow-hidden">
                    <div
                        className="absolute -right-4 -top-4 w-24 h-24 bg-match-high/5 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                    <div className="flex justify-between items-center z-10">
                        <span
                            className="text-xs font-bold text-grey-muted uppercase tracking-wider">{t('recruiter.totalApplicants', 'Общо Кандидати')}</span>
                        <div
                            className="w-10 h-10 rounded-xl bg-match-high/10 flex items-center justify-center text-match-high group-hover:bg-match-high group-hover:text-white transition-colors">
                            <Users className="w-5 h-5"/>
                        </div>
                    </div>
                    <span className="text-4xl font-black text-grey-dark z-10">{applicants.length}</span>
                </Card>

                <Card
                    className="rounded-3xl border-0 shadow-sm bg-white dark:bg-slate-900 p-6 flex flex-col justify-center gap-2 group hover:shadow-md transition-shadow relative overflow-hidden">
                    <div
                        className="absolute -right-4 -top-4 w-24 h-24 bg-professional-emerald/5 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                    <div className="flex justify-between items-center z-10">
                        <span
                            className="text-xs font-bold text-grey-muted uppercase tracking-wider">{t('recruiter.newApplicants', 'Нови за преглед')}</span>
                        <div
                            className="w-10 h-10 rounded-xl bg-professional-emerald/10 flex items-center justify-center text-professional-emerald group-hover:bg-professional-emerald group-hover:text-white transition-colors">
                            <Clock className="w-5 h-5"/>
                        </div>
                    </div>
                    <span className="text-4xl font-black text-grey-dark z-10">{newApplicants}</span>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Pipeline Summary */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    <Card
                        className="flex-1 rounded-3xl border border-[#c6c6cd]/30 dark:border-white/10 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl flex flex-col overflow-hidden relative">
                        <div
                            className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-blue to-purple-500"></div>
                        <CardHeader
                            className="flex flex-row justify-between items-center pb-4 border-b border-[#f0edef]/80">
                            <CardTitle
                                className="text-xl font-display font-bold text-grey-dark flex items-center justify-between w-full">
                                <div className="flex items-center gap-2.5">
                                    <UserCheck className="w-6 h-6 text-brand-blue"/>
                                    {t('recruiter.topCandidates', 'Топ Кандидати (AI Препоръчани)')}
                                </div>
                                <select
                                    className="h-10 px-4 rounded-xl border border-[#c6c6cd]/50 bg-white dark:bg-slate-900 text-sm font-normal focus:ring-2 focus:ring-brand-blue/20 outline-none max-w-[250px]"
                                    value={selectedOppId}
                                    onChange={(e) => setSelectedOppId(e.target.value)}
                                >
                                    <option value="all">{t('recruiter.allOpportunities', 'Всички обяви')}</option>
                                    {uniqueOpportunities.map(opp => (
                                        <option key={opp.id} value={opp.id}>{opp.title}</option>
                                    ))}
                                </select>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            {recentApplicants.length === 0 ? (
                                <div className="text-center py-12 flex flex-col items-center justify-center">
                                    <div
                                        className="w-16 h-16 bg-brand-blue/10 rounded-full flex items-center justify-center mb-4">
                                        <Users className="w-8 h-8 text-brand-blue opacity-50"/>
                                    </div>
                                    <p className="text-grey-muted text-sm font-medium">{t('recruiter.noApplicantsYet', 'Все още нямате получени кандидатури.')}</p>
                                </div>
                            ) : (
                                recentApplicants.map((applicant, index) => (
                                    <div key={`${applicant.id}-${index}`}
                                         className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl bg-[#fcf8fa]/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 hover:shadow-md transition-all duration-300 border border-transparent hover:border-[#c6c6cd]/40 dark:hover:border-white/10 group gap-4">
                                        <div className="flex items-center gap-4">
                                            <div
                                                className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-blue/20 to-purple-600/20 text-brand-blue border border-brand-blue/30 flex items-center justify-center font-bold text-lg shadow-inner shrink-0">
                                                {applicant.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h3 className="text-base font-bold text-grey-dark">
                                                    {applicant.name}
                                                </h3>
                                                <p className="text-xs text-grey-muted font-medium">{applicant.role}</p>
                                            </div>
                                        </div>

                                        <div
                                            className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                                            <div className="flex flex-col items-center justify-center">
                                                <span
                                                    className={`text-lg font-black ${applicant.matchScore >= 80 ? 'text-match-high' : 'text-match-medium'}`}>
                                                    {applicant.matchScore}%
                                                </span>
                                                <span
                                                    className="text-[9px] font-bold text-grey-muted uppercase">Match</span>
                                            </div>

                                            <Button
                                                variant="outline"
                                                onClick={() => handleViewApplicant(applicant.id)}
                                                className="rounded-xl border-[#c6c6cd] dark:border-white/20 hover:border-brand-blue hover:text-brand-blue dark:hover:border-brand-blue transition-colors h-10 px-4"
                                            >
                                                <Eye className="w-4 h-4 mr-2"/> Профил
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </CardContent>
                        {recentApplicants.length > 0 && (
                            <CardFooter
                                className="pt-2 pb-4 bg-[#fcf8fa]/30 dark:bg-slate-900/30 border-t border-[#f0edef]/80 dark:border-white/10">
                                <Button
                                    variant="ghost"
                                    onClick={() => setCurrentTab('recruiter_applicants')}
                                    className="w-full text-brand-blue font-bold hover:bg-brand-blue/5 h-12 rounded-xl"
                                >
                                    Виж всички кандидати <ArrowRight className="w-4 h-4 ml-2"/>
                                </Button>
                            </CardFooter>
                        )}
                    </Card>
                </div>

                {/* Quick Actions Sidebar */}
                <aside className="lg:col-span-4 flex flex-col">
                    <Card
                        className="flex-1 rounded-3xl border border-[#c6c6cd]/50 dark:border-white/10 shadow-lg bg-gradient-to-b from-[#fcf8fa] to-white dark:from-slate-800 dark:to-slate-900 flex flex-col overflow-hidden">
                        <CardHeader
                            className="pb-4 border-b border-[#f0edef] dark:border-white/10 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
                            <CardTitle
                                className="text-lg font-display font-bold text-grey-dark flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-brand-blue"/>
                                {t('recruiter.quickActions', 'Бързи действия')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <Button
                                onClick={() => setCurrentTab('recruiter_applicants')}
                                className="w-full bg-brand-blue hover:bg-brand-blue-dark text-white rounded-xl h-14 justify-start px-6 font-bold shadow-md transition-all group"
                            >
                                <Users className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform"/>
                                Към всички кандидатури
                            </Button>

                            <Button
                                variant="outline"
                                onClick={() => setCurrentTab('recruiter_create_opportunity')}
                                className="w-full bg-white dark:bg-slate-800 border-[#c6c6cd] dark:border-white/10 text-grey-dark dark:text-white hover:border-brand-blue hover:text-brand-blue rounded-xl h-14 justify-start px-6 font-bold shadow-sm transition-all group"
                            >
                                <Briefcase className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform"/>
                                Публикувай нова обява
                            </Button>
                        </CardContent>
                    </Card>
                </aside>
            </div>
        </div>
    );
}