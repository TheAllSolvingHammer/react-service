import {useTranslation} from 'react-i18next';
import {ArrowRight, Briefcase, CheckCircle2, Eye, GraduationCap, History, Sparkles} from 'lucide-react';
import {Opportunity, Profile} from '@/lib/types';
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";

interface CandidateDashboardProps {
    profile: Profile;
    opportunities: Opportunity[];
    candidateMode: 'professional' | 'academic';
    setCandidateMode: (mode: 'professional' | 'academic') => void;
    setCurrentTab: (tab: string) => void;
    setSelectedOpportunityId: (id: string | null) => void;
    appliedList: Array<{
        id: string;
        title: string;
        company: string;
        status: string;
        date: string;
        logoColor?: string
    }>;
    setAppliedList: React.Dispatch<React.SetStateAction<Array<{
        id: string;
        title: string;
        company: string;
        status: string;
        date: string;
        logoColor?: string
    }>>>;
}

export default function CandidateDashboard({
                                               profile,
                                               opportunities,
                                               candidateMode,
                                               setCandidateMode,
                                               setCurrentTab,
                                               setSelectedOpportunityId,
                                               appliedList,
                                               setAppliedList
                                           }: CandidateDashboardProps) {
    const {t} = useTranslation();

    const handleApplyOneClick = (opp: Opportunity) => {
        const exists = appliedList.some(item => item.title === opp.title && item.company === opp.company);
        if (exists) return;

        const newApplication = {
            id: opp.id,
            title: opp.title,
            company: opp.company,
            status: "В процес на преглед", // You can translate statuses globally later
            date: "Току-що",
            logoColor: "bg-brand-blue"
        };

        setAppliedList(prev => [newApplication, ...prev]);
    };

    // Safely grab the first name
    const firstName = profile?.name ? profile.name.split(' ')[0] : t('dashboard.candidateDefault');

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Welcome Section & Mode Toggle */}
            <header
                className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 pb-6 border-b border-[#c6c6cd]/30">
                <div>
                    <h1 className="text-4xl font-display font-extrabold text-grey-dark tracking-tight leading-tight">
                        {t('dashboard.welcome')}, {firstName}!
                    </h1>
                    <p className="text-lg text-grey-muted mt-2">
                        {t('dashboard.profileAttention')} <span
                        className="font-bold text-brand-blue">3 {t('dashboard.topCompanies')}</span>.
                    </p>
                </div>

                {/* Mode Toggle Layout */}
                <div
                    className="bg-[#f0edef]/60 p-1.5 rounded-2xl border border-[#c6c6cd]/40 inline-flex items-center shadow-xs self-start md:self-auto backdrop-blur-sm">
                    <Button
                        variant={candidateMode === 'professional' ? "default" : "ghost"}
                        onClick={() => setCandidateMode('professional')}
                        className={`rounded-xl text-xs font-semibold uppercase tracking-wider transition-all gap-2 h-9 px-4 ${
                            candidateMode === 'professional'
                                ? 'bg-white text-professional-emerald shadow-sm border border-[#c6c6cd]/30 hover:bg-white'
                                : 'text-grey-muted hover:text-professional-emerald hover:bg-transparent'
                        }`}
                    >
                        <Briefcase className="w-4 h-4"/>
                        {t('dashboard.professional')}
                    </Button>
                    <Button
                        variant={candidateMode === 'academic' ? "default" : "ghost"}
                        onClick={() => setCandidateMode('academic')}
                        className={`rounded-xl text-xs font-semibold uppercase tracking-wider transition-all gap-2 h-9 px-4 ${
                            candidateMode === 'academic'
                                ? 'bg-white text-academic-purple shadow-sm border border-[#c6c6cd]/30 hover:bg-white'
                                : 'text-grey-muted hover:text-academic-purple hover:bg-transparent'
                        }`}
                    >
                        <GraduationCap className="w-4 h-4"/>
                        {t('dashboard.academic')}
                    </Button>
                </div>
            </header>

            {/* Bento Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Recent Applications Summary (Left 8 columns) */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    <Card
                        className="flex-1 rounded-3xl border-[#c6c6cd] shadow-xs bg-white/40 backdrop-blur-md flex flex-col justify-between overflow-hidden">
                        <CardHeader
                            className="flex flex-row justify-between items-center pb-4 border-b border-[#f0edef]/50 space-y-0">
                            <CardTitle
                                className="text-xl font-display font-bold text-grey-dark flex items-center gap-2.5">
                                <History className="w-5.5 h-5.5 text-brand-blue"/>
                                {t('dashboard.recentApplications')}
                            </CardTitle>
                            <Button
                                variant="link"
                                onClick={() => setCurrentTab('opportunities')}
                                className="text-xs font-bold text-brand-blue hover:text-brand-blue-dark uppercase p-0 h-auto"
                            >
                                {t('dashboard.viewAll')}
                            </Button>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            {appliedList.length === 0 ? (
                                <div
                                    className="text-center py-8 text-grey-muted text-sm">{t('dashboard.noApplications')}</div>
                            ) : (
                                appliedList.map((app, index) => {
                                    const isSelected = app.status === "В процес на преглед";
                                    return (
                                        <div
                                            key={index}
                                            className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl bg-[#fcf8fa]/80 hover:bg-[#f0edef]/60 transition-colors border border-transparent hover:border-[#c6c6cd]/50 group cursor-pointer gap-4"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div
                                                    className={`w-12 h-12 rounded-xl text-white font-mono flex items-center justify-center font-bold text-lg select-none shadow-xs ${
                                                        app.logoColor || 'bg-brand-blue-light'
                                                    }`}>
                                                    {app.company.slice(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h3 className="text-base font-bold text-grey-dark group-hover:text-brand-blue transition-colors">
                                                        {app.title}
                                                    </h3>
                                                    <p className="text-xs text-grey-muted">
                                                        {app.company} • София
                                                    </p>
                                                </div>
                                            </div>

                                            <div
                                                className="flex sm:flex-col justify-between items-center sm:items-end w-full sm:w-auto mt-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-[#c6c6cd]/20">
                                                <Badge variant="outline"
                                                       className={`gap-1.5 text-xs font-semibold px-2.5 py-1 bg-white/60 text-grey-dark rounded-full shadow-xs border-[#c6c6cd]/40`}>
                                                    <span
                                                        className={`w-2 h-2 rounded-full ${isSelected ? 'bg-professional-emerald' : 'bg-match-medium'}`}></span>
                                                    {app.status}
                                                </Badge>
                                                <p className="text-[10px] text-grey-muted font-mono mt-1.5 pr-1">{app.date}</p>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl border-brand-blue/20 bg-brand-blue/5 backdrop-blur-sm">
                        <CardContent className="p-4 flex items-center gap-3">
                            <Sparkles className="w-5 h-5 text-brand-blue shrink-0 animate-bounce"/>
                            <p className="text-xs text-brand-blue font-semibold m-0">
                                {t('dashboard.tipPart1')} <span
                                className="font-extrabold underline">85% {t('dashboard.tipPart2')}</span>. {t('dashboard.tipPart3')}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Top AI Matches Sidebar (Right 4 columns) */}
                <aside className="lg:col-span-4 flex flex-col">
                    <Card
                        className="flex-1 rounded-3xl border-[#c6c6cd] shadow-xs bg-[#fcf8fa]/40 backdrop-blur-md flex flex-col justify-between overflow-hidden">
                        <CardHeader className="pb-4 border-b border-[#f0edef]/50 space-y-0">
                            <CardTitle
                                className="text-lg font-display font-bold text-grey-dark flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-match-high animate-pulse"/>
                                {t('dashboard.topMatches')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            {opportunities.length === 0 ? (
                                <div
                                    className="text-center py-8 text-grey-muted text-sm">{t('dashboard.noMatches')}</div>
                            ) : (
                                opportunities.slice(0, 2).map((opp) => {
                                    const alreadyApplied = appliedList.some(item => item.title === opp.title && item.company === opp.company);
                                    return (
                                        <div
                                            key={opp.id}
                                            className="bg-white/70 rounded-2xl p-4.5 border border-[#c6c6cd]/75 relative overflow-hidden group hover:shadow-md transition-shadow duration-300"
                                        >
                                            {/* Compact Badge Match Rate */}
                                            <div
                                                className="absolute top-0 right-0 bg-match-high text-white text-[11px] font-mono font-bold px-2.5 py-1 rounded-bl-xl shadow-xs">
                                                {opp.matchScore}%
                                            </div>

                                            <h3 className="text-base font-bold text-grey-dark mb-1 mt-2 tracking-tight">
                                                {opp.title}
                                            </h3>
                                            <p className="text-xs text-grey-muted mb-3">
                                                {opp.company}
                                            </p>

                                            <div className="flex flex-wrap gap-1.5 mb-4">
                                                {opp.tags.slice(0, 3).map((tag, i) => (
                                                    <Badge key={i} variant="secondary"
                                                           className="bg-[#f0edef]/80 text-grey-muted hover:bg-[#f0edef] text-[10px] font-semibold font-mono rounded-md px-2 py-0.5">
                                                        {tag}
                                                    </Badge>
                                                ))}
                                            </div>

                                            {alreadyApplied ? (
                                                <div
                                                    className="w-full flex items-center justify-center gap-1.5 py-2 bg-professional-emerald/10 text-professional-emerald border border-professional-emerald/20 rounded-xl text-xs font-bold leading-none">
                                                    <CheckCircle2 className="w-4.5 h-4.5"/>
                                                    {t('dashboard.applied')}
                                                </div>
                                            ) : (
                                                <div className="flex flex-col sm:flex-row gap-2">
                                                    <Button
                                                        onClick={() => handleApplyOneClick(opp)}
                                                        className="flex-1 bg-brand-blue hover:bg-brand-blue-dark text-white rounded-xl text-xs font-bold shadow-sm hover:scale-[1.02] transition-transform h-9"
                                                    >
                                                        {t('dashboard.oneClickApply')}
                                                        <ArrowRight className="w-3.5 h-3.5 ml-1.5"/>
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => {
                                                            setSelectedOpportunityId(opp.id);
                                                            setCurrentTab('opportunities');
                                                        }}
                                                        className="w-10 h-9 p-0 rounded-xl border-[#c6c6cd] hover:bg-[#f0edef]/60 text-[#0058be]"
                                                        title={t('dashboard.viewDetails')}
                                                    >
                                                        <Eye className="w-4 h-4"/>
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </CardContent>
                        <CardFooter className="pt-4 border-t border-[#f0edef]/50 flex justify-center pb-6">
                            <Button
                                variant="ghost"
                                onClick={() => setCurrentTab('aimatches')}
                                className="text-xs font-bold text-grey-muted hover:text-brand-blue hover:bg-transparent h-auto p-0 flex items-center gap-1.5"
                            >
                                {t('dashboard.viewAiAnalysis')}
                                <ArrowRight className="w-3.5 h-3.5"/>
                            </Button>
                        </CardFooter>
                    </Card>
                </aside>
            </div>
        </div>
    );
}