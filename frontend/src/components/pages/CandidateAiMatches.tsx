import {useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {BookOpen, Check, Plus, Sparkles, Star} from 'lucide-react';
import {Opportunity, Profile} from '@/lib/types';
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";

interface CandidateAiMatchesProps {
    profile: Profile;
    setProfile: (profile: Profile) => void;
    opportunities: Opportunity[];
}

export default function CandidateAiMatches({
                                               profile,
                                               setProfile,
                                               opportunities
                                           }: CandidateAiMatchesProps) {
    const {t} = useTranslation();
    const [selectedSimOppId, setSelectedSimOppId] = useState<string>(opportunities[0]?.id || "");

    const selectedOpp = useMemo(() => {
        return opportunities.find(o => o.id === selectedSimOppId) || opportunities[0];
    }, [opportunities, selectedSimOppId]);

    // Recalculate dynamic fit based on profile skills
    const matchAnalysis = useMemo(() => {
        const oppSkills = selectedOpp ? selectedOpp.tags : ["Python", "TensorFlow", "AWS"];
        const userSkills = profile?.skills ? profile.skills.map(s => s.toLowerCase()) : [];

        const breakdown = oppSkills.map(skill => {
            const isPerfectMatch = userSkills.includes(skill.toLowerCase());
            const isPartial = !isPerfectMatch && userSkills.some(us => us.includes(skill.toLowerCase()) || skill.toLowerCase().includes(us));

            let statusKey = "statusMissing";
            if (isPerfectMatch) {
                statusKey = skill.toLowerCase() === "python" ? "statusExceeds" : "statusCovers";
            } else if (isPartial) {
                statusKey = "statusPartial";
            }

            return {
                skill,
                statusKey,
                categoryKey: skill.toLowerCase() === "python" || skill.toLowerCase() === "pytorch" || skill.toLowerCase() === "tensorflow" ? "catAiDev" : "catCloudInfra"
            };
        });

        const coveredCount = breakdown.filter(b => b.statusKey === "statusCovers" || b.statusKey === "statusExceeds").length;
        const partialCount = breakdown.filter(b => b.statusKey === "statusPartial").length;

        const totalScore = Math.min(100, Math.round(((coveredCount + partialCount * 0.5) / breakdown.length) * 40 + 60));

        const finalScore = selectedOpp?.matchScore || totalScore;

        return {
            score: finalScore,
            breakdown,
            technicalRequirementsScore: Math.min(100, finalScore + 3),
            experienceLevelScore: profile?.type === 'professional' ? 92 : 75,
            culturalFitScore: 84
        };
    }, [selectedOpp, profile?.skills, profile?.type]);

    const handleQuickAddSkill = (skill: string) => {
        if (profile.skills.includes(skill)) return;
        setProfile({
            ...profile,
            skills: [...profile.skills, skill]
        });
    };

    if (!selectedOpp) {
        return <div className="text-center py-12 text-grey-muted">{t('aiMatches.noData')}</div>;
    }

    return (
        <div className="space-y-8 animate-fade-in pb-16">

            {/* Page Header */}
            <header className="pb-6 border-b border-[#c6c6cd]/30">
                <h1 className="text-3xl font-display font-extrabold text-grey-dark leading-tight">{t('aiMatches.title')}</h1>
                <p className="text-sm text-grey-muted mt-1.5">
                    {t('aiMatches.subtitle')}
                </p>
            </header>

            {/* Simulator Selector Bar */}
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

                {/* LEFT MAIN: Fit summary and gauge meters (col-span-4) */}
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
                <span className="text-6xl font-display font-black text-white tracking-tight">
                  {matchAnalysis.score}%
                </span>
                                <p className="text-sm text-[#c6c6cd] font-semibold mt-1">
                                    {t('aiMatches.candidateRatingFor')}
                                    <span
                                        className="block font-bold text-white text-base mt-2">{selectedOpp.title}</span>
                                    <span
                                        className="block text-xs font-bold text-professional-emerald mt-1">{selectedOpp.company}</span>
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4 pt-8 border-t border-white/10 mt-auto text-left">
                            {/* Technical skills meter */}
                            <div>
                                <div
                                    className="flex justify-between text-xs font-mono font-semibold text-[#c6c6cd] mb-1.5">
                                    <span>{t('aiMatches.techSkills')}</span>
                                    <span className="text-white">{matchAnalysis.technicalRequirementsScore}%</span>
                                </div>
                                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-professional-emerald transition-all duration-1000"
                                         style={{width: `${matchAnalysis.technicalRequirementsScore}%`}}></div>
                                </div>
                            </div>

                            {/* Exp level meter */}
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

                            {/* Cultural fit meter */}
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

                {/* RIGHT MAIN: Breakdown list and recommended actions (col-span-8) */}
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
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse min-w-[500px]">
                                    <thead>
                                    <tr className="border-b border-[#c6c6cd]/30 text-[10px] font-bold text-grey-muted uppercase tracking-wider">
                                        <th className="p-4 text-left">{t('aiMatches.thTechSkill')}</th>
                                        <th className="p-4 text-center">{t('aiMatches.thStatus')}</th>
                                        <th className="p-4 text-left">{t('aiMatches.thCategory')}</th>
                                        <th className="p-4 text-center">{t('aiMatches.thAction')}</th>
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#c6c6cd]/20">
                                    {matchAnalysis.breakdown.map((row) => {
                                        let statusVariant: "default" | "secondary" | "destructive" | "outline" = "outline";
                                        let customColor = "";

                                        if (row.statusKey === "statusExceeds") {
                                            statusVariant = "default";
                                            customColor = "bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border-transparent";
                                        }
                                        if (row.statusKey === "statusCovers") {
                                            statusVariant = "default";
                                            customColor = "bg-green-100 text-green-700 hover:bg-green-200 border-transparent";
                                        }
                                        if (row.statusKey === "statusPartial") {
                                            statusVariant = "default";
                                            customColor = "bg-amber-100 text-amber-700 hover:bg-amber-200 border-transparent";
                                        }
                                        if (row.statusKey === "statusMissing") {
                                            statusVariant = "destructive";
                                            customColor = "bg-red-100 text-red-700 hover:bg-red-200 border-transparent";
                                        }

                                        return (
                                            <tr key={row.skill} className="hover:bg-white/50 transition-colors">
                                                <td className="p-4 font-bold text-sm text-grey-dark">{row.skill}</td>
                                                <td className="p-4 text-center">
                                                    <Badge variant={statusVariant}
                                                           className={`text-[10px] font-bold ${customColor}`}>
                                                        {t(`aiMatches.${row.statusKey}`)}
                                                    </Badge>
                                                </td>
                                                <td className="p-4 text-xs text-grey-muted font-mono">{t(`aiMatches.${row.categoryKey}`)}</td>
                                                <td className="p-4 text-center">
                                                    {row.statusKey === "statusMissing" ? (
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleQuickAddSkill(row.skill)}
                                                            className="h-7 text-[10px] bg-brand-blue hover:bg-brand-blue-dark text-white font-bold uppercase tracking-wider gap-1 rounded-md"
                                                        >
                                                            <Plus className="w-3 h-3"/>
                                                            {t('aiMatches.actionAdd')}
                                                        </Button>
                                                    ) : (
                                                        <span
                                                            className="text-xs font-bold text-professional-emerald flex items-center justify-center gap-1">
                                <Check className="w-4 h-4"/> {t('aiMatches.actionSuccess')}
                              </span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Upskilling suggestions bento element */}
                    <Card className="rounded-2xl border-[#c6c6cd]/50 bg-[#f0edef]/40 backdrop-blur-sm">
                        <CardContent className="p-5 space-y-4">
                            <h4 className="text-xs font-bold text-grey-dark uppercase tracking-wider flex items-center gap-2">
                                <BookOpen className="w-4.5 h-4.5 text-brand-blue-light"/>
                                {t('aiMatches.recommendedCourses')}
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div
                                    className="bg-white/80 p-4 rounded-xl border border-[#c6c6cd]/40 space-y-1.5 hover:border-brand-blue/50 transition-colors shadow-sm cursor-pointer">
                                    <span className="text-[9px] font-bold text-academic-purple uppercase font-mono">Софтуерен Университет</span>
                                    <h5 className="text-sm font-bold text-grey-dark leading-tight">Advanced Cloud
                                        Architectures & AWS Setup</h5>
                                    <p className="text-xs text-grey-muted">{t('aiMatches.investHours')}</p>
                                </div>
                                <div
                                    className="bg-white/80 p-4 rounded-xl border border-[#c6c6cd]/40 space-y-1.5 hover:border-brand-blue/50 transition-colors shadow-sm cursor-pointer">
                                    <span
                                        className="text-[9px] font-bold text-professional-emerald uppercase font-mono">Coursera Academy</span>
                                    <h5 className="text-sm font-bold text-grey-dark leading-tight">NLP models & Deep
                                        Learning Transformers</h5>
                                    <p className="text-xs text-grey-muted">{t('aiMatches.coverRequirements')}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}