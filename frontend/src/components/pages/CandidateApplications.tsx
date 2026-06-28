import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { History, Loader2, Briefcase, GraduationCap, Building2, Calendar } from 'lucide-react';
import { Profile } from '@/lib/types';
import { CandidateMode } from '@/lib/mode';
import { fetchCandidateApplications, mapApplicationActivity } from '@/lib/applications';

interface CandidateApplicationsProps {
    profile: Profile;
    candidateMode: CandidateMode;
}

export default function CandidateApplications({ profile, candidateMode }: CandidateApplicationsProps) {
    const { t } = useTranslation();
    const [applications, setApplications] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!profile?.id) return;

        const loadApplications = async () => {
            setIsLoading(true);
            try {
                const appsData = await fetchCandidateApplications(profile.id);
                const mappedApps = appsData.map(mapApplicationActivity);
                
                // Filter based on candidateMode. Assuming we can infer from opportunity title/company or mode if it was returned by backend.
                // If backend doesn't return mode, we just show all. For now, let's just show all as they belong to the candidate,
                // but we can try to filter if mode is available in the DTO.
                // Assuming we want to show all applications, but visual styling can adapt to mode.
                
                setApplications(mappedApps);
            } catch (error) {
                console.error("Грешка при зареждане на кандидатствания:", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadApplications();
    }, [profile?.id, candidateMode]);

    return (
        <div className="space-y-6 animate-fade-in max-w-6xl mx-auto pb-12 relative">
            <div className="absolute top-0 right-[-10%] w-96 h-96 bg-brand-blue/10 rounded-full blur-[100px] -z-10"></div>

            <div className="mb-8">
                <h1 className="text-3xl font-display font-extrabold text-grey-dark tracking-tight">
                    {t('applications.title', 'Моите Кандидатствания')}
                </h1>
                <p className="text-grey-muted mt-2">
                    Проследете статуса на вашите кандидатури за {candidateMode === 'professional' ? 'работа' : 'университет'}.
                </p>
            </div>

            <Card className="rounded-3xl border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-full h-1 ${candidateMode === 'professional' ? 'bg-gradient-to-r from-brand-blue to-professional-emerald' : 'bg-gradient-to-r from-academic-purple to-purple-400'}`}></div>
                <CardHeader className="pb-4 border-b border-[#f0edef]/80">
                    <CardTitle className="text-xl font-display font-bold text-grey-dark flex items-center gap-2.5">
                        {candidateMode === 'professional' ? <Briefcase className="w-6 h-6 text-brand-blue"/> : <GraduationCap className="w-6 h-6 text-academic-purple"/>}
                        {t('applications.history', 'История на кандидатстванията')}
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    {isLoading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="animate-spin text-brand-blue w-8 h-8"/>
                        </div>
                    ) : applications.length === 0 ? (
                        <div className="text-center py-16 flex flex-col items-center justify-center">
                            <div className="w-20 h-20 bg-grey-muted/10 rounded-full flex items-center justify-center mb-4">
                                <History className="w-10 h-10 text-grey-muted opacity-50"/>
                            </div>
                            <h3 className="text-lg font-bold text-grey-dark dark:text-white mb-2">Нямате активни кандидатствания</h3>
                            <p className="text-grey-muted dark:text-slate-400 text-sm max-w-sm">Все още не сте подали кандидатури за наличните възможности. Разгледайте таблото за предложения!</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {applications.map((app, index) => (
                                <div key={app.id || index} className="flex flex-col md:flex-row items-start md:items-center justify-between p-5 rounded-2xl bg-[#fcf8fa]/40 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 hover:shadow-md transition-all duration-300 border border-[#c6c6cd]/30 dark:border-white/10 group">
                                    <div className="flex items-start gap-4 mb-4 md:mb-0">
                                        <div className={`w-14 h-14 rounded-xl shadow-sm flex items-center justify-center text-white font-bold text-xl flex-shrink-0 group-hover:scale-110 transition-transform duration-300 ${app.logoColor || (candidateMode === 'professional' ? 'bg-brand-blue' : 'bg-academic-purple')}`}>
                                            {app.company.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-grey-dark group-hover:text-brand-blue transition-colors">
                                                {app.title}
                                            </h3>
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-1 text-sm text-grey-muted font-medium">
                                                <span className="flex items-center gap-1"><Building2 className="w-4 h-4"/> {app.company}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto mt-4 md:mt-0">
                                        <Badge variant="outline" className="gap-1.5 text-xs font-semibold px-4 py-1.5 bg-white text-grey-dark rounded-full shadow-sm md:mb-2 whitespace-nowrap">
                                            <span className={`w-2.5 h-2.5 rounded-full ${app.status === 'Приет' ? 'bg-professional-emerald' : app.status === 'Отказан' ? 'bg-red-500' : 'bg-brand-blue animate-pulse'}`}></span>
                                            {app.status}
                                        </Badge>
                                        <div className="flex items-center gap-1.5 text-xs text-grey-muted bg-white px-3 py-1.5 rounded-lg border border-[#f0edef] shadow-sm">
                                            <Calendar className="w-3.5 h-3.5"/>
                                            <span>Кандидатствано на: {app.date}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
