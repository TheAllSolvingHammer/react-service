import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {
    ArrowLeft,
    BrainCircuit,
    Briefcase,
    CheckCircle2,
    Clock,
    ExternalLink,
    FileText,
    Mail,
    MapPin,
    UserCheck,
    XCircle
} from 'lucide-react';
import {Applicant} from '@/lib/types';
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";

interface RecruiterCandidateDetailProps {
    applicant: Applicant;
    onBack: () => void;
    onUpdateStatus: (id: string, newStatus: Applicant['status']) => void;
}

const pipelineSteps: Applicant['status'][] = ['Ново', 'Преглед', 'Интервю', 'Приет'];

export default function RecruiterCandidateDetail({applicant, onBack, onUpdateStatus}: RecruiterCandidateDetailProps) {
    const {t} = useTranslation();
    const [isUpdating, setIsUpdating] = useState(false);

    const isTopMatch = applicant.matchScore >= 80;

    const handleStatusChange = (newStatus: Applicant['status']) => {
        setIsUpdating(true);
        // Симулираме мрежово забавяне за по-добро UX усещане
        setTimeout(() => {
            onUpdateStatus(applicant.id, newStatus);
            setIsUpdating(false);
        }, 500);
    };

    // Определяме докъде е стигнал кандидата в пайплайна
    const currentStepIndex = pipelineSteps.indexOf(applicant.status);
    const isRejected = applicant.status === 'Отказан';

    return (
        <div className="space-y-6 animate-fade-in max-w-5xl mx-auto pb-12">

            {/* Header / Back Button */}
            <div className="flex items-center justify-between border-b border-[#c6c6cd]/30 pb-4">
                <Button
                    variant="ghost"
                    onClick={onBack}
                    className="text-grey-muted hover:text-brand-blue gap-2 -ml-4"
                >
                    <ArrowLeft className="w-4 h-4"/> {t('recruiter.backToRanking', 'Назад към списъка')}
                </Button>

                <div className="flex items-center gap-2">
                    <span
                        className="text-xs text-grey-muted font-bold uppercase tracking-wider">{t('recruiter.appliedOn', 'Кандидатствал на')}:</span>
                    <Badge variant="outline" className="bg-white text-grey-dark font-mono">
                        <Clock className="w-3 h-3 mr-1"/> {applicant.appliedDate}
                    </Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-2">

                {/* ЛЯВА КОЛОНА: Профил и Статус */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Карта на Кандидата */}
                    <Card
                        className={`rounded-3xl border-0 shadow-lg overflow-hidden relative ${isTopMatch ? 'bg-gradient-to-b from-match-high/5 to-white' : 'bg-white'}`}>
                        <div
                            className={`absolute top-0 left-0 w-full h-2 ${isTopMatch ? 'bg-match-high' : 'bg-brand-blue'}`}></div>

                        <CardContent className="pt-8 flex flex-col items-center text-center px-6 pb-6">
                            <div
                                className={`w-24 h-24 rounded-full flex items-center justify-center font-display font-black text-3xl shadow-inner mb-4 border-4 ${
                                    isTopMatch ? 'bg-match-high/10 text-match-high border-white' : 'bg-brand-blue/10 text-brand-blue border-white'
                                }`}>
                                {applicant.name.charAt(0)}
                            </div>

                            <h2 className="text-2xl font-bold text-grey-dark leading-tight mb-1">{applicant.name}</h2>
                            <p className="text-brand-blue font-semibold text-sm mb-4">{applicant.role}</p>

                            <div
                                className="w-full space-y-3 mt-2 text-sm text-grey-muted text-left bg-[#fcf8fa]/50 p-4 rounded-2xl border border-[#c6c6cd]/30">
                                <div className="flex items-center gap-3">
                                    <Mail className="w-4 h-4 text-brand-blue"/>
                                    <span className="truncate">{applicant.email}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <MapPin className="w-4 h-4 text-brand-blue"/>
                                    <span>Варна, България</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Briefcase className="w-4 h-4 text-brand-blue"/>
                                    <span>{applicant.candidateMode === 'professional' ? 'Професионалист' : 'Студент'}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Управление на Статуса */}
                    <Card className="rounded-3xl border border-[#c6c6cd]/50 shadow-sm bg-white overflow-hidden">
                        <CardHeader className="bg-[#f0edef]/30 border-b border-[#f0edef] pb-4">
                            <CardTitle className="text-base font-bold text-grey-dark flex items-center gap-2">
                                <UserCheck className="w-5 h-5 text-brand-blue"/>
                                {t('recruiter.statusWorkflow', 'Процес на наемане')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">

                            {/* Pipeline Visualizer */}
                            <div className="relative">
                                {isRejected ? (
                                    <div
                                        className="bg-red-50 border border-red-200 rounded-xl p-4 flex flex-col items-center justify-center text-red-700 text-center">
                                        <XCircle className="w-8 h-8 mb-2"/>
                                        <p className="font-bold">{t('recruiter.statusRejected', 'Кандидатурата е отхвърлена')}</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-4">
                                        {pipelineSteps.map((step, index) => {
                                            const isCompleted = currentStepIndex >= index;
                                            const isCurrent = currentStepIndex === index;

                                            return (
                                                <div key={step} className="flex items-center gap-4 relative">
                                                    {/* Линия, свързваща стъпките */}
                                                    {index !== pipelineSteps.length - 1 && (
                                                        <div
                                                            className={`absolute top-8 left-4 w-0.5 h-6 -ml-px ${currentStepIndex > index ? 'bg-professional-emerald' : 'bg-[#c6c6cd]/40'}`}></div>
                                                    )}

                                                    <div
                                                        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 transition-colors ${
                                                            isCompleted ? 'bg-professional-emerald text-white shadow-sm' : 'bg-[#f0edef] text-[#c6c6cd]'
                                                        }`}>
                                                        {isCompleted ? <CheckCircle2 className="w-5 h-5"/> :
                                                            <span className="text-xs font-bold">{index + 1}</span>}
                                                    </div>

                                                    <div className="flex-1">
                                                        <Button
                                                            variant={isCurrent ? "default" : "outline"}
                                                            onClick={() => handleStatusChange(step as any)}
                                                            disabled={isUpdating || isCurrent}
                                                            className={`w-full justify-start h-10 ${
                                                                isCurrent
                                                                    ? 'bg-brand-blue hover:bg-brand-blue text-white shadow-md'
                                                                    : 'bg-white border-[#c6c6cd]/50 text-grey-dark hover:border-brand-blue hover:text-brand-blue'
                                                            }`}
                                                        >
                                                            {step}
                                                        </Button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Отхвърляне (ако не е вече отхвърлен и не е приет) */}
                            {!isRejected && currentStepIndex < pipelineSteps.length - 1 && (
                                <div className="pt-4 border-t border-[#f0edef]">
                                    <Button
                                        variant="ghost"
                                        onClick={() => handleStatusChange('Отказан')}
                                        disabled={isUpdating}
                                        className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                        <XCircle className="w-4 h-4 mr-2"/> Отхвърли кандидата
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* ДЯСНА КОЛОНА: AI Анализ и CV */}
                <div className="lg:col-span-8 space-y-6">

                    {/* AI Score Card */}
                    <Card
                        className="rounded-3xl border-slate-800 bg-slate-900 text-white shadow-xl overflow-hidden relative">
                        <div
                            className="absolute top-0 right-0 w-64 h-64 bg-match-high/10 blur-[80px] -z-1 pointer-events-none"></div>
                        <CardContent
                            className="p-8 flex flex-col sm:flex-row items-center sm:items-start gap-8 relative z-10">

                            <div className="flex flex-col items-center justify-center text-center shrink-0">
                                <div className="relative">
                                    <svg className="w-32 h-32 transform -rotate-90">
                                        <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8"
                                                fill="transparent" className="text-slate-700"/>
                                        <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8"
                                                fill="transparent"
                                                strokeDasharray={351}
                                                strokeDashoffset={351 - (351 * applicant.matchScore) / 100}
                                                className={isTopMatch ? 'text-match-high' : 'text-brand-blue'}
                                                strokeLinecap="round"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-4xl font-display font-black">{applicant.matchScore}</span>
                                        <span
                                            className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Match</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 space-y-4">
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    <BrainCircuit className={isTopMatch ? 'text-match-high' : 'text-brand-blue'}/>
                                    {t('recruiter.aiAnalysis', 'AI Анализ на съвпадението')}
                                </h3>

                                <p className="text-sm text-slate-300 leading-relaxed bg-slate-800/50 p-4 rounded-2xl border border-slate-700">
                                    {isTopMatch
                                        ? `Този кандидат е изключително подходящ. Притежава ${applicant.skills.length} от ключовите умения, които търсите, и опитът му съвпада с изискванията на позицията.`
                                        : `Кандидатът покрива базовите изисквания, но липсват някои специфични технически умения. Препоръчваме преглед на CV-то за повече контекст.`
                                    }
                                </p>

                                <div>
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">{t('recruiter.matchedSkills', 'Съвпадащи умения')}</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {applicant.skills.map((skill, i) => (
                                            <Badge key={i}
                                                   className="bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-600 font-medium">
                                                <CheckCircle2 className="w-3 h-3 mr-1.5 text-professional-emerald"/>
                                                {skill}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Документи (CV) */}
                    <Card className="rounded-3xl border border-[#c6c6cd]/50 shadow-sm bg-white/60 backdrop-blur-md">
                        <CardHeader className="border-b border-[#f0edef] pb-4">
                            <CardTitle className="text-lg font-bold text-grey-dark flex items-center gap-2">
                                <FileText className="w-5 h-5 text-brand-blue"/>
                                {t('recruiter.applicationDocuments', 'Прикачени документи')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Button
                                    className="flex-1 bg-[#fcf8fa] hover:bg-[#f0edef] border border-[#c6c6cd]/40 text-grey-dark rounded-xl h-14 justify-start px-6 shadow-sm">
                                    <div className="flex items-center gap-3 w-full">
                                        <div
                                            className="w-8 h-8 bg-brand-blue/10 text-brand-blue rounded-lg flex items-center justify-center shrink-0">
                                            <FileText className="w-4 h-4"/>
                                        </div>
                                        <div className="flex-1 text-left">
                                            <div className="text-sm font-bold">Автобиография (CV)</div>
                                            <div className="text-xs text-grey-muted">PDF • 1.2 MB</div>
                                        </div>
                                        <ExternalLink className="w-4 h-4 text-grey-muted"/>
                                    </div>
                                </Button>

                                <Button
                                    className="flex-1 bg-[#fcf8fa] hover:bg-[#f0edef] border border-[#c6c6cd]/40 text-grey-dark rounded-xl h-14 justify-start px-6 shadow-sm">
                                    <div className="flex items-center gap-3 w-full">
                                        <div
                                            className="w-8 h-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center shrink-0">
                                            <Mail className="w-4 h-4"/>
                                        </div>
                                        <div className="flex-1 text-left">
                                            <div className="text-sm font-bold">Мотивационно писмо</div>
                                            <div className="text-xs text-grey-muted">Текст</div>
                                        </div>
                                        <ExternalLink className="w-4 h-4 text-grey-muted"/>
                                    </div>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                </div>
            </div>
        </div>
    );
}
