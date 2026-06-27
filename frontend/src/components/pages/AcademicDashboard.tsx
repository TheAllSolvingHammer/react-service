import {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {
    AlertCircle,
    ArrowRight,
    BookOpen,
    CheckCircle2,
    Clock,
    GraduationCap,
    Library,
    Loader2,
    Sparkles
} from 'lucide-react';
import {Card, CardContent} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {fetchMyApplications, updateApplicationStatus} from "@/lib/opportunities.ts";

//за тестване е само
// @ts-ignore
const mockApplications = [
    {id: '1', university: 'Технически Университет', faculty: 'СИТ', status: 'ACCEPTED', date: '2026-06-20'},
    {id: '2', university: 'Софийски Университет', faculty: 'ФМИ', status: 'REVIEW', date: '2026-06-22'},
    {id: '3', university: 'УНСС', faculty: 'Бизнес Информатика', status: 'NEW', date: '2026-06-24'},
];

const MAX_APPLICATIONS = 5;

export default function AcademicDashboard({ profile }: { profile: any }) {
    const { t } = useTranslation();

    const [applications, setApplications] = useState<any[]>([]);
    const [isEnrolling, setIsEnrolling] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    //зареждаме тук
    useEffect(() => {
        if (profile?.id) {
            setIsLoading(true);
            fetchMyApplications(profile.id)
                .then(response => {
                    if (Array.isArray(response)) {
                        setApplications(response);
                    } else if (response && Array.isArray(response.content)) {
                        setApplications(response.content);
                    } else if (response && Array.isArray(response.data)) {
                        setApplications(response.data);
                    } else {
                        setApplications([]);
                    }
                    setIsLoading(false);
                })
                .catch(err => {
                    console.error("Грешка при зареждане на кандидатурите:", err);
                    setApplications([]);
                    setIsLoading(false);
                });
        }
    }, [profile?.id]);

    const safeApplications = Array.isArray(applications) ? applications : [];

    const activeCount = safeApplications.filter(a => a.status !== 'ARCHIVED' && a.status !== 'REJECTED').length;
    const progressPercentage = (activeCount / MAX_APPLICATIONS) * 100;

    const handleEnroll = async (appId: string) => {
        setIsEnrolling(appId);

        try {
            await updateApplicationStatus(appId, 'ENROLLED');
            setApplications(apps => apps.map(app => {
                if (app.id === appId) {
                    return { ...app, status: 'ENROLLED' };
                }
                if (app.status !== 'REJECTED' && app.status !== 'WITHDRAWN' && app.status !== 'ARCHIVED') {
                    return { ...app, status: 'ARCHIVED' };
                }
                return app;
            }));
        } catch (error) {
            console.error("Грешка при записване:", error);
        } finally {
            setIsEnrolling(null);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
            </div>
        );
    }

    const getStatusUI = (status: string) => {
        switch (status) {
            case 'ENROLLED':
                return {
                    color: 'bg-green-100 text-green-700 border-green-200',
                    icon: CheckCircle2,
                    text: t('academic.status.enrolled', 'Записан')
                };
            case 'ACCEPTED':
                return {
                    color: 'bg-purple-100 text-purple-700 border-purple-200',
                    icon: Sparkles,
                    text: t('academic.status.accepted', 'Приет! Очаква решение')
                };
            case 'REVIEW':
                return {
                    color: 'bg-blue-100 text-blue-700 border-blue-200',
                    icon: Clock,
                    text: t('academic.status.review', 'В процес на разглеждане')
                };
            case 'NEW':
                return {
                    color: 'bg-gray-100 text-gray-700 border-gray-200',
                    icon: BookOpen,
                    text: t('academic.status.new', 'Изпратена')
                };
            case 'ARCHIVED':
                return {
                    color: 'bg-slate-50 text-slate-400 border-slate-200',
                    icon: Library,
                    text: t('academic.status.archived', 'Архивирана')
                };
            default:
                return {color: 'bg-gray-100 text-gray-700', icon: Clock, text: status};
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-12">

            {/* Header Section */}
            <div
                className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-purple-900 to-indigo-900 rounded-3xl p-8 text-white shadow-xl">
                <div>
                    <h1 className="text-3xl font-display font-black mb-2 flex items-center gap-3">
                        <GraduationCap className="w-8 h-8 text-purple-300"/>
                        {t('academic.campaignTitle', 'Кандидатстудентска кампания')}
                    </h1>
                    <p className="text-purple-200">{t('academic.campaignSubtitle', 'Управлявай своите кандидатури и избери най-доброто бъдеще.')}</p>
                </div>

                {/* Quota Tracker */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 min-w-[250px] border border-white/20">
                    <div className="flex justify-between items-center mb-2">
                        <span
                            className="text-sm font-bold uppercase tracking-wider text-purple-200">{t('academic.applicationLimit', 'Лимит кандидатури')}</span>
                        <span className="text-lg font-black">{activeCount} / {MAX_APPLICATIONS}</span>
                    </div>
                    <div className="w-full h-2 bg-black/20 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-500 ${activeCount === MAX_APPLICATIONS ? 'bg-red-400' : 'bg-purple-400'}`}
                            style={{width: `${progressPercentage}%`}}
                        ></div>
                    </div>
                    {activeCount === MAX_APPLICATIONS && (
                        <p className="text-xs text-red-300 mt-2 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3"/> {t('academic.maxReached', 'Достигнат максимален брой')}
                        </p>
                    )}
                </div>
            </div>

            {/* Applications List */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 px-2">
                    <Library
                        className="w-5 h-5 text-purple-600"/> {t('academic.yourApplications', 'Твоите кандидатури')}
                </h2>

                {safeApplications.map((app) => {
                    const statusUI = getStatusUI(app.status);
                    const StatusIcon = statusUI.icon;
                    const isAccepted = app.status === 'ACCEPTED';
                    const isEnrolled = app.status === 'ENROLLED';

                    return (
                        <Card key={app.id}
                              className={`rounded-2xl transition-all duration-300 ${isAccepted ? 'border-purple-300 shadow-purple-100 shadow-lg bg-purple-50/30' : 'border-gray-200 hover:border-purple-200 hover:shadow-md'} ${app.status === 'ARCHIVED' ? 'opacity-60 grayscale' : ''}`}>
                            <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">

                                <div className="flex items-center gap-6 w-full md:w-auto">
                                    <div
                                        className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${isEnrolled ? 'bg-green-100 text-green-600' : 'bg-purple-100 text-purple-600'}`}>
                                        <GraduationCap className="w-7 h-7"/>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">{app.university}</h3>
                                        <p className="text-sm text-gray-500 font-medium">{app.faculty}</p>
                                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                                            <span className="flex items-center gap-1"><Clock
                                                className="w-3 h-3"/> {app.date}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                                    <Badge variant="outline"
                                           className={`px-3 py-1.5 rounded-lg border text-sm font-bold ${statusUI.color}`}>
                                        <StatusIcon className="w-4 h-4 mr-2"/> {statusUI.text}
                                    </Badge>

                                    {isAccepted && (
                                        <Button
                                            onClick={() => handleEnroll(app.id)}
                                            disabled={isEnrolling !== null}
                                            className="w-full md:w-auto bg-purple-600 hover:bg-purple-700 text-white shadow-md rounded-xl h-10 transition-transform hover:scale-105"
                                        >
                                            {isEnrolling === app.id ? (
                                                <><Loader2
                                                    className="w-4 h-4 mr-2 animate-spin"/> {t('academic.processing', 'Обработка...')}</>
                                            ) : (
                                                <>{t('academic.enrollNow', 'Запиши се сега')} <ArrowRight
                                                    className="w-4 h-4 ml-2"/></>
                                            )}
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}