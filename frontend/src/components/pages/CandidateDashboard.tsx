import {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {
    AlertCircle, ArrowRight, BrainCircuit, Briefcase, CheckCircle2, Eye,
    History, Loader2, Sparkles, Target, TrendingUp
} from 'lucide-react';
import {Profile} from '@/lib/types';
import {CandidateMode, toApiMode} from '@/lib/mode';
import {applyToOpportunity, fetchCandidateApplications, mapApplicationActivity} from '@/lib/applications';
import {fetchOpportunities} from '@/lib/opportunities'; // ИМПОРТИРАМЕ НОВАТА ФУНКЦИЯ
import ModeToggle from '@/components/shared/ModeToggle';
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import apiClient from '@/lib/axios';

interface CandidateDashboardProps {
    profile: Profile;
    candidateMode: CandidateMode;
    setCandidateMode: (mode: CandidateMode) => void;
    setCurrentTab: (tab: string) => void;
    setSelectedOpportunityId: (id: string | null) => void;
}

export default function CandidateDashboard({
                                               profile,
                                               candidateMode,
                                               setCandidateMode,
                                               setCurrentTab,
                                               setSelectedOpportunityId
                                           }: CandidateDashboardProps) {
    const {t} = useTranslation();

    const [topMatches, setTopMatches] = useState<any[]>([]);
    const [appliedList, setAppliedList] = useState<any[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [isAiMatch, setIsAiMatch] = useState(true);

    const profileScore = profile?.isCompleted ? 100 : 40;

    useEffect(() => {
        const candidateId = profile?.id;
        if (!candidateId) return;

        const loadDashboardData = async () => {
            setIsLoadingData(true);
            try {
                const appsData = await fetchCandidateApplications(candidateId);
                setAppliedList(appsData.map(mapApplicationActivity));

                const matchRes = await apiClient.get(`/api/v1/matching/candidate/${candidateId}?size=3`);
                const matches = matchRes.data?.content || [];

                if (matches.length > 0) {
                    const detailedMatches = await Promise.all(
                        matches.map(async (m: any) => {
                            try {
                                const oppRes = await apiClient.get(`/api/v1/opportunities/get/${m.opportunityId}`);
                                return {
                                    ...oppRes.data,
                                    matchScore: Math.round(m.finalScore),
                                    aiReasoning: m.aiReasoning,
                                    company: oppRes.data.location || t('dashboard.unknownCompany', 'Неизвестна Компания')
                                };
                            } catch (e) {
                                return null;
                            }
                        })
                    );
                    setTopMatches(detailedMatches.filter(m => m !== null));
                    setIsAiMatch(true);
                } else {
                    const latestOpps = await fetchOpportunities('', toApiMode(candidateMode), 0, 3);

                    setTopMatches(latestOpps);
                    setIsAiMatch(false);
                }
            } catch (err) {
                console.error("Failed to load dashboard data", err);
            } finally {
                setIsLoadingData(false);
            }
        };

        loadDashboardData();
    }, [profile?.id, candidateMode, t]);

    const handleApplyOneClick = async (opp: any) => {
        const exists = appliedList.some(item => item.id === opp.id);
        if (exists || !profile?.id) return;

        try {
            await applyToOpportunity(opp.id, profile.id, "Кандидатстване чрез бърз бутон от таблото.");

            const newApp = mapApplicationActivity({
                applicationId: Math.random().toString(),
                candidateId: profile.id,
                opportunityId: opp.id,
                title: opp.title,
                company: opp.company,
                status: 'PENDING',
                appliedAtDate: new Date().toISOString()
            });

            setAppliedList(prev => [newApp, ...prev]);
        } catch (error) {
            console.error("Грешка при кандидатстване:", error);
        }
    };

    const firstName = profile?.name?.includes('Неизвестен')
        ? t('dashboard.candidateDefault', 'Кандидат')
        : profile?.name?.split(' ')[0] || 'Кандидат';

    return (
        <div className="space-y-6 animate-fade-in relative">
            <div
                className="absolute top-0 right-0 w-96 h-96 bg-brand-blue/5 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

            <header
                className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 pb-6 border-b border-[#c6c6cd]/30">
                <div className="relative">
                    <h1 className="text-4xl font-display font-extrabold text-grey-dark tracking-tight leading-tight">
                        {t('dashboard.welcome', 'Здравейте')}, <span
                        className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-purple-600">{firstName}</span>!
                    </h1>
                    <p className="text-lg text-grey-muted mt-2">
                        {isAiMatch
                            ? `${t('dashboard.profileAttention', 'Вашият профил съвпада с')} ${topMatches.length} ${t('dashboard.topCompanies', 'нови позиции днес')}.`
                            : t('dashboard.noAiAttention', 'Разгледайте най-новите позиции в платформата днес.')}
                    </p>
                </div>

                <div
                    className="bg-white/60 p-2 rounded-2xl border border-[#c6c6cd]/40 inline-flex items-center shadow-sm backdrop-blur-md">
                    <ModeToggle
                        mode={candidateMode}
                        onModeChange={setCandidateMode}
                    />
                </div>
            </header>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card
                    className={`md:col-span-2 rounded-2xl border-0 shadow-sm flex flex-col justify-center p-5 relative overflow-hidden ${profileScore === 100 ? 'bg-gradient-to-r from-professional-emerald/10 to-teal-500/10' : 'bg-white'}`}>
                    <div className="flex justify-between items-center mb-2 z-10">
                        <span className="text-sm font-bold text-grey-dark flex items-center gap-2">
                            <Target
                                className={`w-4 h-4 ${profileScore === 100 ? 'text-professional-emerald' : 'text-brand-blue'}`}/>
                            {t('dashboard.profileCompleteness', 'Завършеност на профила')}
                        </span>
                        <span className="text-sm font-black text-brand-blue">{profileScore}%</span>
                    </div>
                    <div className="w-full bg-[#f0edef] rounded-full h-2.5 mb-3 z-10">
                        <div
                            className={`h-2.5 rounded-full transition-all duration-1000 ${profileScore === 100 ? 'bg-professional-emerald' : 'bg-brand-blue'}`}
                            style={{width: `${profileScore}%`}}></div>
                    </div>
                    {profileScore < 100 ? (
                        <p className="text-xs text-grey-muted z-10">
                            {t('dashboard.completenessHint', 'Добавете опит и умения, за да отключите пълния потенциал на AI.')}{" "}
                            <button onClick={() => setCurrentTab('profile')}
                                    className="text-brand-blue font-bold hover:underline">Добавете сега
                            </button>
                        </p>
                    ) : (
                        <p className="text-xs text-professional-emerald font-semibold z-10">
                            {t('dashboard.completenessPerfect', 'Профилът ви е перфектен! AI алгоритъмът работи с пълна сила.')}
                        </p>
                    )}
                </Card>

                <Card
                    className="rounded-2xl border-0 shadow-sm bg-white p-5 flex flex-col justify-center gap-1 group hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-center">
                        <span
                            className="text-xs font-bold text-grey-muted uppercase tracking-wider">{t('dashboard.statsApps', 'Кандидатствания')}</span>
                        <div
                            className="w-8 h-8 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue group-hover:bg-brand-blue group-hover:text-white transition-colors">
                            <Briefcase className="w-4 h-4"/>
                        </div>
                    </div>
                    <span className="text-3xl font-black text-grey-dark">{appliedList.length}</span>
                </Card>

                <Card
                    className="rounded-2xl border-0 shadow-sm bg-white p-5 flex flex-col justify-center gap-1 group hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-center">
                        <span
                            className="text-xs font-bold text-grey-muted uppercase tracking-wider">{t('dashboard.statsViews', 'Разглеждания')}</span>
                        <div
                            className="w-8 h-8 rounded-full bg-academic-purple/10 flex items-center justify-center text-academic-purple group-hover:bg-academic-purple group-hover:text-white transition-colors">
                            <TrendingUp className="w-4 h-4"/>
                        </div>
                    </div>
                    <span className="text-3xl font-black text-grey-dark">0</span>
                    <span className="text-[10px] text-grey-muted font-medium mt-1">От институции</span>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Recent Applications Summary */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    <Card
                        className="flex-1 rounded-3xl border-0 shadow-lg bg-white/80 backdrop-blur-xl flex flex-col overflow-hidden relative">
                        <div
                            className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-blue to-purple-500"></div>
                        <CardHeader
                            className="flex flex-row justify-between items-center pb-4 border-b border-[#f0edef]/80">
                            <CardTitle
                                className="text-xl font-display font-bold text-grey-dark flex items-center gap-2.5">
                                <History className="w-6 h-6 text-brand-blue"/>
                                {t('dashboard.recentApplications', 'Последно Кандидатствани')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            {isLoadingData ? (
                                <div className="flex justify-center py-8"><Loader2
                                    className="animate-spin text-brand-blue w-6 h-6"/></div>
                            ) : appliedList.length === 0 ? (
                                <div className="text-center py-12 flex flex-col items-center justify-center">
                                    <div
                                        className="w-16 h-16 bg-brand-blue/10 rounded-full flex items-center justify-center mb-4">
                                        <History className="w-8 h-8 text-brand-blue opacity-50"/>
                                    </div>
                                    <p className="text-grey-muted text-sm font-medium">{t('dashboard.noApplications', 'Все още не сте кандидатствали по обяви.')}</p>
                                </div>
                            ) : (
                                appliedList.slice(0, 5).map((app, index) => (
                                    <div key={index}
                                         className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl bg-[#fcf8fa]/50 hover:bg-white hover:shadow-md transition-all duration-300 border border-transparent hover:border-[#c6c6cd]/40 group cursor-pointer gap-4">
                                        <div className="flex items-center gap-4">
                                            <div
                                                className={`w-12 h-12 rounded-xl shadow-sm flex items-center justify-center text-white font-bold text-lg group-hover:scale-110 transition-transform duration-300 ${app.logoColor || 'bg-brand-blue'}`}>
                                                {app.company.charAt(0)}
                                            </div>
                                            <div>
                                                <h3 className="text-base font-bold text-grey-dark group-hover:text-brand-blue transition-colors">
                                                    {app.title}
                                                </h3>
                                                <p className="text-xs text-grey-muted">{app.company}</p>
                                            </div>
                                        </div>

                                        <div className="flex flex-col justify-center items-end min-w-[120px]">
                                            <Badge variant="outline"
                                                   className="gap-1.5 text-xs font-semibold px-3 py-1 bg-white text-grey-dark rounded-full shadow-sm mb-1.5 whitespace-nowrap">
                                                <span
                                                    className="w-2 h-2 rounded-full bg-professional-emerald animate-pulse"></span>
                                                {app.status}
                                            </Badge>
                                            <p className="text-[10px] text-grey-muted font-mono">{app.date}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar matches */}
                <aside className="lg:col-span-4 flex flex-col">
                    <Card
                        className="flex-1 rounded-3xl border border-[#c6c6cd]/50 shadow-lg bg-gradient-to-b from-[#fcf8fa] to-white flex flex-col overflow-hidden">
                        <CardHeader className="pb-4 border-b border-[#f0edef] bg-white/50 backdrop-blur-sm">
                            <CardTitle
                                className="text-lg font-display font-bold text-grey-dark flex items-center gap-2">
                                {isAiMatch ? (
                                    <><BrainCircuit
                                        className="w-5 h-5 text-match-high animate-pulse"/> {t('dashboard.topMatches', 'AI Препоръки')}</>
                                ) : (
                                    <><Sparkles
                                        className="w-5 h-5 text-brand-blue"/> {t('dashboard.latestJobs', 'Последни Обяви')}</>
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-5">
                            {isLoadingData ? (
                                <div className="flex justify-center py-8"><Loader2
                                    className="animate-spin text-brand-blue w-6 h-6"/></div>
                            ) : topMatches.length === 0 ? (
                                <div
                                    className="text-center py-8 text-grey-muted text-sm">{t('dashboard.noMatches', 'В момента няма активни обяви.')}</div>
                            ) : (
                                <>
                                    {!isAiMatch && profileScore < 100 && (
                                        <div
                                            className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-3 items-start mb-2">
                                            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5"/>
                                            <p className="text-[11px] text-amber-800 leading-tight">Показваме ви
                                                последните обяви, тъй като нямате достатъчно данни за AI съвпадения.</p>
                                        </div>
                                    )}
                                    {topMatches.map((opp) => {
                                        const alreadyApplied = appliedList.some(item => item.id === opp.id);
                                        return (
                                            <div key={opp.id}
                                                 className="bg-white rounded-2xl p-5 border border-[#c6c6cd]/40 relative overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                                {isAiMatch && opp.matchScore && (
                                                    <div
                                                        className="absolute top-0 right-0 bg-gradient-to-bl from-match-high to-emerald-500 text-white text-xs font-mono font-black px-3 py-1.5 rounded-bl-2xl shadow-sm z-10 flex items-center gap-1">
                                                        <Sparkles className="w-3 h-3"/>
                                                        {opp.matchScore}%
                                                    </div>
                                                )}

                                                <h3 className={`text-base font-bold text-grey-dark leading-tight mb-1 ${isAiMatch ? 'pr-12' : ''}`}>{opp.title}</h3>
                                                <p className="text-xs text-grey-muted font-medium mb-3">{opp.company}</p>

                                                {isAiMatch && opp.aiReasoning && (
                                                    <div
                                                        className="bg-brand-blue/5 border border-brand-blue/10 rounded-lg p-2.5 mb-4">
                                                        <p className="text-[10px] leading-relaxed text-grey-dark italic">"{opp.aiReasoning}"</p>
                                                    </div>
                                                )}

                                                {alreadyApplied ? (
                                                    <div
                                                        className="w-full flex items-center justify-center gap-2 py-2.5 bg-professional-emerald/10 text-professional-emerald border border-professional-emerald/20 rounded-xl text-xs font-bold">
                                                        <CheckCircle2
                                                            className="w-4 h-4"/> {t('dashboard.applied', 'Кандидатствали сте')}
                                                    </div>
                                                ) : (
                                                    <div className="flex gap-2 mt-4">
                                                        <Button onClick={() => handleApplyOneClick(opp)}
                                                                className="flex-1 bg-grey-dark hover:bg-black text-white rounded-xl text-xs font-bold shadow-md transition-all h-10">
                                                            {t('dashboard.oneClickApply', 'Кандидатствай')}
                                                        </Button>
                                                        <Button variant="outline" onClick={() => {
                                                            setSelectedOpportunityId(opp.id);
                                                            setCurrentTab('opportunities');
                                                        }}
                                                                className="w-10 h-10 p-0 rounded-xl border-[#c6c6cd] hover:border-brand-blue hover:text-brand-blue transition-colors">
                                                            <Eye className="w-4 h-4"/>
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </>
                            )}
                        </CardContent>
                        <CardFooter className="pt-4 border-t border-[#f0edef] bg-white/50 pb-4">
                            <Button variant="ghost" onClick={() => setCurrentTab('opportunities')}
                                    className="w-full text-xs font-bold text-brand-blue hover:bg-brand-blue/5 h-10 rounded-xl">
                                Разгледай всички обяви <ArrowRight className="w-4 h-4 ml-2"/>
                            </Button>
                        </CardFooter>
                    </Card>
                </aside>
            </div>
        </div>
    );
}