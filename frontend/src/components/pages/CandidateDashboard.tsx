import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ArrowRight, Briefcase, CheckCircle2, Eye,
    History, Sparkles, BrainCircuit,
    Loader2, Target, TrendingUp, AlertCircle
} from 'lucide-react';
import { Profile } from '@/lib/types';
import { CandidateMode } from '@/lib/mode';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import apiClient from '@/lib/axios';
import {
    applyToOpportunity,
    fetchCandidateApplications,
    mapApplicationActivity,
} from '@/lib/applications';

interface CandidateDashboardProps {
    profile: Profile;
    candidateMode: CandidateMode;
    setCurrentTab: (tab: string) => void;
    setSelectedOpportunityId: (id: string | null) => void;
    appliedList: Array<any>;
    setAppliedList: React.Dispatch<React.SetStateAction<Array<any>>>;
}

export default function CandidateDashboard({
                                               profile,
                                               candidateMode,
                                               setCurrentTab,
                                               setSelectedOpportunityId,
                                               appliedList,
                                               setAppliedList
                                           }: CandidateDashboardProps) {
    const { t } = useTranslation();

    const [topMatches, setTopMatches] = useState<any[]>([]);
    const [isLoadingMatches, setIsLoadingMatches] = useState(true);
    const [isApplying, setIsApplying] = useState<string | null>(null);
    const [isAiMatch, setIsAiMatch] = useState(true);

    // Calculate Profile Completeness
    const calculateCompleteness = () => {
        let score = 0;
        if (profile?.name && !profile.name.includes('Неизвестен')) score += 25;
        if (profile?.location) score += 25;
        if (profile?.bio) score += 25;
        if (profile?.skills && profile.skills.length > 0) score += 25;
        return score;
    };
    const profileScore = calculateCompleteness();

    useEffect(() => {
        if (!profile?.userId && !profile?.id) return;

        const candidateUserId = profile.userId ?? profile.id;

        const fetchData = async () => {
            setIsLoadingMatches(true);
            try {
                const matchRes = await apiClient.get(`/api/v1/matching/candidate/${candidateUserId}?size=3`);
                const matches = matchRes.data.content;

                if (matches && matches.length > 0) {
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
                    const fallbackRes = await apiClient.get(`/api/v1/opportunities/getAll?page=0&size=3&sortBy=createdAt&direction=DESC&nameFilter=`);
                    const latestOpps = fallbackRes.data.content.map((opp: any) => ({
                        ...opp,
                        matchScore: null,
                        aiReasoning: null,
                        company: opp.location || t('dashboard.unknownCompany', 'Неизвестна Компания')
                    }));
                    setTopMatches(latestOpps);
                    setIsAiMatch(false);
                }

                // 2. ИЗВЛИЧАНЕ НА КАНДИДАТСТВАНИЯТА (НОВАТА ЛОГИКА)
                const apps = await fetchCandidateApplications(String(candidateUserId));
                setAppliedList(apps.map(mapApplicationActivity));

            } catch (err) {
                console.error("Failed to fetch data", err);
            } finally {
                setIsLoadingMatches(false);
            }
        };

        fetchData();
    }, [profile?.id, profile?.userId, candidateMode, t]);

    const handleApplyOneClick = async (opp: any) => {
        const candidateUserId = profile.userId ?? profile.id;
        if (!candidateUserId) return;

        const exists = appliedList.some(item => item.id === opp.id);
        if (exists || isApplying) return;

        setIsApplying(opp.id);
        try {
            await applyToOpportunity(String(opp.id), String(candidateUserId));
            const apps = await fetchCandidateApplications(String(candidateUserId));
            setAppliedList(apps.map(mapApplicationActivity));
        } catch (err) {
            console.error('Failed to apply:', err);
        } finally {
            setIsApplying(null);
        }
    };

    const firstName = profile?.name?.includes('Неизвестен')
        ? t('dashboard.candidateDefault', 'Кандидат')
        : profile?.name?.split(' ')[0];

    return (
        <div className="space-y-6 animate-fade-in relative">
            <div className="absolute top-0 right-0 w-96 h-96 bg-brand-blue/5 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

            {/* Welcome Section & Mode Toggle */}
            <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 pb-6 border-b border-[#c6c6cd]/30">
                <div className="relative">
                    <h1 className="text-4xl font-display font-extrabold text-grey-dark tracking-tight leading-tight">
                        {t('dashboard.welcome', 'Здравейте')}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-purple-600">{firstName}</span>!
                    </h1>
                    <p className="text-lg text-grey-muted mt-2">
                        {isAiMatch
                            ? `${t('dashboard.profileAttention', 'Вашият профил съвпада с')} ${topMatches.length} ${t('dashboard.topCompanies', 'нови позиции днес')}.`
                            : t('dashboard.noAiAttention', 'Разгледайте най-новите позиции в платформата днес.')}
                    </p>
                    <div className="mt-3 md:hidden">
                        <Badge
                            variant="outline"
                            className={`text-xs font-bold uppercase tracking-wider ${
                                candidateMode === 'professional'
                                    ? 'border-professional-emerald/40 text-professional-emerald bg-professional-emerald/5'
                                    : 'border-academic-purple/40 text-academic-purple bg-academic-purple/5'
                            }`}
                        >
                            {candidateMode === 'professional'
                                ? t('dashboard.professional', 'Professional')
                                : t('dashboard.academic', 'Academic')}
                        </Badge>
                    </div>
                </div>

                <div className="hidden md:flex flex-col items-end gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-grey-muted">
                        {t('mode.activeView', 'Active view')}
                    </span>
                    <Badge
                        variant="outline"
                        className={`text-xs font-bold uppercase tracking-wider ${
                            candidateMode === 'professional'
                                ? 'border-professional-emerald/40 text-professional-emerald bg-professional-emerald/5'
                                : 'border-academic-purple/40 text-academic-purple bg-academic-purple/5'
                        }`}
                    >
                        {candidateMode === 'professional'
                            ? t('dashboard.professional', 'Professional')
                            : t('dashboard.academic', 'Academic')}
                    </Badge>
                </div>
            </header>

            {/* Quick Stats & Profile Completeness Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Completeness Card (Takes up 2 columns on medium screens) */}
                <Card className={`md:col-span-2 rounded-2xl border-0 shadow-sm flex flex-col justify-center p-5 relative overflow-hidden ${profileScore === 100 ? 'bg-gradient-to-r from-professional-emerald/10 to-teal-500/10' : 'bg-white'}`}>
                    <div className="flex justify-between items-center mb-2 z-10">
                        <span className="text-sm font-bold text-grey-dark flex items-center gap-2">
                            <Target className={`w-4 h-4 ${profileScore === 100 ? 'text-professional-emerald' : 'text-brand-blue'}`} />
                            {t('dashboard.profileCompleteness', 'Завършеност на профила')}
                        </span>
                        <span className="text-sm font-black text-brand-blue">{profileScore}%</span>
                    </div>
                    <div className="w-full bg-[#f0edef] rounded-full h-2.5 mb-3 z-10">
                        <div className={`h-2.5 rounded-full transition-all duration-1000 ${profileScore === 100 ? 'bg-professional-emerald' : 'bg-brand-blue'}`} style={{ width: `${profileScore}%` }}></div>
                    </div>
                    {profileScore < 100 ? (
                        <p className="text-xs text-grey-muted z-10">
                            {t('dashboard.completenessHint', 'Добавете умения и биография, за да получавате по-добри AI препоръки.')}{" "}
                            <button onClick={() => setCurrentTab('profile')} className="text-brand-blue font-bold hover:underline">Добавете сега</button>
                        </p>
                    ) : (
                        <p className="text-xs text-professional-emerald font-semibold z-10">
                            {t('dashboard.completenessPerfect', 'Профилът ви е перфектен! AI алгоритъмът работи с пълна сила.')}
                        </p>
                    )}
                </Card>

                {/* Stat 1 */}
                <Card className="rounded-2xl border-0 shadow-sm bg-white p-5 flex flex-col justify-center gap-1 group hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-grey-muted uppercase tracking-wider">{t('dashboard.statsApps', 'Кандидатствания')}</span>
                        <div className="w-8 h-8 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue group-hover:bg-brand-blue group-hover:text-white transition-colors">
                            <Briefcase className="w-4 h-4" />
                        </div>
                    </div>
                    <span className="text-3xl font-black text-grey-dark">{appliedList.length}</span>
                </Card>

                {/* Stat 2 */}
                <Card className="rounded-2xl border-0 shadow-sm bg-white p-5 flex flex-col justify-center gap-1 group hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-grey-muted uppercase tracking-wider">{t('dashboard.statsViews', 'Разглеждания')}</span>
                        <div className="w-8 h-8 rounded-full bg-academic-purple/10 flex items-center justify-center text-academic-purple group-hover:bg-academic-purple group-hover:text-white transition-colors">
                            <TrendingUp className="w-4 h-4" />
                        </div>
                    </div>
                    <span className="text-3xl font-black text-grey-dark">0</span>
                    <span className="text-[10px] text-grey-muted font-medium mt-1">От институции</span>
                </Card>
            </div>

            {/* Main Grid: Applications vs Matches */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Recent Applications Summary (Left 8 columns) */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    <Card className="flex-1 rounded-3xl border-0 shadow-lg bg-white/80 backdrop-blur-xl flex flex-col overflow-hidden relative">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-blue to-purple-500"></div>
                        <CardHeader className="flex flex-row justify-between items-center pb-4 border-b border-[#f0edef]/80">
                            <CardTitle className="text-xl font-display font-bold text-grey-dark flex items-center gap-2.5">
                                <History className="w-6 h-6 text-brand-blue" />
                                {t('dashboard.recentApplications', 'Последно Кандидатствани')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            {appliedList.length === 0 ? (
                                <div className="text-center py-12 flex flex-col items-center justify-center">
                                    <div className="w-16 h-16 bg-brand-blue/10 rounded-full flex items-center justify-center mb-4">
                                        <History className="w-8 h-8 text-brand-blue opacity-50" />
                                    </div>
                                    <p className="text-grey-muted text-sm font-medium">{t('dashboard.noApplications', 'Все още не сте кандидатствали по обяви.')}</p>
                                    <Button onClick={() => setCurrentTab('opportunities')} variant="link" className="mt-2 text-brand-blue">
                                        {t('dashboard.viewAll', 'Разгледайте свободните позиции')}
                                    </Button>
                                </div>
                            ) : (
                                appliedList.map((app, index) => (
                                    <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl bg-[#fcf8fa]/50 hover:bg-white hover:shadow-md transition-all duration-300 border border-transparent hover:border-[#c6c6cd]/40 group cursor-pointer gap-4">
                                        <div className="flex items-center gap-4">
                                            <img
                                                src={`https://ui-avatars.com/api/?name=${app.company}&background=random&color=fff&rounded=true&bold=true`}
                                                alt={app.company}
                                                className="w-12 h-12 rounded-xl shadow-sm group-hover:scale-110 transition-transform duration-300"
                                            />
                                            <div>
                                                <h3 className="text-base font-bold text-grey-dark group-hover:text-brand-blue transition-colors">
                                                    {app.title}
                                                </h3>
                                                <p className="text-xs text-grey-muted">{app.company}</p>
                                            </div>
                                        </div>

                                        <div className="flex sm:flex-col justify-between items-center sm:items-end w-full sm:w-auto mt-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-[#c6c6cd]/20">
                                            <Badge variant="outline" className="gap-1.5 text-xs font-semibold px-3 py-1 bg-white text-grey-dark rounded-full shadow-sm">
                                                <span className="w-2 h-2 rounded-full bg-professional-emerald animate-pulse"></span>
                                                {app.status}
                                            </Badge>
                                            <p className="text-[10px] text-grey-muted font-mono mt-1.5">{app.date}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar (Right 4 columns) - Changes based on isAiMatch */}
                <aside className="lg:col-span-4 flex flex-col">
                    <Card className="flex-1 rounded-3xl border border-[#c6c6cd]/50 shadow-lg bg-gradient-to-b from-[#fcf8fa] to-white flex flex-col overflow-hidden">
                        <CardHeader className="pb-4 border-b border-[#f0edef] bg-white/50 backdrop-blur-sm">
                            <CardTitle className="text-lg font-display font-bold text-grey-dark flex items-center gap-2">
                                {isAiMatch ? (
                                    <>
                                        <BrainCircuit className="w-5 h-5 text-match-high animate-pulse" />
                                        {t('dashboard.topMatches', 'AI Препоръки')}
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-5 h-5 text-brand-blue" />
                                        {t('dashboard.latestJobs', 'Последни Обяви')}
                                    </>
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-5">
                            {isLoadingMatches ? (
                                <div className="flex flex-col items-center justify-center py-10">
                                    <Loader2 className="w-8 h-8 text-brand-blue animate-spin mb-3" />
                                    <p className="text-xs text-grey-muted font-mono">{t('dashboard.analyzingMatches', 'Зареждане...')}</p>
                                </div>
                            ) : topMatches.length === 0 ? (
                                <div className="text-center py-8 text-grey-muted text-sm">{t('dashboard.noMatches', 'В момента няма активни обяви.')}</div>
                            ) : (
                                <>
                                    {!isAiMatch && profileScore < 100 && (
                                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-3 items-start mb-2">
                                            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                            <p className="text-[11px] text-amber-800 leading-tight">
                                                Показваме ви последните обяви, тъй като нямате въведени умения за AI съвпадения.
                                            </p>
                                        </div>
                                    )}
                                    {topMatches.map((opp) => {
                                        const alreadyApplied = appliedList.some(item => item.id === opp.id);
                                        return (
                                            <div key={opp.id} className="bg-white rounded-2xl p-5 border border-[#c6c6cd]/40 relative overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">

                                                {/* Glowing Score Badge - Only if AI Match */}
                                                {isAiMatch && opp.matchScore && (
                                                    <div className="absolute top-0 right-0 bg-gradient-to-bl from-match-high to-emerald-500 text-white text-xs font-mono font-black px-3 py-1.5 rounded-bl-2xl shadow-sm z-10 flex items-center gap-1">
                                                        <Sparkles className="w-3 h-3" />
                                                        {opp.matchScore}%
                                                    </div>
                                                )}

                                                <h3 className={`text-base font-bold text-grey-dark leading-tight mb-1 ${isAiMatch ? 'pr-12' : ''}`}>
                                                    {opp.title}
                                                </h3>
                                                <p className="text-xs text-grey-muted font-medium mb-3">
                                                    {opp.company}
                                                </p>

                                                {/* AI Reasoning Tooltip */}
                                                {isAiMatch && opp.aiReasoning && (
                                                    <div className="bg-brand-blue/5 border border-brand-blue/10 rounded-lg p-2.5 mb-4">
                                                        <p className="text-[10px] leading-relaxed text-grey-dark italic">
                                                            "{opp.aiReasoning}"
                                                        </p>
                                                    </div>
                                                )}

                                                {alreadyApplied ? (
                                                    <div className="w-full flex items-center justify-center gap-2 py-2.5 bg-professional-emerald/10 text-professional-emerald border border-professional-emerald/20 rounded-xl text-xs font-bold">
                                                        <CheckCircle2 className="w-4 h-4" /> {t('dashboard.applied', 'Кандидатствали сте')}
                                                    </div>
                                                ) : (
                                                    <div className="flex gap-2 mt-4">
                                                        <Button onClick={() => handleApplyOneClick(opp)} disabled={isApplying === opp.id} className="flex-1 bg-grey-dark hover:bg-black text-white rounded-xl text-xs font-bold shadow-md transition-all h-10">
                                                        {isApplying === opp.id ? t('dashboard.applying', 'Кандидатстване...') : t('dashboard.oneClickApply', 'Кандидатствай')}
                                                    </Button>
                                                        <Button variant="outline" onClick={() => { setSelectedOpportunityId(opp.id); setCurrentTab('opportunities'); }} className="w-10 h-10 p-0 rounded-xl border-[#c6c6cd] hover:border-brand-blue hover:text-brand-blue transition-colors">
                                                            <Eye className="w-4 h-4" />
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
                            <Button variant="ghost" onClick={() => setCurrentTab('opportunities')} className="w-full text-xs font-bold text-brand-blue hover:bg-brand-blue/5 h-10 rounded-xl">
                                Разгледай всички обяви <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </CardFooter>
                    </Card>
                </aside>
            </div>
        </div>
    );
}