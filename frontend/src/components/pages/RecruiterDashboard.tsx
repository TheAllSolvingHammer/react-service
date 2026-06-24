import {useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Award, Briefcase, ChevronRight, Search, Sparkles, TrendingUp, Users} from 'lucide-react';
import {Applicant} from '@/lib/types';
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {Input} from "@/components/ui/input";

interface RecruiterDashboardProps {
    applicants: Applicant[];
    opportunityCount: number;
    setCurrentTab: (tab: string) => void;
    setSelectedApplicantId: (id: string | null) => void;
}

export default function RecruiterDashboard({
                                               applicants,
                                               opportunityCount,
                                               setCurrentTab,
                                               setSelectedApplicantId
                                           }: RecruiterDashboardProps) {
    const {t} = useTranslation();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState<string>('all');

    const avgMatch = applicants.length
        ? Math.round(applicants.reduce((sum, app) => sum + app.matchScore, 0) / applicants.length)
        : 0;

    const topUniversity = useMemo(() => {
        const academicApplicants = applicants.filter((app) => app.candidateMode === 'academic');
        return academicApplicants[0]?.role ?? '—';
    }, [applicants]);

    const stats = [
        {
            label: t('recruiterDashboard.totalCandidates'),
            value: applicants.length.toString(),
            icon: Users,
            color: "text-brand-blue bg-brand-blue/10"
        },
        {
            label: t('recruiterDashboard.activePositions'),
            value: opportunityCount.toString(),
            icon: Briefcase,
            color: "text-professional-emerald bg-professional-emerald/10"
        },
        {
            label: t('recruiterDashboard.topUniversity'),
            value: topUniversity,
            icon: Award,
            color: "text-academic-purple bg-academic-purple/10"
        },
        {
            label: t('recruiterDashboard.avgMatch'),
            value: applicants.length ? `${avgMatch}%` : '—',
            icon: TrendingUp,
            color: "text-amber-500 bg-amber-500/10"
        }
    ];

    // Search filter
    const filteredApplicants = useMemo(() => {
        return applicants.filter(app => {
            const matchSearch =
                app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                app.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
                app.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));

            const matchType =
                selectedType === 'all' ||
                app.candidateMode === selectedType;

            return matchSearch && matchType;
        });
    }, [applicants, searchQuery, selectedType]);

    const handleInspectApplicant = (id: string) => {
        setSelectedApplicantId(id);
        setCurrentTab('recruiter_applicant_detail');
    };

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            {/* Header section */}
            <header
                className="pb-6 border-b border-[#c6c6cd]/30 flex flex-col md:flex-row md:justify-between md:items-end gap-6">
                <div>
                    <h1 className="text-3xl font-display font-black text-grey-dark leading-tight">
                        {t('recruiterDashboard.title')}
                    </h1>
                    <p className="text-sm text-grey-muted mt-1.5">
                        {t('recruiterDashboard.subtitle')}
                    </p>
                </div>
                <Badge variant="outline"
                       className="bg-[#1b1b1d] text-white px-3 py-1.5 text-xs font-bold rounded-xl font-mono self-start md:self-auto uppercase tracking-wide border-transparent shadow-sm">
                    {t('recruiterDashboard.accessEnabled')}
                </Badge>
            </header>

            {/* Numerical Metrics Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => {
                    const IconComp = stat.icon;
                    return (
                        <Card key={i} className="bg-white/60 backdrop-blur-md border-[#c6c6cd] rounded-3xl shadow-xs">
                            <CardContent className="p-5 flex flex-col gap-3">
                                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${stat.color}`}>
                                    <IconComp className="w-5 h-5"/>
                                </div>
                                <div>
                                    <span
                                        className="block text-2xl font-display font-black text-grey-dark tracking-tight">{stat.value}</span>
                                    <span
                                        className="text-[10px] uppercase tracking-wide font-extrabold text-grey-muted">{stat.label}</span>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Main Applicants Panel */}
            <Card className="bg-white/60 backdrop-blur-md rounded-3xl border-[#c6c6cd] shadow-xs overflow-hidden">
                <CardHeader
                    className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 pb-4 border-b border-[#f0edef]/60">
                    <CardTitle className="text-lg font-display font-bold text-grey-dark">
                        {t('recruiterDashboard.applicantListTitle')}
                    </CardTitle>

                    <div
                        className="flex flex-wrap items-center gap-2 bg-[#f0edef]/60 p-1 rounded-2xl border border-[#c6c6cd]/30">
                        <Button
                            variant={selectedType === 'all' ? "default" : "ghost"}
                            onClick={() => setSelectedType('all')}
                            className={`rounded-xl text-xs font-semibold h-8 px-3 ${selectedType === 'all' ? 'bg-[#1b1b1d] text-white hover:bg-black' : 'text-grey-muted hover:text-grey-dark'}`}
                        >
                            {t('recruiterDashboard.filterAll')}
                        </Button>
                        <Button
                            variant={selectedType === 'professional' ? "default" : "ghost"}
                            onClick={() => setSelectedType('professional')}
                            className={`rounded-xl text-xs font-semibold h-8 px-3 ${selectedType === 'professional' ? 'bg-[#1b1b1d] text-white hover:bg-black' : 'text-grey-muted hover:text-grey-dark'}`}
                        >
                            {t('recruiterDashboard.filterPro')}
                        </Button>
                        <Button
                            variant={selectedType === 'academic' ? "default" : "ghost"}
                            onClick={() => setSelectedType('academic')}
                            className={`rounded-xl text-xs font-semibold h-8 px-3 ${selectedType === 'academic' ? 'bg-[#1b1b1d] text-white hover:bg-black' : 'text-grey-muted hover:text-grey-dark'}`}
                        >
                            {t('recruiterDashboard.filterAcademic')}
                        </Button>
                    </div>
                </CardHeader>

                <CardContent className="p-6 lg:p-8 space-y-6">
                    {/* Filters and Searches row */}
                    <div className="relative max-w-2xl">
                        <Input
                            type="text"
                            placeholder={t('recruiterDashboard.searchPlaceholder')}
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full bg-white/50 border-[#c6c6cd]/60 rounded-2xl pl-11 h-12 text-sm font-semibold focus-visible:ring-brand-blue shadow-sm"
                        />
                        <Search className="absolute left-4 top-4 w-4 h-4 text-grey-muted"/>
                    </div>

                    {/* Applicants List */}
                    <div className="space-y-4">
                        {filteredApplicants.length === 0 ? (
                            <div
                                className="text-center py-10 text-grey-muted font-medium border border-dashed border-[#c6c6cd] rounded-2xl">
                                {t('recruiterDashboard.noCandidatesFound')}
                            </div>
                        ) : (
                            filteredApplicants.map((app) => (
                                <div
                                    key={app.id}
                                    onClick={() => handleInspectApplicant(app.id)}
                                    className="flex flex-col md:flex-row items-stretch md:items-center justify-between p-4.5 rounded-2xl border border-[#c6c6cd]/60 hover:border-brand-blue bg-white/40 hover:bg-white/80 hover:shadow-sm transition-all cursor-pointer group gap-4 relative overflow-hidden"
                                >
                                    <div
                                        className={`absolute top-0 left-0 w-1.5 h-full transition-colors ${app.candidateMode === 'professional' ? 'bg-[#c6c6cd]/30 group-hover:bg-professional-emerald' : 'bg-[#c6c6cd]/30 group-hover:bg-academic-purple'}`}></div>

                                    <div className="flex items-center gap-4 pl-2">
                                        <div
                                            className="w-12 h-12 rounded-xl border border-[#c6c6cd]/50 overflow-hidden flex items-center justify-center bg-brand-blue/10 text-brand-blue font-bold text-lg select-none">
                                            {app.name.split(' ').map(n => n[0]).join('')}
                                        </div>

                                        <div>
                                            <h3 className="font-display font-black text-gray-900 group-hover:text-brand-blue transition-colors text-base leading-tight">
                                                {app.name}
                                            </h3>
                                            <p className="text-xs text-grey-muted mt-1 font-semibold">
                                                {app.role}
                                            </p>

                                            <div className="flex flex-wrap gap-1.5 mt-2.5">
                                                {app.skills.slice(0, 4).map((s, i) => (
                                                    <Badge key={i} variant="secondary"
                                                           className="bg-[#f0edef]/80 text-gray-600 font-mono font-semibold px-2 py-0.5 text-[10px] rounded-md">
                                                        {s}
                                                    </Badge>
                                                ))}
                                                {app.skills.length > 4 && (
                                                    <Badge variant="secondary"
                                                           className="bg-[#f0edef]/80 text-gray-600 font-mono font-semibold px-2 py-0.5 text-[10px] rounded-md">
                                                        +{app.skills.length - 4}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action column on right */}
                                    <div
                                        className="flex items-center justify-between md:justify-end gap-6 pt-3 md:pt-0 border-t md:border-t-0 border-[#f0edef]/60">

                                        {/* Match Score Indicator */}
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <Badge variant="outline"
                                                       className="gap-1 bg-professional-emerald/5 text-professional-emerald border-professional-emerald/20 rounded-xl px-2.5 py-1 text-xs font-bold">
                                                    <Sparkles className="w-3.5 h-3.5"/>
                                                    {app.matchScore}{t('recruiterDashboard.matchSuffix')}
                                                </Badge>
                                                <span
                                                    className="block text-[10px] text-grey-muted font-mono mt-1.5 text-right pr-1">
                          {t('recruiterDashboard.appliedPrefix')}{app.appliedDate}
                        </span>
                                            </div>

                                            <Button variant="ghost"
                                                    className="h-8 w-8 p-0 rounded-lg border border-[#c6c6cd]/50 group-hover:border-brand-blue group-hover:bg-brand-blue group-hover:text-white transition-colors text-[#0058be]">
                                                <ChevronRight className="w-4 h-4"/>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}