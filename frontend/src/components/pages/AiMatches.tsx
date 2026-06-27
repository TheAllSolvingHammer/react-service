import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
    BrainCircuit, Sparkles, Target, ArrowRight,
    Building, MapPin, Loader2, AlertCircle
} from 'lucide-react';
import { Opportunity, Profile } from '@/lib/types';
import { fetchOpportunitiesWithMatches } from '@/lib/opportunities';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AiMatchesProps {
    profile: Profile;
    setCurrentTab: (tab: string) => void;
    setSelectedOpportunityId: (id: string | null) => void;
}

export default function AiMatches({ profile, setCurrentTab, setSelectedOpportunityId }: AiMatchesProps) {
    const { t } = useTranslation();

    const [matches, setMatches] = useState<Opportunity[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!profile.id) return;

        setIsLoading(true);
        // Използваме твоята готова функция от lib/opportunities.ts
        fetchOpportunitiesWithMatches(profile.id)
            .then(data => {
                // Филтрираме само тези, които имат някакъв AI резултат, и ги сортираме низходящо
                const filteredAndSorted = data
                    .filter(opp => opp.matchScore && opp.matchScore > 0)
                    .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

                setMatches(filteredAndSorted);
            })
            .catch(err => console.error(t('aiMatches.errorLoading', 'Грешка при зареждане на AI съвпадения:'), err))
            .finally(() => setIsLoading(false));
    }, [profile.id, t]);

    const handleViewDetails = (id: string) => {
        setSelectedOpportunityId(id);
        setCurrentTab('opportunities'); // Прехвърляме към таба с обяви, където е красивият детайлен изглед
    };

    // Функция за определяне на цвета според процента
    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-match-high bg-match-high/10 border-match-high/20';
        if (score >= 50) return 'text-match-medium bg-match-medium/10 border-match-medium/20';
        return 'text-match-low bg-match-low/10 border-match-low/20';
    };

    return (
        <div className="space-y-8 animate-fade-in pb-12 relative">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-blue/5 rounded-full blur-[120px] -z-10 pointer-events-none"></div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#c6c6cd]/30 pb-6">
                <div>
                    <h1 className="text-3xl font-display font-extrabold text-grey-dark tracking-tight flex items-center gap-3">
                        <BrainCircuit className="w-8 h-8 text-brand-blue" />
                        {t('aiMatches.title', 'AI Съвпадения')}
                    </h1>
                    <p className="text-sm text-grey-muted mt-2 max-w-2xl">
                        {t('aiMatches.subtitle', 'Нашият алгоритъм анализира вашия опит, умения и образование, за да ви предложи най-подходящите позиции.')}
                    </p>
                </div>

                <div className="bg-white/60 p-3 rounded-2xl border border-[#c6c6cd]/40 shadow-sm backdrop-blur-md flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-blue/10 flex items-center justify-center">
                        <Target className="w-5 h-5 text-brand-blue" />
                    </div>
                    <div>
                        <p className="text-xs text-grey-muted font-bold uppercase tracking-wider">{t('aiMatches.foundMatches', 'Намерени')}</p>
                        <p className="text-lg font-black text-grey-dark leading-none">{matches.length}</p>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="w-10 h-10 text-brand-blue animate-spin mb-4" />
                    <p className="text-grey-muted font-medium">{t('aiMatches.analyzing', 'AI алгоритъмът анализира профила ви...')}</p>
                </div>
            ) : matches.length === 0 ? (
                <Card className="rounded-3xl border-0 shadow-sm bg-white/60 backdrop-blur-sm p-12 text-center flex flex-col items-center">
                    <div className="w-20 h-20 bg-[#f0edef] rounded-full flex items-center justify-center mb-6">
                        <AlertCircle className="w-10 h-10 text-grey-muted" />
                    </div>
                    <h3 className="text-xl font-bold text-grey-dark mb-2">
                        {t('aiMatches.noMatchesTitle', 'Все още няма достатъчно данни')}
                    </h3>
                    <p className="text-grey-muted max-w-md mx-auto mb-6">
                        {t('aiMatches.noMatchesDesc', 'За да ви предложим персонализирани обяви, моля попълнете профила си с повече умения и опит.')}
                    </p>
                    <Button onClick={() => setCurrentTab('profile')} className="bg-brand-blue text-white rounded-xl">
                        {t('aiMatches.updateProfileBtn', 'Обнови профила')}
                    </Button>
                </Card>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {matches.map((opp) => (
                        <Card key={opp.id} className="rounded-3xl border border-[#c6c6cd]/40 shadow-sm bg-white hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden">
                            <CardHeader className="pb-4 relative bg-[#fcf8fa]/30 border-b border-[#f0edef]">
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-blue to-purple-600 text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
                                            {opp.company.charAt(0)}
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg font-bold text-grey-dark leading-tight line-clamp-2">
                                                {opp.title}
                                            </CardTitle>
                                            <div className="flex items-center gap-3 text-xs font-medium text-grey-muted mt-1.5">
                                                <span className="flex items-center gap-1"><Building className="w-3.5 h-3.5" /> {opp.company}</span>
                                                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {opp.location}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Score Badge */}
                                    <div className={`shrink-0 flex flex-col items-center justify-center w-14 h-14 rounded-2xl border ${getScoreColor(opp.matchScore || 0)}`}>
                                        <span className="text-lg font-black leading-none">{opp.matchScore}%</span>
                                        <span className="text-[9px] font-bold uppercase tracking-wider mt-1 opacity-80">Match</span>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="pt-6 pb-4 flex-1">
                                {/* AI Reasoning Block */}
                                {opp.aiReasoning && (
                                    <div className="bg-gradient-to-r from-brand-blue/5 to-purple-500/5 border border-brand-blue/10 rounded-2xl p-4 relative">
                                        <Sparkles className="w-4 h-4 text-brand-blue absolute top-4 right-4 opacity-50" />
                                        <h4 className="text-xs font-bold text-brand-blue uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                            <BrainCircuit className="w-3.5 h-3.5" /> {t('aiMatches.whyMatch', 'Защо сте подходящи?')}
                                        </h4>
                                        <p className="text-sm text-grey-dark leading-relaxed italic">
                                            "{opp.aiReasoning}"
                                        </p>
                                    </div>
                                )}

                                {/* Tags/Skills Match */}
                                {opp.tags && opp.tags.length > 0 && (
                                    <div className="mt-5">
                                        <p className="text-xs font-bold text-grey-muted uppercase tracking-wider mb-2">
                                            {t('aiMatches.keySkills', 'Ключови умения')}
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {opp.tags.map((tag, idx) => (
                                                <Badge key={idx} variant="outline" className="bg-[#f0edef]/50 border-[#c6c6cd]/50 text-grey-dark rounded-lg text-xs font-medium py-1">
                                                    {tag}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>

                            <CardFooter className="pt-0 pb-5 px-6">
                                <Button
                                    onClick={() => handleViewDetails(opp.id)}
                                    className="w-full bg-[#1b1b1d] hover:bg-brand-blue text-white rounded-xl font-bold transition-colors group h-11"
                                >
                                    {t('aiMatches.viewAndApply', 'Виж детайли и Кандидатствай')}
                                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}