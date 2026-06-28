import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Search, Briefcase, MapPin, Building, Calendar,
    ArrowLeft, CheckCircle2, Loader2, Sparkles, FileText
} from 'lucide-react';
import { Opportunity, Profile } from '@/lib/types';
import { CandidateMode } from '@/lib/mode';
import { fetchOpportunities, fetchOpportunityById } from '@/lib/opportunities';
import { applyToOpportunity } from '@/lib/applications';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { fetchCandidateApplications, mapApplicationActivity } from '@/lib/applications';

interface CandidateOpportunitiesProps {
    profile: Profile;
    candidateMode: CandidateMode;
    selectedOpportunityId: string | null;
    setSelectedOpportunityId: (id: string | null) => void;
}

export default function CandidateOpportunities({ profile, candidateMode, selectedOpportunityId, setSelectedOpportunityId }: CandidateOpportunitiesProps) {
    const { t } = useTranslation();

    const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const [selectedOppDetails, setSelectedOppDetails] = useState<Opportunity | null>(null);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);
    const [isApplying, setIsApplying] = useState(false);
    const [hasApplied, setHasApplied] = useState(false);
    const [appliedList, setAppliedList] = useState<any[]>([]);
    
    // Зареждане на кандидатури за проследяване на статус
    useEffect(() => {
        if (!profile?.id) return;
        fetchCandidateApplications(profile.id)
            .then(apps => setAppliedList(apps.map(mapApplicationActivity)))
            .catch(err => console.error("Error loading apps:", err));
    }, [profile?.id]);

    // Зареждане на всички обяви с ТЪРСЕНЕ и РЕЖИМ
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            setIsLoading(true);
            // Използваме новата подредба: (searchTerm, mode)
            fetchOpportunities(searchTerm, candidateMode)
                .then(setOpportunities)
                .catch(err => console.error(t('opportunities.errorLoading', 'Грешка при зареждане на обяви:'), err))
                .finally(() => setIsLoading(false));
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, candidateMode, t]);

    // Детайлен изглед...
    useEffect(() => {
        if (!selectedOpportunityId) {
            setSelectedOppDetails(null);
            setHasApplied(false);
            return;
        }

        setIsLoadingDetails(true);
        fetchOpportunityById(selectedOpportunityId)
            .then(details => setSelectedOppDetails(details))
            .catch(err => console.error(t('opportunities.errorLoadingDetails', 'Грешка при зареждане на детайли:'), err))
            .finally(() => setIsLoadingDetails(false));
    }, [selectedOpportunityId, t]);

    const handleApply = async () => {
        if (!selectedOppDetails || !profile.id) return;

        setIsApplying(true);
        try {
            await applyToOpportunity(
                selectedOppDetails.id,
                profile.id,
                t('opportunities.applyMessage', 'Кандидатстване през детайлен изглед.')
            );
            setHasApplied(true);
        } catch (error) {
            console.error(t('opportunities.errorApplying', 'Грешка при кандидатстване:'), error);
        } finally {
            setIsApplying(false);
        }
    };

    const handleApplyOneClick = async (e: React.MouseEvent, opp: Opportunity) => {
        e.stopPropagation();
        const exists = appliedList.some(item => item.id === opp.id);
        if (exists || !profile?.id) return;

        try {
            await applyToOpportunity(opp.id, profile.id, t('opportunities.quickApply', 'Кандидатстване чрез бърз бутон от обяви.'));
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
            console.error("Грешка при бързо кандидатстване:", error);
        }
    };

    if (selectedOpportunityId) {
        return (
            <div className="space-y-6 animate-fade-in max-w-4xl mx-auto pb-12">
                <Button
                    variant="ghost"
                    onClick={() => setSelectedOpportunityId(null)}
                    className="text-grey-muted hover:text-brand-blue gap-2 -ml-4"
                >
                    <ArrowLeft className="w-4 h-4" /> {t('opportunities.backToAll', 'Назад към всички обяви')}
                </Button>

                {isLoadingDetails ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-10 h-10 text-brand-blue animate-spin mb-4" />
                        <p className="text-grey-muted font-medium">{t('opportunities.loadingDetails', 'Зареждане на детайли...')}</p>
                    </div>
                ) : selectedOppDetails ? (
                    <Card className="rounded-3xl border-0 shadow-lg bg-white overflow-hidden relative">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-blue to-purple-600"></div>
                        <CardHeader className="pt-8 pb-6 border-b border-[#f0edef] bg-[#fcf8fa]/30">
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                                <div>
                                    <Badge className="bg-brand-blue/10 text-brand-blue hover:bg-brand-blue/20 border-0 mb-4 rounded-lg">
                                        {candidateMode === 'academic' ? 'Академична Програма' : t('opportunities.activePosition', 'Активна Позиция')}
                                    </Badge>
                                    <CardTitle className="text-3xl font-display font-extrabold text-grey-dark mb-2">
                                        {selectedOppDetails.title}
                                    </CardTitle>
                                    <div className="flex flex-wrap items-center gap-4 text-sm text-grey-muted font-medium">
                                        <span className="flex items-center gap-1.5"><Building className="w-4 h-4 text-brand-blue" /> {selectedOppDetails.company}</span>
                                        <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-brand-blue" /> {selectedOppDetails.location}</span>
                                        <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-brand-blue" /> {t('opportunities.publishedToday', 'Публикувана днес')}</span>
                                    </div>
                                </div>
                                <div className="shrink-0 w-full md:w-auto">
                                    {hasApplied ? (
                                        <Button disabled className="w-full md:w-auto bg-professional-emerald text-white rounded-xl gap-2 shadow-sm h-12 px-8 text-base">
                                            <CheckCircle2 className="w-5 h-5" /> {t('opportunities.successfullyApplied', 'Успешно Кандидатстване')}
                                        </Button>
                                    ) : (
                                        <Button onClick={handleApply} disabled={isApplying} className="w-full md:w-auto bg-brand-blue hover:bg-brand-blue-dark text-white rounded-xl gap-2 shadow-md hover:shadow-lg transition-all h-12 px-8 text-base">
                                            {isApplying ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                                            {t('opportunities.applyOneClick', 'Кандидатствай с 1 клик')}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-8 space-y-8">
                            <div>
                                <h3 className="text-lg font-bold text-grey-dark flex items-center gap-2 mb-4">
                                    <FileText className="w-5 h-5 text-brand-blue" /> {t('opportunities.jobDescription', 'Описание на позицията')}
                                </h3>
                                <p className="text-grey-dark leading-relaxed whitespace-pre-wrap text-sm md:text-base">
                                    {selectedOppDetails.description || t('opportunities.noDescription', 'Няма въведено описание.')}
                                </p>
                            </div>

                            {selectedOppDetails.requirements && selectedOppDetails.requirements.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-bold text-grey-dark flex items-center gap-2 mb-4">
                                        <Briefcase className="w-5 h-5 text-brand-blue" /> {t('opportunities.requirements', 'Изисквания')}
                                    </h3>
                                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {selectedOppDetails.requirements.map((req, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-grey-dark bg-[#f0edef]/50 p-3 rounded-xl border border-[#c6c6cd]/30">
                                                <div className="w-1.5 h-1.5 rounded-full bg-brand-blue mt-1.5 shrink-0"></div>
                                                {req}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <div className="text-center py-20 text-grey-muted">{t('opportunities.notFound', 'Обявата не е намерена.')}</div>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-display font-extrabold text-grey-dark tracking-tight">
                        {candidateMode === 'academic' ? 'Академични Програми' : t('opportunities.title', 'Всички Обяви')}
                    </h1>
                    <p className="text-sm text-grey-muted mt-1">{t('opportunities.subtitle', 'Открийте следващата стъпка във вашата кариера.')}</p>
                </div>

                <div className="relative w-full md:w-96">
                    <Input
                        placeholder={t('opportunities.searchPlaceholder', 'Търсене по ключова дума...')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 h-12 rounded-2xl border-[#c6c6cd]/50 bg-white/60 backdrop-blur-sm shadow-sm focus-visible:ring-brand-blue"
                    />
                    <Search className="w-5 h-5 absolute left-3.5 top-3.5 text-grey-muted" />
                </div>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <Card key={i} className="rounded-3xl border-0 shadow-sm bg-white/40 h-64 animate-pulse"></Card>
                    ))}
                </div>
            ) : opportunities.length === 0 ? (
                <div className="text-center py-24 bg-white/40 backdrop-blur-sm rounded-3xl border border-[#c6c6cd]/30">
                    <Search className="w-12 h-12 text-brand-blue/30 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-grey-dark">{t('opportunities.noResultsTitle', 'Няма намерени обяви')}</h3>
                    <p className="text-sm text-grey-muted mt-1">{t('opportunities.noResultsDesc', 'Опитайте с други ключови думи.')}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {opportunities.map((opp) => (
                        <Card key={opp.id} className="rounded-3xl border border-[#c6c6cd]/40 shadow-sm bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group cursor-pointer" onClick={() => setSelectedOpportunityId(opp.id)}>
                            <CardHeader className="pb-3 relative">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-blue to-purple-600 text-white flex items-center justify-center font-bold text-lg shadow-sm mb-4 group-hover:scale-110 transition-transform">
                                    {(opp.company || opp.location || opp.title || '?').charAt(0)}
                                </div>
                                <CardTitle className="text-lg font-bold text-grey-dark leading-tight group-hover:text-brand-blue transition-colors line-clamp-2">
                                    {opp.title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pb-4 flex-1">
                                <div className="flex flex-col gap-2 text-sm font-medium text-grey-muted mb-4">
                                    <span className="flex items-center gap-2"><Building className="w-4 h-4" /> {opp.company}</span>
                                    <span className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {opp.location}</span>
                                </div>
                                <p className="text-xs text-grey-dark line-clamp-3 leading-relaxed">
                                    {opp.description || t('opportunities.noDescription', 'Няма въведено описание.')}
                                </p>
                            </CardContent>
                            <CardFooter className="pt-0 pb-5 gap-2 flex flex-col md:flex-row">
                                <Button className="w-full md:flex-1 bg-[#f0edef] hover:bg-grey-muted hover:text-white text-grey-dark rounded-xl font-bold transition-colors">
                                    {t('opportunities.viewDetails', 'Виж детайли')}
                                </Button>
                                {appliedList.some(item => item.id === opp.id) ? (
                                    <div className="w-full md:flex-1 flex items-center justify-center gap-2 py-2.5 bg-professional-emerald/10 text-professional-emerald border border-professional-emerald/20 rounded-xl text-xs font-bold h-10">
                                        <CheckCircle2 className="w-4 h-4"/> {t('dashboard.applied', 'Кандидатствали сте')}
                                    </div>
                                ) : (
                                    <Button onClick={(e) => handleApplyOneClick(e, opp)} className="w-full md:flex-1 bg-brand-blue hover:bg-brand-blue-dark text-white rounded-xl text-xs font-bold shadow-md transition-all h-10">
                                        {t('dashboard.oneClickApply', 'Кандидатствай')}
                                    </Button>
                                )}
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}