import {useTranslation} from 'react-i18next';
import {Award, ChevronRight, Clock, Filter, MoreHorizontal} from 'lucide-react';
import {Applicant} from '@/lib/types';
import {Card, CardContent} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";

interface RecruiterRankingProps {
    applicants: Applicant[];
    setCurrentTab: (tab: string) => void;
    setSelectedApplicantId: (id: string | null) => void;
}

export default function RecruiterRanking({
                                             applicants,
                                             setCurrentTab,
                                             setSelectedApplicantId
                                         }: RecruiterRankingProps) {
    const {t} = useTranslation();

    // Group applicants by their current status.
    // 'status' is the strict data value, 'titleKey' is what we show the user.
    const columns: Array<{ status: "Ново" | "Преглед" | "Интервю", titleKey: string, color: string }> = [
        {status: "Ново", titleKey: "recruiterRanking.colNew", color: "bg-brand-blue/10 text-brand-blue"},
        {status: "Преглед", titleKey: "recruiterRanking.colReview", color: "bg-amber-500/10 text-amber-600"},
        {
            status: "Интервю",
            titleKey: "recruiterRanking.colInterview",
            color: "bg-professional-emerald/10 text-professional-emerald"
        }
    ];

    const handleInspect = (id: string) => {
        setSelectedApplicantId(id);
        setCurrentTab('recruiter_applicant_detail');
    };

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            {/* Header section */}
            <header
                className="pb-6 border-b border-[#c6c6cd]/30 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-display font-black text-grey-dark leading-tight">
                        {t('recruiterRanking.title')}
                    </h1>
                    <p className="text-sm text-grey-muted mt-1.5">
                        {t('recruiterRanking.subtitle')}
                    </p>
                </div>
                <Button variant="outline"
                        className="bg-white/50 border-[#c6c6cd]/50 rounded-xl gap-2 font-bold text-grey-dark shadow-sm h-10">
                    <Filter className="w-4 h-4"/>
                    {t('recruiterRanking.filterView')}
                </Button>
            </header>

            {/* Kanban Board Layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                {columns.map((column) => {
                    const columnApplicants = applicants.filter(app => app.status === column.status)
                        .sort((a, b) => b.matchScore - a.matchScore);

                    return (
                        <div key={column.status} className="space-y-4">
                            {/* Column Header */}
                            <div className="flex items-center justify-between pb-2">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-sm font-bold text-grey-dark uppercase tracking-wider">
                                        {t(column.titleKey)}
                                    </h3>
                                    <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${column.color}`}>
                    {columnApplicants.length}
                  </span>
                                </div>
                                <Button variant="ghost" size="icon"
                                        className="h-8 w-8 text-grey-muted hover:text-grey-dark">
                                    <MoreHorizontal className="w-4 h-4"/>
                                </Button>
                            </div>

                            {/* Column Cards Container */}
                            <div
                                className="flex flex-col gap-4 min-h-[500px] p-2 -mx-2 rounded-2xl bg-[#f0edef]/30 border border-dashed border-[#c6c6cd]/30">
                                {columnApplicants.length === 0 ? (
                                    <div className="text-center py-8 text-xs font-semibold text-grey-muted">
                                        {t('recruiterRanking.noCandidates')}
                                    </div>
                                ) : (
                                    columnApplicants.map((app) => (
                                        <Card
                                            key={app.id}
                                            onClick={() => handleInspect(app.id)}
                                            className={`relative overflow-hidden cursor-pointer hover:shadow-md transition-all duration-200 border border-[#c6c6cd]/50 bg-white/70 backdrop-blur-sm group`}
                                        >
                                            {/* Top colored accent line */}
                                            <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${
                                                column.status === 'Ново' ? 'from-brand-blue to-brand-blue-light' :
                                                    column.status === 'Преглед' ? 'from-amber-400 to-amber-500' :
                                                        'from-professional-emerald to-green-400'
                                            }`}></div>

                                            <CardContent className="p-4 pt-5 space-y-4">
                                                {/* Avatar & Match Score */}
                                                <div className="flex justify-between items-start">
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className="w-10 h-10 rounded-xl bg-brand-blue/5 border border-brand-blue/10 flex items-center justify-center font-bold text-brand-blue shadow-inner">
                                                            {app.name.split(' ').map(n => n[0]).join('')}
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-grey-dark text-sm group-hover:text-brand-blue transition-colors leading-tight">
                                                                {app.name}
                                                            </h4>
                                                            <p className="text-[10px] text-grey-muted font-semibold uppercase tracking-wider mt-0.5">
                                                                {app.role}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* AI Match Badge */}
                                                <div
                                                    className="flex items-center gap-2 bg-[#fcf8fa] border border-[#f0edef] rounded-lg p-2">
                                                    <Award className="w-4 h-4 text-match-high"/>
                                                    <div className="flex-1">
                                                        <div
                                                            className="flex justify-between text-[10px] font-bold text-grey-dark mb-1">
                                                            <span>{t('recruiterRanking.aiMatch')}</span>
                                                            <span className="text-match-high">{app.matchScore}%</span>
                                                        </div>
                                                        <div
                                                            className="h-1.5 w-full bg-[#e5e5e5] rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-match-high rounded-full"
                                                                style={{width: `${app.matchScore}%`}}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Skills */}
                                                <div className="flex flex-wrap gap-1.5">
                                                    {app.skills.slice(0, 3).map((skill, i) => (
                                                        <Badge key={i} variant="secondary"
                                                               className="bg-white border border-[#c6c6cd]/40 text-grey-dark text-[9px] px-1.5 py-0 font-mono">
                                                            {skill}
                                                        </Badge>
                                                    ))}
                                                    {app.skills.length > 3 && (
                                                        <span
                                                            className="text-[10px] text-grey-muted font-bold flex items-center pl-1">
                              +{app.skills.length - 3}
                            </span>
                                                    )}
                                                </div>

                                                {/* Footer (Date & Action) */}
                                                <div
                                                    className="pt-3 border-t border-[#f0edef] flex items-center justify-between">
                                                    <div
                                                        className="flex items-center gap-1.5 text-[10px] font-bold text-grey-muted">
                                                        <Clock className="w-3.5 h-3.5"/>
                                                        {app.appliedDate}
                                                    </div>
                                                    <Button variant="ghost" size="sm"
                                                            className="h-6 px-2 text-[10px] text-brand-blue hover:bg-brand-blue hover:text-white rounded-md">
                                                        {t('recruiterRanking.details')} <ChevronRight
                                                        className="w-3 h-3 ml-1"/>
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}