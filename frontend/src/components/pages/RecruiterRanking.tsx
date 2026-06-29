import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Award, ChevronRight, Clock, Filter, Mail, Search, Star, UserCheck} from 'lucide-react';
import {Applicant} from '@/lib/types';
import {Card, CardContent} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {Input} from "@/components/ui/input";

interface RecruiterRankingProps {
    applicants: Applicant[];
    setCurrentTab: (tab: string) => void;
    setSelectedApplicantId: (id: string | null) => void;
}

// Помощна функция за цветовете на статусите
const getStatusColor = (status: string) => {
    switch (status) {
        case 'Ново':
            return 'bg-blue-100 text-blue-700 border-blue-200';
        case 'Преглед':
            return 'bg-amber-100 text-amber-700 border-amber-200';
        case 'Интервю':
            return 'bg-purple-100 text-purple-700 border-purple-200';
        case 'Приет':
            return 'bg-green-100 text-green-700 border-green-200';
        case 'Отказан':
            return 'bg-red-100 text-red-700 border-red-200';
        default:
            return 'bg-gray-100 text-gray-700 border-gray-200';
    }
};

const statuses = ['Всички', 'Ново', 'Преглед', 'Интервю', 'Приет', 'Отказан'];

export default function RecruiterRanking({applicants, setCurrentTab, setSelectedApplicantId}: RecruiterRankingProps) {
    const {t} = useTranslation();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('Всички');
    //@ts-ignore
    const [selectedOppId, setSelectedOppId] = useState('all');
    //@ts-ignore
    const uniqueOpportunities = Array.from(new Set(applicants.map(a => a.opportunityId))).map(id => {
        return {
            id,
            title: applicants.find(a => a.opportunityId === id)?.role || 'Неизвестна обява'
        };
    }).filter(opp => opp.id);

    // Филтриране и сортиране на кандидатите
    const filteredAndSortedApplicants = applicants
        .filter(app => {
            const matchesSearch =
                app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                app.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                app.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));

            const matchesStatus = statusFilter === 'Всички' || app.status === statusFilter;
            const matchesOpportunity = selectedOppId === 'all' || app.opportunityId === selectedOppId;

            return matchesSearch && matchesStatus && matchesOpportunity;
        })
        .sort((a, b) => b.matchScore - a.matchScore); // Винаги сортираме по AI Score (низходящо)

    const handleViewApplicant = (id: string) => {
        setSelectedApplicantId(id);
        setCurrentTab('recruiter_applicant_detail');
    };

    // @ts-ignore
    return (
        <div className="space-y-6 animate-fade-in pb-12">
            {/* Header */}
            <div
                className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#c6c6cd]/30 pb-6">
                <div>
                    <h1 className="text-3xl font-display font-extrabold text-grey-dark tracking-tight flex items-center gap-3">
                        <Award className="w-8 h-8 text-brand-blue"/>
                        {t('recruiter.rankingTitle', 'Ранглиста на кандидатите')}
                    </h1>
                    <p className="text-sm text-grey-muted mt-2">
                        {t('recruiter.rankingSubtitle', 'Кандидатите са автоматично подредени според техния AI Match Score.')}
                    </p>
                </div>

                <div
                    className="flex items-center gap-2 bg-white/60 p-1.5 rounded-2xl border border-[#c6c6cd]/40 shadow-sm backdrop-blur-md">
                    <div className="px-3 py-1 text-center border-r border-[#c6c6cd]/40">
                        <span className="block text-xl font-black text-brand-blue">{applicants.length}</span>
                        <span
                            className="text-[9px] font-bold text-grey-muted uppercase tracking-wider">{t('recruiter.total', 'Общо')}</span>
                    </div>
                    <div className="px-3 py-1 text-center">
                        <span
                            className="block text-xl font-black text-professional-emerald">{applicants.filter(a => a.matchScore >= 80).length}</span>
                        <span
                            className="text-[9px] font-bold text-grey-muted uppercase tracking-wider">{t('recruiter.topMatches', 'Топ Съвпад.')}</span>
                    </div>
                </div>
            </div>

            {/* Toolbar: Search & Filters */}
            <div
                className="flex flex-col lg:flex-row justify-between gap-4 items-start lg:items-center bg-[#f0edef]/50 p-4 rounded-2xl border border-[#c6c6cd]/30">
                <div className="relative w-full lg:w-96">
                    <Input
                        placeholder={t('recruiter.searchPlaceholder', 'Търси по име, роля или умение...')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 h-11 rounded-xl border-[#c6c6cd]/50 bg-white/80 shadow-sm focus-visible:ring-brand-blue"
                    />
                    <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-grey-muted"/>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <Filter className="w-4 h-4 text-grey-muted mr-1 hidden sm:block"/>
                    {statuses.map(status => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                                statusFilter === status
                                    ? 'bg-grey-dark text-white border-grey-dark shadow-md'
                                    : 'bg-white text-grey-dark border-[#c6c6cd]/50 hover:bg-brand-blue/5 hover:border-brand-blue/30'
                            }`}
                        >
                            {status === 'Всички' ? t('recruiter.statusAll', 'Всички') : status}
                            {statusFilter === status && (
                                <span className="ml-2 px-1.5 py-0.5 rounded-md bg-white/20 text-white text-[10px]">
                                    {status === 'Всички' ? applicants.length : applicants.filter(a => a.status === status).length}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* List of Candidates */}
            <div className="space-y-4 mt-6">
                {filteredAndSortedApplicants.length === 0 ? (
                    <div
                        className="text-center py-24 bg-white/40 backdrop-blur-sm rounded-3xl border border-[#c6c6cd]/30 border-dashed">
                        <UserCheck className="w-12 h-12 text-grey-muted mx-auto mb-4 opacity-50"/>
                        <h3 className="text-lg font-bold text-grey-dark">{t('recruiter.noCandidatesFound', 'Няма намерени кандидати')}</h3>
                        <p className="text-sm text-grey-muted mt-1">{t('recruiter.tryAdjustingFilters', 'Опитайте да промените филтрите или критериите за търсене.')}</p>
                    </div>
                ) : (
                    filteredAndSortedApplicants.map((applicant) => {
                        const isTopMatch = applicant.matchScore >= 80;
                        return (
                            <Card
                                key={applicant.id}
                                className={`rounded-2xl border transition-all duration-300 hover:shadow-lg group cursor-pointer overflow-hidden ${
                                    isTopMatch ? 'border-match-high/30 bg-gradient-to-r from-match-high/5 to-white' : 'border-[#c6c6cd]/40 bg-white hover:border-brand-blue/30'
                                }`}
                                onClick={() => handleViewApplicant(applicant.id)}
                            >
                                <CardContent className="p-0">
                                    <div className="flex flex-col sm:flex-row items-stretch">

                                        {/* Left Side - Score (Desktop) */}
                                        <div
                                            className={`hidden sm:flex flex-col items-center justify-center w-24 shrink-0 border-r ${isTopMatch ? 'border-match-high/10 bg-match-high/5' : 'border-[#f0edef] bg-[#fcf8fa]'}`}>
                                            <span
                                                className={`text-2xl font-black ${isTopMatch ? 'text-match-high' : 'text-grey-dark'}`}>
                                                {applicant.matchScore}%
                                            </span>
                                            <span
                                                className="text-[9px] font-bold text-grey-muted uppercase tracking-widest mt-1">Match</span>
                                            {isTopMatch &&
                                                <Star className="w-3 h-3 text-match-high mt-2 fill-match-high"/>}
                                        </div>

                                        {/* Main Content */}
                                        <div
                                            className="flex-1 p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                            <div className="flex items-start gap-4 w-full">
                                                {/* Mobile Score Badge */}
                                                <div
                                                    className={`sm:hidden shrink-0 flex flex-col items-center justify-center w-12 h-12 rounded-xl border ${isTopMatch ? 'bg-match-high/10 border-match-high/20 text-match-high' : 'bg-grey-100 border-grey-200 text-grey-dark'}`}>
                                                    <span
                                                        className="font-black leading-none">{applicant.matchScore}%</span>
                                                </div>

                                                <div
                                                    className="w-12 h-12 rounded-full bg-brand-blue/10 text-brand-blue border border-brand-blue/20 flex items-center justify-center font-bold text-lg shadow-inner shrink-0 sm:flex hidden">
                                                    {applicant.name.charAt(0)}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="text-base font-bold text-grey-dark truncate group-hover:text-brand-blue transition-colors">
                                                            {applicant.name}
                                                        </h3>
                                                        <Badge variant="outline"
                                                               className={`text-[10px] font-bold px-2 py-0 border ${getStatusColor(applicant.status)}`}>
                                                            {applicant.status}
                                                        </Badge>
                                                    </div>

                                                    <div
                                                        className="flex flex-wrap items-center gap-3 text-xs text-grey-muted font-medium mb-3">
                                                        <span className="truncate max-w-[200px]">{applicant.role}</span>
                                                        <span className="flex items-center gap-1"><Mail
                                                            className="w-3 h-3"/> {applicant.email}</span>
                                                        <span className="flex items-center gap-1"><Clock
                                                            className="w-3 h-3"/> {applicant.appliedDate}</span>
                                                    </div>

                                                    {/* Skills Tags */}
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {applicant.skills.slice(0, 4).map((skill, idx) => (
                                                            <span key={idx}
                                                                  className="bg-[#f0edef] text-grey-dark text-[10px] font-semibold px-2 py-0.5 rounded-md">
                                                                {skill}
                                                            </span>
                                                        ))}
                                                        {applicant.skills.length > 4 && (
                                                            <span
                                                                className="bg-brand-blue/5 text-brand-blue text-[10px] font-semibold px-2 py-0.5 rounded-md">
                                                                +{applicant.skills.length - 4}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action Button */}
                                            <div className="shrink-0 w-full sm:w-auto mt-4 sm:mt-0">
                                                <Button
                                                    className="w-full sm:w-auto bg-white border border-[#c6c6cd] hover:border-brand-blue text-grey-dark hover:text-brand-blue rounded-xl h-10 px-4 group-hover:shadow-md transition-all"
                                                >
                                                    {t('recruiter.reviewProfile', 'Преглед на профила')} <ChevronRight
                                                    className="w-4 h-4 ml-1"/>
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })
                )}
            </div>
        </div>
    );
}
