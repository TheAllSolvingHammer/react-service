import {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {
    Calendar,
    Code2,
    Download,
    Edit3,
    ExternalLink,
    FileText,
    Mail,
    MapPin,
    PlusCircle,
    Save,
    ShieldCheck,
    Trash2,
    X
} from 'lucide-react';
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import AddExperienceModal from './AddExperienceModal';
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Experience, Profile, ProfileSkill} from '@/lib/types';
import {deleteCandidateExperience, fetchCandidateExperiences} from '@/lib/experiences';
import {uploadCandidateCv} from "@/lib/profileApi.ts";
import {adminApi} from "@/lib/adminApi";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";

const ensureUrl = (url: string | undefined): string => {
    if (!url || url === '#') return '#';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return 'https://' + url;
};

const fixResumeUrl = (url: string | undefined): string | undefined => {
    if (!url) return undefined;
    // Transform internal Docker URLs to gateway-relative paths
    const internalPatterns = ['http://opportunity-service', 'http://profile-service'];
    for (const pattern of internalPatterns) {
        if (url.startsWith(pattern)) {
            const pathStart = url.indexOf('/api/');
            if (pathStart !== -1) return url.substring(pathStart);
        }
    }
    return url;
};


interface CandidateProfileProps {
    profile: Profile;
    onSaveProfile?: (updatedData: Partial<Profile>) => Promise<void>;
}

export default function CandidateProfile({profile, onSaveProfile}: CandidateProfileProps) {
    const {t} = useTranslation();
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [experiences, setExperiences] = useState<Experience[]>([]);
    const professionalExperiences = experiences.filter(exp => exp.mode?.toUpperCase() === 'PROFESSIONAL' || !exp.mode || exp.mode?.toUpperCase() === 'UNKNOWN');
    const academicExperiences = experiences.filter(exp => exp.mode?.toUpperCase() === 'ACADEMIC');
    const [loadingExp, setLoadingExp] = useState(true);
    const [isExperienceModalOpen, setIsExperienceModalOpen] = useState(false);
    const [availableSkills, setAvailableSkills] = useState<{ id: string, name: string }[]>([]);

    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const [editForm, setEditForm] = useState({
        firstName: profile?.firstName || '',
        middleName: profile?.middleName || '',
        lastName: profile?.lastName || '',
        headline: profile?.headline || '',
        biography: profile?.biography || '',
        location: profile?.location || '',
        portfolioUrl: profile?.portfolioUrl || '',
        linkedinUrl: profile?.linkedinUrl || '',
        resumeUrl: profile?.resumeUrl || '',
        profileSkills: profile?.profileSkills || [] as ProfileSkill[]
    });

    const loadExperiences = () => {
        if (!profile?.id) return;
        setLoadingExp(true);
        fetchCandidateExperiences(profile.id)
            .then(data => setExperiences(data))
            .catch(err => console.error(t('profile.errorLoadingExp', 'Грешка при зареждане на опит:'), err))
            .finally(() => setLoadingExp(false));
    };

    const handleDeleteExperience = async (expId: string) => {
        try {
            await deleteCandidateExperience(expId);
            setExperiences(prev => prev.filter(e => e.id !== expId));
        } catch (error) {
            console.error('Failed to delete experience:', error);
        }
    };

    useEffect(() => {
        loadExperiences();
        adminApi.getAllSkills().then(res => setAvailableSkills(res)).catch(console.error);
    }, [profile?.id]);

    // Рестартираме формата, ако профилът се промени отвън или отменим редакцията
    useEffect(() => {
        setEditForm({
            firstName: profile?.firstName || '',
            middleName: profile?.middleName || '',
            lastName: profile?.lastName || '',
            headline: profile?.headline || '',
            biography: profile?.biography || t('profile.defaultBio', 'Страстен софтуерен инженер...'),
            location: profile?.location || '',
            portfolioUrl: profile?.portfolioUrl || '',
            linkedinUrl: profile?.linkedinUrl || '',
            resumeUrl: profile?.resumeUrl || '',
            profileSkills: profile?.profileSkills || [] as ProfileSkill[]
        });
        setSelectedFile(null);
    }, [profile, t]);

    // 3. ОБНОВЕНА ЛОГИКА ЗА ЗАПАЗВАНЕ (с качване на CV)
    const handleSave = async () => {
        setIsSaving(true);
        try {
            let finalResumeUrl = editForm.resumeUrl;

            // Ако има избран нов файл, първо го качваме
            if (selectedFile && profile?.id) {
                finalResumeUrl = await uploadCandidateCv(selectedFile, profile.id);
            }

            const updatedData = {...editForm, resumeUrl: finalResumeUrl};

            if (onSaveProfile) {
                await onSaveProfile(updatedData);
            }
            setIsEditing(false);
            setSelectedFile(null);
        } catch (error) {
            console.error(t('profile.saveError', 'Грешка при запазване:'), error);
        } finally {
            setIsSaving(false);
        }
    };

    const displaySkills = profile?.profileSkills && profile.profileSkills.length > 0
        ? profile.profileSkills
        : [];

    const getInitials = (firstName?: string, lastName?: string) => {
        if (!firstName && !lastName) return 'JD';
        const f = firstName ? firstName[0] : '';
        const l = lastName ? lastName[0] : '';
        return (f + l).toUpperCase() || 'JD';
    };

    return (
        <div className="space-y-6 animate-fade-in max-w-6xl mx-auto pb-12 relative">
            <div
                className="absolute top-0 right-[-10%] w-96 h-96 bg-brand-blue/10 rounded-full blur-[100px] -z-10"></div>

            <div className="flex justify-between items-center mb-2">
                <h1 className="text-3xl font-display font-extrabold text-grey-dark tracking-tight">
                    {t('profile.title', 'Моят Профил')}
                </h1>

                {isEditing ? (
                    <div className="flex gap-2">
                        <Button
                            variant="ghost"
                            onClick={() => {
                                setIsEditing(false);
                                setSelectedFile(null); // Изчиства файла при отказ
                            }}
                            className="text-grey-muted hover:text-grey-dark"
                        >
                            <X className="w-4 h-4 mr-2"/> {t('profile.cancel', 'Отказ')}
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="bg-professional-emerald hover:bg-emerald-600 text-white rounded-xl shadow-sm transition-all"
                        >
                            <Save className="w-4 h-4 mr-2"/>
                            {isSaving ? t('profile.saving', 'Запазване...') : t('profile.saveChanges', 'Запази промените')}
                        </Button>
                    </div>
                ) : (
                    <Button
                        onClick={() => setIsEditing(true)}
                        className="bg-white text-grey-dark border border-[#c6c6cd] hover:border-brand-blue hover:text-brand-blue rounded-xl shadow-sm transition-all dark:bg-slate-800 dark:border-white/10 dark:text-white"
                    >
                        <Edit3 className="w-4 h-4 mr-2"/>
                        {t('profile.edit', 'Редактиране')}
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* ЛЯВА КОЛОНА */}
                <div className="lg:col-span-4 space-y-6">
                    <Card
                        className="rounded-3xl border-0 shadow-lg bg-white overflow-hidden relative dark:bg-slate-900">
                        <div className="h-24 bg-gradient-to-r from-brand-blue to-purple-600"></div>
                        <div className="px-6 pb-6 text-center relative">
                            <div
                                className="w-24 h-24 bg-white dark:bg-slate-900 rounded-full p-1 mx-auto -mt-12 mb-3 shadow-md relative z-10">
                                <div
                                    className="w-full h-full rounded-full bg-gradient-to-br from-brand-blue to-purple-600 text-white flex items-center justify-center text-3xl font-black shadow-inner">
                                    {profile?.initials || getInitials(editForm.firstName, editForm.lastName)}
                                </div>
                            </div>

                            {isEditing ? (
                                <div className="space-y-3 mt-4">
                                    <div className="flex gap-2">
                                        <Input
                                            value={editForm.firstName}
                                            onChange={(e) => setEditForm({...editForm, firstName: e.target.value})}
                                            placeholder={t('profile.placeholders.firstName', 'Име')}
                                            className="text-center font-bold bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                        />
                                        <Input
                                            value={editForm.middleName}
                                            onChange={(e) => setEditForm({...editForm, middleName: e.target.value})}
                                            placeholder={t('profile.placeholders.middleName', 'Презиме (опц.)')}
                                            className="text-center font-bold bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                        />
                                        <Input
                                            value={editForm.lastName}
                                            onChange={(e) => setEditForm({...editForm, lastName: e.target.value})}
                                            placeholder={t('profile.placeholders.lastName', 'Фамилия')}
                                            className="text-center font-bold bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                        />
                                    </div>
                                    <Input
                                        value={editForm.headline}
                                        onChange={(e) => setEditForm({...editForm, headline: e.target.value})}
                                        placeholder={t('profile.placeholders.role', 'Позиция (напр. Full-Stack Developer)')}
                                        className="text-center text-sm text-brand-blue bg-white dark:bg-slate-800"
                                    />
                                    <Input
                                        value={editForm.location}
                                        onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                                        placeholder={t('profile.placeholders.location', 'Локация (напр. София, България)')}
                                        className="text-center text-sm text-grey-muted bg-white dark:bg-slate-800"
                                    />
                                </div>
                            ) : (
                                <>
                                    <h2 className="text-xl font-bold text-grey-dark mt-2">
                                        {profile?.fullName || 'Джон Доу'}
                                    </h2>
                                    <p className="text-sm text-brand-blue font-semibold mb-4">
                                        {profile?.headline || 'Няма посочена позиция'}
                                    </p>
                                </>
                            )}

                            <div className="flex flex-col gap-3 text-sm text-grey-muted text-left mt-6">
                                <div className="flex items-center gap-3">
                                    <Mail className="w-4 h-4 text-brand-blue"/> {profile?.email || 'email@example.com'}
                                </div>
                                {!isEditing && (
                                    <div className="flex items-center gap-3">
                                        <MapPin
                                            className="w-4 h-4 text-brand-blue"/> {profile?.location || t('profile.defaultLocation', 'Непосочена локация')}
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>

                    <Card
                        className="rounded-3xl border border-[#c6c6cd]/50 shadow-sm bg-white/70 backdrop-blur-md dark:bg-slate-900/70">
                        <CardContent className="p-5">
                            {isEditing ? (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Code2 className="w-5 h-5 text-grey-muted"/>
                                        <Input
                                            placeholder="GitHub/Portfolio URL"
                                            value={editForm.portfolioUrl}
                                            onChange={(e) => setEditForm({...editForm, portfolioUrl: e.target.value})}
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <ExternalLink className="w-5 h-5 text-grey-muted"/>
                                        <Input
                                            placeholder="LinkedIn URL"
                                            value={editForm.linkedinUrl}
                                            onChange={(e) => setEditForm({...editForm, linkedinUrl: e.target.value})}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="flex gap-4 justify-center">
                                    <a href={ensureUrl(profile?.portfolioUrl)} target="_blank" rel="noreferrer"
                                       className="w-12 h-12 rounded-xl bg-[#fcf8fa] dark:bg-slate-800 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-grey-dark flex items-center justify-center transition-all shadow-sm border border-[#c6c6cd]/30 group">
                                        <Code2 className="w-6 h-6 group-hover:scale-110 transition-transform"/>
                                    </a>
                                    <a href={ensureUrl(profile?.linkedinUrl)} target="_blank" rel="noreferrer"
                                       className="w-12 h-12 rounded-xl bg-[#fcf8fa] dark:bg-slate-800 hover:bg-[#0077b5] hover:text-white text-grey-dark flex items-center justify-center transition-all shadow-sm border border-[#c6c6cd]/30 group">
                                        <ExternalLink className="w-6 h-6 group-hover:scale-110 transition-transform"/>
                                    </a>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* СЕКЦИЯ ЗА УМЕНИЯ */}
                    <Card
                        className="rounded-3xl border border-[#c6c6cd]/50 shadow-sm bg-white/70 backdrop-blur-md dark:bg-slate-900/70">
                        <CardHeader className="pb-3 flex flex-row items-center justify-between">
                            <CardTitle className="text-lg font-bold text-grey-dark flex items-center gap-2">
                                <Code2 className="w-5 h-5 text-brand-blue"/>
                                {t('profile.skillsTitle', 'Умения')}
                            </CardTitle>
                            {isEditing && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setEditForm({
                                        ...editForm,
                                        profileSkills: [...editForm.profileSkills, {skillId: '', strength: 'BEGINNER'}]
                                    })}
                                    className="text-brand-blue hover:bg-brand-blue/10"
                                >
                                    <PlusCircle className="w-4 h-4 mr-1"/> Добави
                                </Button>
                            )}
                        </CardHeader>
                        <CardContent>
                            {isEditing ? (
                                <div className="space-y-3">
                                    {editForm.profileSkills.map((ps, idx) => (
                                        <div key={idx} className="flex items-center gap-2">
                                            <Select
                                                value={ps.skillId}
                                                onValueChange={(val) => {
                                                    const newSkills = [...editForm.profileSkills];
                                                    newSkills[idx].skillId = val;
                                                    setEditForm({...editForm, profileSkills: newSkills});
                                                }}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Избери умение"/>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {availableSkills.map(s => (
                                                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>

                                            <Select
                                                value={ps.strength}
                                                onValueChange={(val: any) => {
                                                    const newSkills = [...editForm.profileSkills];
                                                    newSkills[idx].strength = val;
                                                    setEditForm({...editForm, profileSkills: newSkills});
                                                }}
                                            >
                                                <SelectTrigger className="w-[160px]">
                                                    <SelectValue placeholder="Ниво"/>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="BEGINNER">Начинаещ</SelectItem>
                                                    <SelectItem value="INTERMEDIATE">Средно</SelectItem>
                                                    <SelectItem value="EXPERT">Експерт</SelectItem>
                                                </SelectContent>
                                            </Select>

                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => {
                                                    const newSkills = [...editForm.profileSkills];
                                                    newSkills.splice(idx, 1);
                                                    setEditForm({...editForm, profileSkills: newSkills});
                                                }}
                                                className="text-red-500 hover:bg-red-50"
                                            >
                                                <Trash2 className="w-4 h-4"/>
                                            </Button>
                                        </div>
                                    ))}
                                    {editForm.profileSkills.length === 0 && (
                                        <p className="text-sm text-grey-muted text-center italic">Нямате добавени
                                            умения.</p>
                                    )}
                                </div>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {displaySkills.length > 0 ? displaySkills.map((ps, idx) => (
                                        <Badge key={idx} variant="secondary"
                                               className="px-3 py-1 bg-brand-blue/10 text-brand-blue hover:bg-brand-blue/20 rounded-xl flex items-center gap-1.5 border-0">
                                            {ps.skillName || availableSkills.find(s => s.id === ps.skillId)?.name || 'Unknown'}
                                            <span className="opacity-60 text-xs">
                                                • {ps.strength === 'BEGINNER' ? 'Начинаещ' : ps.strength === 'INTERMEDIATE' ? 'Средно' : ps.strength === 'EXPERT' ? 'Експерт' : 'Неизвестно'}
                                            </span>
                                        </Badge>
                                    )) : (
                                        <p className="text-sm text-grey-muted w-full text-center py-2">Все още няма
                                            добавени умения.</p>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* 4. НОВАТА СЕКЦИЯ ЗА CV / РЕЗЮМЕ */}
                    <Card
                        className="rounded-3xl border border-[#c6c6cd]/50 shadow-sm bg-white/70 backdrop-blur-md dark:bg-slate-900/70">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg font-bold text-grey-dark flex items-center gap-2">
                                <FileText className="w-5 h-5 text-brand-blue"/>
                                {t('profile.resume', 'Резюме / CV')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isEditing ? (
                                <div className="space-y-3">
                                    <Input
                                        type="file"
                                        accept=".pdf,.doc,.docx"
                                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                                        className="file:bg-brand-blue file:text-white file:border-0 file:rounded-lg file:px-3 file:py-1 file:mr-3 file:text-xs file:font-bold hover:file:bg-brand-blue-dark text-sm bg-white dark:bg-slate-800 cursor-pointer"
                                    />
                                    {selectedFile && (
                                        <p className="text-xs text-professional-emerald font-bold flex items-center gap-1">
                                            {t('profile.readyToUpload', 'Готов за качване:')} {selectedFile.name}
                                        </p>
                                    )}
                                    {!selectedFile && editForm.resumeUrl && (
                                        <p className="text-xs text-grey-muted italic">
                                            {t('profile.chooseNewCv', 'Изберете нов файл, ако искате да замените текущото си CV.')}
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <div className="flex justify-center">
                                    {profile?.resumeUrl ? (
                                        <a
                                            href={fixResumeUrl(profile.resumeUrl)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 px-4 py-2 bg-brand-blue/10 hover:bg-brand-blue/20 text-brand-blue font-bold rounded-xl transition-colors w-full justify-center"
                                        >
                                            <Download className="w-4 h-4"/> {t('profile.downloadCv', 'Изтегли CV')}
                                        </a>
                                    ) : (
                                        <p className="text-sm text-grey-muted bg-slate-50 dark:bg-slate-800 p-3 rounded-xl text-center w-full">
                                            {t('profile.noCvUploaded', 'Все още няма качено CV.')}
                                        </p>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>


                </div>

                {/* ДЯСНА КОЛОНА */}
                <div className="lg:col-span-8 space-y-6">
                    <Card className="rounded-3xl border-0 shadow-md bg-white dark:bg-slate-900">
                        <CardHeader>
                            <CardTitle
                                className="text-xl font-bold text-grey-dark">{t('profile.aboutMe', 'За мен')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isEditing ? (
                                <Textarea
                                    value={editForm.biography}
                                    onChange={(e) => setEditForm({...editForm, biography: e.target.value})}
                                    className="min-h-[120px] bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                    placeholder={t('profile.placeholders.bio', 'Разкажете малко повече за вашия опит...')}
                                />
                            ) : (
                                <p className="text-grey-dark leading-relaxed text-sm">
                                    {editForm.biography}
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="rounded-3xl border-0 shadow-md bg-white dark:bg-slate-900">
                        <CardHeader>
                            <CardTitle
                                className="text-xl font-bold text-grey-dark flex items-center justify-between w-full">
                                <div className="flex items-center gap-2">
                                    <ShieldCheck className="w-5 h-5 text-professional-emerald"/>
                                    {t('profile.experience', 'Опит (Професионален и Академичен)')}
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIsExperienceModalOpen(true)}
                                    className="text-brand-blue hover:text-brand-blue-dark hover:bg-brand-blue/10"
                                >
                                    <PlusCircle className="w-4 h-4 mr-1"/> {t('profile.addExperience', 'Добави')}
                                </Button>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {loadingExp ? (
                                <p className="text-sm text-grey-muted">{t('profile.loading', 'Зареждане...')}</p>
                            ) : experiences.length === 0 ? (
                                <p className="text-sm text-grey-muted">{t('profile.noExperienceAdded', 'Все още няма добавен опит.')}</p>
                            ) : (
                                <div className="space-y-8">
                                    {professionalExperiences.length > 0 && (
                                        <div className="space-y-4">
                                            <h4 className="text-md font-bold text-grey-dark border-b pb-2">{t('profile.professionalExp', 'Професионален Опит')}</h4>
                                            {professionalExperiences.map((exp) => (
                                                <div key={exp.id}
                                                     className="group relative pl-6 border-l-2 border-[#f0edef] hover:border-brand-blue transition-colors">
                                                    <div
                                                        className="absolute w-3 h-3 bg-brand-blue rounded-full -left-[7px] top-1.5 shadow-[0_0_0_4px_white]"></div>
                                                    <div className="flex justify-between items-start mb-1">
                                                        <div className="flex flex-col">
                                                            <h3 className="text-lg font-bold text-grey-dark flex items-center gap-2">
                                                                {exp.title}
                                                            </h3>
                                                            <p className="text-sm text-grey-dark font-semibold">{exp.organization}</p>
                                                        </div>
                                                        {isEditing && (
                                                            <Button variant="ghost" size="sm"
                                                                    onClick={() => handleDeleteExperience(exp.id)}
                                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                                    title={t('profile.deleteExperience', 'Изтрий опита')}>
                                                                <Trash2 className="w-4 h-4"/>
                                                            </Button>
                                                        )}
                                                    </div>
                                                    <div
                                                        className="flex items-center gap-3 text-xs text-grey-muted mb-2 font-medium">
                                                        <span className="flex items-center gap-1">
                                                            <Calendar
                                                                className="w-3 h-3"/> {exp.startDate} {exp.endDate ? `- ${exp.endDate}` : '- Настояще'}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-grey-muted italic mt-1">{exp.description}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {academicExperiences.length > 0 && (
                                        <div className="space-y-4">
                                            <h4 className="text-md font-bold text-grey-dark border-b pb-2">{t('profile.academicExp', 'Академичен Опит')}</h4>
                                            {academicExperiences.map((exp) => (
                                                <div key={exp.id}
                                                     className="group relative pl-6 border-l-2 border-[#f0edef] hover:border-purple-500 transition-colors">
                                                    <div
                                                        className="absolute w-3 h-3 bg-purple-500 rounded-full -left-[7px] top-1.5 shadow-[0_0_0_4px_white]"></div>
                                                    <div className="flex justify-between items-start mb-1">
                                                        <div className="flex flex-col">
                                                            <h3 className="text-lg font-bold text-grey-dark flex items-center gap-2">
                                                                {exp.title}
                                                            </h3>
                                                            <p className="text-sm text-grey-dark font-semibold">{exp.organization}</p>
                                                        </div>
                                                        {isEditing && (
                                                            <Button variant="ghost" size="sm"
                                                                    onClick={() => handleDeleteExperience(exp.id)}
                                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                                    title={t('profile.deleteExperience', 'Изтрий опита')}>
                                                                <Trash2 className="w-4 h-4"/>
                                                            </Button>
                                                        )}
                                                    </div>
                                                    <div
                                                        className="flex items-center gap-3 text-xs text-grey-muted mb-2 font-medium">
                                                        <span className="flex items-center gap-1">
                                                            <Calendar
                                                                className="w-3 h-3"/> {exp.startDate} {exp.endDate ? `- ${exp.endDate}` : '- Настояще'}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-grey-muted italic mt-1">{exp.description}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {profile?.id && (
                <AddExperienceModal
                    isOpen={isExperienceModalOpen}
                    onClose={() => setIsExperienceModalOpen(false)}
                    onSuccess={loadExperiences}
                    candidateId={profile.id}
                />
            )}
        </div>
    );
}