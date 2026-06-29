import {useEffect, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {BookOpen, Loader2, Sparkles, Star} from 'lucide-react';
import {Opportunity, Profile} from '@/lib/types';
import {CandidateMode} from '@/lib/mode';
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {fetchCandidateMatches, MatchResult} from '@/lib/matching';

interface CandidateAiMatchesProps {
    profile: Profile;
    candidateMode: CandidateMode;
    opportunities: Opportunity[];
}

export default function CandidateAiMatches({
                                               profile,
                                               candidateMode,
                                               opportunities
                                           }: CandidateAiMatchesProps) {
    const {t} = useTranslation();
    const [matches, setMatches] = useState<MatchResult[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedSimOppId, setSelectedSimOppId] = useState<string>(opportunities[0]?.id || '');

    useEffect(() => {
        if (opportunities[0]?.id && !selectedSimOppId) {
            setSelectedSimOppId(opportunities[0].id);
        }
    }, [opportunities, selectedSimOppId]);

    useEffect(() => {
        const candidateUserId = profile.userId ?? profile.id;
        if (!candidateUserId) return;

        setIsLoading(true);
        fetchCandidateMatches(String(candidateUserId), 50)
            .then(setMatches)
            .catch((err) => console.error('Failed to load AI matches:', err))
            .finally(() => setIsLoading(false));
    }, [profile.userId, profile.id]);

    const selectedOpp = useMemo(() => {
        return opportunities.find(o => o.id === selectedSimOppId) || opportunities[0];
    }, [opportunities, selectedSimOppId]);

    const selectedMatch = useMemo(() => {
        if (!selectedOpp) return undefined;
        return matches.find((match) => match.opportunityId === selectedOpp.id);
    }, [matches, selectedOpp]);

    const matchAnalysis = useMemo(() => {
        // Защитаваме се от null/undefined стойности с филтриране и безопасно конвертиране
        const oppSkillsRaw = selectedOpp?.tags?.length
            ? selectedOpp.tags
            : selectedOpp?.requirements?.slice(0, 4) ?? [];

        const oppSkills = oppSkillsRaw.filter(Boolean).map(s => String(s).toLowerCase());
        const userSkills = (profile?.skills || []).filter(Boolean).map(s => String(s).toLowerCase());

        const breakdown = oppSkills.map(skill => {
            const isPerfectMatch = userSkills.includes(skill);
            const isPartial = !isPerfectMatch && userSkills.some(us => us.includes(skill) || skill.includes(us));

            let statusKey = "statusMissing";
            if (isPerfectMatch) statusKey = "statusCovers";
            else if (isPartial) statusKey = "statusPartial";

            return {
                skill, // тук вече skill е string
                statusKey,
                categoryKey: "catCloudInfra"
            };
        });

        const coveredCount = breakdown.filter(b => b.statusKey === "statusCovers").length;
        const partialCount = breakdown.filter(b => b.statusKey === "statusPartial").length;
        const fallbackScore = breakdown.length
            ? Math.min(100, Math.round(((coveredCount + partialCount * 0.5) / breakdown.length) * 100))
            : 0;

        const finalScore = selectedMatch?.finalScore ?? selectedOpp?.matchScore ?? fallbackScore;

        return {
            score: finalScore,
            breakdown,
            aiReasoning: selectedMatch?.aiReasoning ?? selectedOpp?.aiReasoning,
            technicalRequirementsScore: selectedMatch?.aiScore != null
                ? Math.round(selectedMatch.aiScore)
                : Math.min(100, finalScore + 3),
            experienceLevelScore: candidateMode === 'professional' ? Math.min(100, finalScore + 5) : Math.max(50, finalScore - 5),
            culturalFitScore: selectedMatch?.manualScore != null
                ? Math.round(selectedMatch.manualScore)
                : Math.max(60, finalScore - 8),
        };
    }, [profile.skills, candidateMode, selectedOpp, selectedMatch]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-grey-muted gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-brand-blue"/>
                {t('dashboard.analyzingMatches', 'Зареждане...')}
            </div>
        );
    }

    if (!selectedOpp) {
        return <div className="text-center py-12 text-grey-muted">{t('aiMatches.noData')}</div>;
    }

    return (
        <div className="space-y-8 animate-fade-in pb-16">
            <header className="pb-6 border-b border-[#c6c6cd]/30">
                <h1 className="text-3xl font-display font-extrabold text-grey-dark leading-tight">{t('aiMatches.title')}</h1>
                <p className="text-sm text-grey-muted mt-1.5">{t('aiMatches.subtitle')}</p>
            </header>

            <Card className="rounded-2xl border-[#c6c6cd] shadow-xs bg-white/60 backdrop-blur-md">
                <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-1">
                        <label
                            className="text-[10px] uppercase font-bold text-grey-muted tracking-wider">{t('aiMatches.simulatorLabel')}</label>
                        <div className="text-sm font-bold text-grey-dark">{t('aiMatches.simulatorDesc')}</div>
                    </div>
                    <select
                        value={selectedSimOppId}
                        onChange={e => setSelectedSimOppId(e.target.value)}
                        className="bg-white/80 border border-[#c6c6cd]/50 text-grey-dark text-sm font-bold px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/50 cursor-pointer max-w-md w-full sm:w-auto"
                    >
                        {opportunities.map(opp => (
                            <option key={opp.id} value={opp.id}>{opp.title} - {opp.company}</option>
                        ))}
                    </select>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                <Card
                    className="md:col-span-4 rounded-3xl border-slate-800 bg-slate-900 text-white shadow-xl flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-44 h-44 bg-brand-blue/20 blur-3xl -z-1"></div>
                    <CardContent className="p-6 lg:p-7 space-y-6 flex-1 flex flex-col">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-amber-400 animate-spin"/>
                                <span
                                    className="text-[10px] uppercase mt-0.5 tracking-widest font-bold text-brand-blue-light">{t('aiMatches.aiEngine')}</span>
                            </div>
                            <div className="pt-2">
                                <span
                                    className="text-6xl font-display font-black text-white tracking-tight">{matchAnalysis.score}%</span>
                                <p className="text-sm text-[#c6c6cd] font-semibold mt-1">
                                    {t('aiMatches.candidateRatingFor')}
                                    <span
                                        className="block font-bold text-white text-base mt-2">{selectedOpp.title}</span>
                                    <span
                                        className="block text-xs font-bold text-professional-emerald mt-1">{selectedOpp.company}</span>
                                </p>
                                {matchAnalysis.aiReasoning && (
                                    <p className="text-xs text-[#c6c6cd] mt-4 italic leading-relaxed border-t border-white/10 pt-4">
                                        "{matchAnalysis.aiReasoning}"
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-4 pt-8 border-t border-white/10 mt-auto text-left">
                            <div>
                                <div
                                    className="flex justify-between text-xs font-mono font-semibold text-[#c6c6cd] mb-1.5">
                                    <span>{candidateMode === 'academic' ? t('aiMatches.academicReqs', 'Академични изисквания') : t('aiMatches.techSkills')}</span>
                                    <span className="text-white">{matchAnalysis.technicalRequirementsScore}%</span>
                                </div>
                                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-professional-emerald transition-all duration-1000"
                                         style={{width: `${matchAnalysis.technicalRequirementsScore}%`}}></div>
                                </div>
                            </div>
                            <div>
                                <div
                                    className="flex justify-between text-xs font-mono font-semibold text-[#c6c6cd] mb-1.5">
                                    <span>{t('aiMatches.experienceLevel')}</span>
                                    <span className="text-white">{matchAnalysis.experienceLevelScore}%</span>
                                </div>
                                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-brand-blue transition-all duration-1000"
                                         style={{width: `${matchAnalysis.experienceLevelScore}%`}}></div>
                                </div>
                            </div>
                            <div>
                                <div
                                    className="flex justify-between text-xs font-mono font-semibold text-[#c6c6cd] mb-1.5">
                                    <span>{t('aiMatches.culturalFit')}</span>
                                    <span className="text-white">{matchAnalysis.culturalFitScore}%</span>
                                </div>
                                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-academic-purple transition-all duration-1000"
                                         style={{width: `${matchAnalysis.culturalFitScore}%`}}></div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="md:col-span-8 space-y-6">
                    <Card className="rounded-3xl border-[#c6c6cd] shadow-xs bg-white/60 backdrop-blur-md">
                        <CardHeader className="pb-4 border-b border-[#f0edef]">
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-lg font-bold text-grey-dark flex items-center gap-2">
                                    <Star className="w-5 h-5 text-amber-500 fill-amber-500"/>
                                    {t('aiMatches.detailedAnalysis')}
                                </CardTitle>
                                <span
                                    className="text-xs font-mono font-semibold text-grey-muted hidden sm:inline">{t('aiMatches.coverageCompatibility')}</span>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-0 p-0 sm:p-6 sm:pt-4">
                            {matchAnalysis.breakdown.length === 0 ? (
                                <p className="p-6 text-sm text-grey-muted">{t('aiMatches.noBreakdown', 'Няма изисквания за сравнение по тази обява.')}</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse min-w-[500px]">
                                        <thead>
                                        <tr className="border-b border-[#c6c6cd]/30 text-[10px] font-bold text-grey-muted uppercase tracking-wider">
                                            <th className="p-4 text-left">{candidateMode === 'academic' ? t('aiMatches.thRequirement', 'Изискване') : t('aiMatches.thTechSkill')}</th>
                                            <th className="p-4 text-center">{t('aiMatches.thStatus')}</th>
                                            <th className="p-4 text-left">{t('aiMatches.thCategory')}</th>
                                        </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#c6c6cd]/20">
                                        {matchAnalysis.breakdown.map((row) => {
                                            let customColor = "bg-red-100 text-red-700 border-transparent";
                                            if (row.statusKey === "statusCovers") customColor = "bg-green-100 text-green-700 border-transparent";
                                            if (row.statusKey === "statusPartial") customColor = "bg-amber-100 text-amber-700 border-transparent";

                                            return (
                                                <tr key={row.skill} className="hover:bg-white/50 transition-colors">
                                                    <td className="p-4 font-bold text-sm text-grey-dark">{row.skill}</td>
                                                    <td className="p-4 text-center">
                                                        <Badge className={`text-[10px] font-bold ${customColor}`}>
                                                            {t(`aiMatches.${row.statusKey}`)}
                                                        </Badge>
                                                    </td>
                                                    <td className="p-4 text-xs text-grey-muted font-mono">{t(`aiMatches.${row.categoryKey}`)}</td>
                                                </tr>
                                            );
                                        })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl border-[#c6c6cd]/50 bg-[#f0edef]/40 backdrop-blur-sm">
                        <CardContent className="p-5 space-y-2">
                            <h4 className="text-xs font-bold text-grey-dark uppercase tracking-wider flex items-center gap-2">
                                <BookOpen className="w-4.5 h-4.5 text-brand-blue-light"/>
                                {t('aiMatches.recommendedCourses')}
                            </h4>
                            <p className="text-sm text-grey-muted">
                                {selectedMatch
                                    ? t('aiMatches.liveAnalysisNote', 'Анализът е базиран на реални AI match резултати от Matching Service.')
                                    : t('aiMatches.fallbackAnalysisNote', 'За тази обява все още няма AI match. Показваме skill coverage анализ.')}
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
