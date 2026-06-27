import {useTranslation} from 'react-i18next';
import {
    ArrowLeft,
    Award,
    Briefcase,
    CheckCircle,
    Clock,
    Download,
    GraduationCap,
    Mail,
    MapPin,
    PlayCircle,
    Shield
} from 'lucide-react';
import {Applicant} from '@/lib/types';
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";

interface RecruiterCandidateDetailProps {
    applicant: Applicant;
    onBack: () => void;
    onUpdateStatus: (id: string, status: "Ново" | "Интервю" | "Преглед") => void;
}

export default function RecruiterCandidateDetail({
                                                     applicant,
                                                     onBack,
                                                     onUpdateStatus
                                                 }: RecruiterCandidateDetailProps) {
    const {t} = useTranslation();

    return (
        <div className="space-y-6 animate-fade-in pb-12">
            {/* Top Navigation Bar */}
            <div
                className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 pb-4 border-b border-[#c6c6cd]/30">
                <Button
                    variant="ghost"
                    onClick={onBack}
                    className="text-grey-dark hover:bg-white/50 w-fit gap-2 rounded-xl h-10 font-bold"
                >
                    <ArrowLeft className="w-4 h-4"/>
                    {t('recruiterDetail.backToList')}
                </Button>

                <div className="flex items-center gap-3">
                    <Button variant="outline"
                            className="border-[#c6c6cd]/50 bg-white/50 hover:bg-white rounded-xl gap-2 h-10 text-grey-dark font-bold shadow-xs">
                        <Mail className="w-4 h-4"/>
                        {t('recruiterDetail.contact')}
                    </Button>
                    <Button
                        className="bg-[#1b1b1d] hover:bg-black text-white rounded-xl gap-2 h-10 font-bold shadow-sm">
                        <Download className="w-4 h-4"/>
                        {t('recruiterDetail.exportCv')}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* LEFT COLUMN: Profile Base Info & Actions */}
                <div className="lg:col-span-4 space-y-6">
                    <Card
                        className="rounded-3xl border-[#c6c6cd] shadow-xs bg-white/60 backdrop-blur-md overflow-hidden relative">
                        {/* Background accent based on type */}
                        <div
                            className={`absolute top-0 w-full h-24 ${applicant.candidateMode === 'professional' ? 'bg-professional-emerald/10' : 'bg-academic-purple/10'}`}></div>

                        <CardContent className="p-6 pt-12 relative">
                            <div className="flex flex-col items-center text-center">
                                <div
                                    className="w-24 h-24 rounded-full border-4 border-white bg-white shadow-md flex items-center justify-center font-display font-black text-3xl text-brand-blue mb-4 z-10 relative">
                                    <div className="absolute inset-0 rounded-full bg-brand-blue/5"></div>
                                    {applicant.name.split(' ').map(n => n[0]).join('')}
                                </div>

                                <h2 className="text-2xl font-display font-black text-grey-dark leading-tight">{applicant.name}</h2>
                                <p className="text-brand-blue font-bold mt-1">{applicant.role}</p>

                                <Badge variant="outline"
                                       className={`mt-3 gap-1.5 border-transparent px-3 py-1 text-xs font-bold ${
                                           applicant.candidateMode === 'professional'
                                               ? 'bg-professional-emerald/10 text-professional-emerald'
                                               : 'bg-academic-purple/10 text-academic-purple'
                                       }`}>
                                    {applicant.candidateMode === 'professional' ? <Briefcase className="w-3.5 h-3.5"/> :
                                        <GraduationCap className="w-3.5 h-3.5"/>}
                                    {applicant.candidateMode === 'professional' ? t('recruiterDetail.proProfile') : t('recruiterDetail.academicProfile')}
                                </Badge>
                            </div>

                            <div className="mt-8 space-y-4 pt-6 border-t border-[#f0edef]">
                                <div className="flex items-center gap-3 text-sm text-grey-dark font-medium">
                                    <Mail className="w-4.5 h-4.5 text-grey-muted"/>
                                    {applicant.email}
                                </div>
                                <div className="flex items-center gap-3 text-sm text-grey-dark font-medium">
                                    <MapPin className="w-4.5 h-4.5 text-grey-muted"/>
                                    {t('recruiterDetail.location')}
                                </div>
                                <div className="flex items-center gap-3 text-sm text-grey-dark font-medium">
                                    <Clock className="w-4.5 h-4.5 text-grey-muted"/>
                                    {t('recruiterDetail.appliedOn')} {applicant.appliedDate}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Workflow Status Controller */}
                    <Card className="rounded-3xl border-[#c6c6cd] shadow-xs bg-[#f0edef]/40 backdrop-blur-md">
                        <CardHeader className="pb-4 border-b border-[#c6c6cd]/20">
                            <CardTitle className="text-sm font-bold text-grey-dark uppercase tracking-wider">
                                {t('recruiterDetail.appStatus')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-5 space-y-3">
                            <Button
                                onClick={() => onUpdateStatus(applicant.id, "Ново")}
                                variant={applicant.status === "Ново" ? "default" : "outline"}
                                className={`w-full justify-start gap-3 h-12 rounded-xl text-sm font-bold transition-all ${
                                    applicant.status === "Ново"
                                        ? "bg-brand-blue hover:bg-brand-blue-dark text-white shadow-md border-transparent"
                                        : "bg-white hover:bg-brand-blue/5 border-[#c6c6cd]/50 text-grey-dark"
                                }`}
                            >
                                <Clock
                                    className={`w-5 h-5 ${applicant.status === "Ново" ? "text-white" : "text-brand-blue"}`}/>
                                {t('recruiterDetail.statusNew')}
                            </Button>

                            <Button
                                onClick={() => onUpdateStatus(applicant.id, "Преглед")}
                                variant={applicant.status === "Преглед" ? "default" : "outline"}
                                className={`w-full justify-start gap-3 h-12 rounded-xl text-sm font-bold transition-all ${
                                    applicant.status === "Преглед"
                                        ? "bg-amber-500 hover:bg-amber-600 text-white shadow-md border-transparent"
                                        : "bg-white hover:bg-amber-500/5 border-[#c6c6cd]/50 text-grey-dark"
                                }`}
                            >
                                <PlayCircle
                                    className={`w-5 h-5 ${applicant.status === "Преглед" ? "text-white" : "text-amber-500"}`}/>
                                {t('recruiterDetail.statusReview')}
                            </Button>

                            <Button
                                onClick={() => onUpdateStatus(applicant.id, "Интервю")}
                                variant={applicant.status === "Интервю" ? "default" : "outline"}
                                className={`w-full justify-start gap-3 h-12 rounded-xl text-sm font-bold transition-all ${
                                    applicant.status === "Интервю"
                                        ? "bg-professional-emerald hover:bg-green-600 text-white shadow-md border-transparent"
                                        : "bg-white hover:bg-professional-emerald/5 border-[#c6c6cd]/50 text-grey-dark"
                                }`}
                            >
                                <CheckCircle
                                    className={`w-5 h-5 ${applicant.status === "Интервю" ? "text-white" : "text-professional-emerald"}`}/>
                                {t('recruiterDetail.statusInterview')}
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* RIGHT COLUMN: AI Match & Deep Data */}
                <div className="lg:col-span-8 space-y-6">

                    {/* Main AI Verdict Header */}
                    <Card className="rounded-3xl border-brand-blue/20 bg-brand-blue/5 shadow-sm">
                        <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-6">
                            <div className="shrink-0 relative">
                                <svg className="w-24 h-24 transform -rotate-90">
                                    <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8"
                                            fill="transparent" className="text-[#c6c6cd]/30"/>
                                    <circle
                                        cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent"
                                        strokeDasharray="251.2"
                                        strokeDashoffset={251.2 - (251.2 * applicant.matchScore) / 100}
                                        className="text-brand-blue transition-all duration-1000 ease-out"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center flex-col">
                                    <span
                                        className="text-2xl font-display font-black text-brand-blue">{applicant.matchScore}%</span>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-grey-dark flex items-center gap-2">
                                    <Award className="w-5 h-5 text-match-high"/>
                                    {t('recruiterDetail.excellentMatch')}
                                </h3>
                                <p className="text-sm text-grey-muted mt-2 leading-relaxed">
                                    {t('recruiterDetail.matchDescPart1')}
                                    <strong>{applicant.matchScore}%</strong> {t('recruiterDetail.matchDescPart2')}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Skills Breakdown */}
                    <Card className="rounded-3xl border-[#c6c6cd] shadow-xs bg-white/60 backdrop-blur-md">
                        <CardHeader className="pb-4 border-b border-[#c6c6cd]/20">
                            <CardTitle
                                className="text-lg font-bold text-grey-dark">{t('recruiterDetail.verifiedSkills')}</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="flex flex-wrap gap-2.5">
                                {applicant.skills.map((skill, index) => (
                                    <Badge
                                        key={index}
                                        variant="secondary"
                                        className="px-3 py-1.5 text-sm font-semibold bg-[#fcf8fa] text-grey-dark border border-[#c6c6cd]/50 rounded-xl shadow-xs hover:border-brand-blue/50 transition-colors cursor-default"
                                    >
                                        {skill}
                                    </Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* AI Security / Integrity Check */}
                    <Card className="rounded-3xl border-[#c6c6cd] shadow-xs bg-[#f0edef]/40 backdrop-blur-md">
                        <CardHeader className="pb-2">
                            <CardTitle
                                className="text-sm font-bold text-grey-dark flex items-center gap-2 uppercase tracking-wider">
                                <Shield className="w-4 h-4 text-academic-purple"/>
                                {t('recruiterDetail.authAssessment')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                                <div className="bg-white/80 p-4 rounded-xl border border-[#c6c6cd]/40">
                                    <div
                                        className="text-xs text-grey-muted font-bold uppercase mb-1">{t('recruiterDetail.plagiarismCheck')}</div>
                                    <div
                                        className="text-sm font-black text-professional-emerald flex items-center gap-1.5">
                                        <CheckCircle className="w-4 h-4"/> {t('recruiterDetail.originalCv')}
                                    </div>
                                </div>
                                <div className="bg-white/80 p-4 rounded-xl border border-[#c6c6cd]/40">
                                    <div
                                        className="text-xs text-grey-muted font-bold uppercase mb-1">{t('recruiterDetail.consistency')}</div>
                                    <div
                                        className="text-sm font-black text-professional-emerald flex items-center gap-1.5">
                                        <CheckCircle className="w-4 h-4"/> {t('recruiterDetail.logicallyVerified')}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                </div>
            </div>
        </div>
    );
}