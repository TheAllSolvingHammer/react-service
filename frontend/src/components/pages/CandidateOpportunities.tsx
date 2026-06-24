import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {ArrowRight, Briefcase, CheckCircle2, DollarSign, MapPin, Search} from 'lucide-react';
import {Opportunity, Profile} from '@/lib/types';
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {Input} from "@/components/ui/input";
import {
    applyToOpportunity,
    fetchCandidateApplications,
    mapApplicationActivity,
} from '@/lib/applications';

interface CandidateOpportunitiesProps {
    profile: Profile;
    opportunities: Opportunity[];
    selectedOpportunityId: string | null;
    setSelectedOpportunityId: (id: string | null) => void;
    appliedList: Array<any>;
    setAppliedList: React.Dispatch<React.SetStateAction<Array<any>>>;
}

export default function CandidateOpportunities({
                                                   profile,
                                                   opportunities,
                                                   selectedOpportunityId,
                                                   setSelectedOpportunityId,
                                                   appliedList,
                                                   setAppliedList
                                               }: CandidateOpportunitiesProps) {
    const {t} = useTranslation();
    const [searchTerm, setSearchTerm] = useState('');
    const [isApplying, setIsApplying] = useState(false);

    const selectedOpportunity = opportunities.find(o => o.id === selectedOpportunityId) || opportunities[0];

    const handleApply = async (opp: Opportunity) => {
        const candidateUserId = profile.userId ?? profile.id;
        if (!candidateUserId) return;

        const exists = appliedList.some(item => item.id === opp.id);
        if (exists || isApplying) return;

        setIsApplying(true);
        try {
            await applyToOpportunity(opp.id, String(candidateUserId));
            const apps = await fetchCandidateApplications(String(candidateUserId));
            setAppliedList(apps.map(mapApplicationActivity));
        } catch (err) {
            console.error('Failed to apply:', err);
        } finally {
            setIsApplying(false);
        }
    };

    const filteredOpportunities = opportunities.filter(opp =>
        opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opp.company.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-fade-in pb-12">
            {/* Header & Search */}
            <div
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#c6c6cd]/30 pb-6">
                <div>
                    <h1 className="text-3xl font-display font-extrabold text-grey-dark tracking-tight">
                        {t('opportunities.title')}
                    </h1>
                    <p className="text-sm text-grey-muted mt-1">
                        {t('opportunities.subtitle')}
                    </p>
                </div>

                <div className="relative w-full sm:w-72">
                    <Input
                        type="text"
                        placeholder={t('opportunities.searchPlaceholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 rounded-xl border-[#c6c6cd]/50 bg-white/50 focus-visible:ring-brand-blue"
                    />
                    <Search className="w-4 h-4 absolute left-3.5 top-3 text-grey-muted"/>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* LEFT COLUMN: List of Jobs */}
                <div className="lg:col-span-5 space-y-4 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
                    {filteredOpportunities.length === 0 ? (
                        <div className="text-center py-12 text-grey-muted">{t('opportunities.noResults')}</div>
                    ) : (
                        filteredOpportunities.map((opp) => {
                            const isSelected = selectedOpportunity?.id === opp.id;
                            const hasApplied = appliedList.some(item => item.id === opp.id);

                            return (
                                <Card
                                    key={opp.id}
                                    onClick={() => setSelectedOpportunityId(opp.id)}
                                    className={`cursor-pointer transition-all duration-200 rounded-2xl border ${
                                        isSelected
                                            ? 'border-brand-blue shadow-md bg-white/80'
                                            : 'border-[#c6c6cd]/50 bg-white/40 hover:bg-white/60 hover:shadow-sm'
                                    } backdrop-blur-md overflow-hidden relative`}
                                >
                                    <CardContent className="p-5">
                                        {/* Small Match Badge */}
                                        {opp.matchScore >= 80 && (
                                            <div
                                                className="absolute top-0 right-0 bg-match-high text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-bl-lg">
                                                {opp.matchScore}% Match
                                            </div>
                                        )}

                                        <h3 className={`text-base font-bold mb-1 pr-12 ${isSelected ? 'text-brand-blue' : 'text-grey-dark'}`}>
                                            {opp.title}
                                        </h3>
                                        <p className="text-sm text-grey-muted mb-4">{opp.company}</p>

                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {opp.tags.slice(0, 3).map((tag, i) => (
                                                <Badge key={i} variant="secondary"
                                                       className="bg-[#f0edef]/80 text-grey-muted text-[10px] rounded-md px-2 py-0.5">
                                                    {tag}
                                                </Badge>
                                            ))}
                                        </div>

                                        <div
                                            className="flex justify-between items-center text-xs text-grey-muted font-medium mt-auto">
                                            <div className="flex items-center gap-1.5">
                                                <MapPin className="w-3.5 h-3.5"/>
                                                {opp.location || t('opportunities.defaultLocation')}
                                            </div>
                                            {hasApplied && (
                                                <span
                                                    className="flex items-center gap-1 text-professional-emerald font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5"/>
                                                    {t('opportunities.applied')}
                        </span>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })
                    )}
                </div>

                {/* RIGHT COLUMN: Job Details */}
                <div className="lg:col-span-7">
                    {selectedOpportunity ? (
                        <Card
                            className="rounded-3xl border-[#c6c6cd] shadow-xs bg-white/60 backdrop-blur-md sticky top-6 h-fit">
                            <CardHeader className="pb-4 border-b border-[#c6c6cd]/20">
                                <div className="flex justify-between items-start gap-4">
                                    <div>
                                        <CardTitle className="text-2xl font-bold text-grey-dark mb-2">
                                            {selectedOpportunity.title}
                                        </CardTitle>
                                        <p className="text-lg text-brand-blue font-medium">{selectedOpportunity.company}</p>
                                    </div>
                                    {selectedOpportunity.matchScore && (
                                        <div className="flex flex-col items-end">
                      <span className="text-3xl font-display font-black text-match-high">
                        {selectedOpportunity.matchScore}%
                      </span>
                                            <span
                                                className="text-xs font-bold text-grey-muted uppercase tracking-wider">{t('opportunities.aiMatch')}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-wrap gap-4 mt-6 text-sm text-grey-dark">
                                    <div className="flex items-center gap-1.5">
                                        <MapPin className="w-4 h-4 text-grey-muted"/>
                                        {selectedOpportunity.location || t('opportunities.defaultLocationLong')}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Briefcase className="w-4 h-4 text-grey-muted"/>
                                        {t('opportunities.fullTime')}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <DollarSign className="w-4 h-4 text-grey-muted"/>
                                        {selectedOpportunity.salary || t('opportunities.negotiable')}
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="pt-6 space-y-6">
                                <div>
                                    <h4 className="text-sm font-bold text-grey-dark uppercase tracking-wider mb-3">{t('opportunities.jobDescription')}</h4>
                                    <p className="text-sm text-grey-muted leading-relaxed">
                                        {selectedOpportunity.description || t('opportunities.defaultDesc')}
                                    </p>
                                </div>

                                <div>
                                    <h4 className="text-sm font-bold text-grey-dark uppercase tracking-wider mb-3">{t('opportunities.requirements')}</h4>
                                    <ul className="space-y-2">
                                        {(selectedOpportunity.requirements || ['Опит с React и TypeScript', 'Познания по RESTful API', 'Отлични комуникационни умения']).map((req, index) => (
                                            <li key={index} className="flex items-start gap-2 text-sm text-grey-muted">
                                                <span className="text-brand-blue font-bold mt-0.5">•</span>
                                                {req}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Apply Action */}
                                <div className="pt-6 border-t border-[#c6c6cd]/20">
                                    {appliedList.some(item => item.id === selectedOpportunity.id) ? (
                                        <div
                                            className="w-full bg-professional-emerald/10 border border-professional-emerald/20 p-4 rounded-xl flex flex-col items-center justify-center gap-2 text-professional-emerald">
                                            <CheckCircle2 className="w-6 h-6"/>
                                            <span className="font-bold">{t('opportunities.alreadyApplied')}</span>
                                            <span
                                                className="text-xs opacity-80">{t('opportunities.willBeNotified')}</span>
                                        </div>
                                    ) : (
                                        <Button
                                            onClick={() => handleApply(selectedOpportunity)}
                                            disabled={isApplying}
                                            className="w-full bg-brand-blue hover:bg-brand-blue-dark text-white rounded-xl h-12 text-sm font-bold shadow-sm transition-transform hover:scale-[1.01]"
                                        >
                                            {isApplying ? t('dashboard.applying', 'Кандидатстване...') : t('opportunities.oneClickApply')}
                                            <ArrowRight className="w-4 h-4 ml-2"/>
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div
                            className="h-full flex items-center justify-center text-grey-muted bg-white/20 rounded-3xl border border-[#c6c6cd]/30 border-dashed p-12 text-center">
                            {t('opportunities.selectPosition')}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}