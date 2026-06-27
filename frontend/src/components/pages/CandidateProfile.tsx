import {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Calendar, Code2, Edit3, ExternalLink, Mail, MapPin, Save, ShieldCheck, X} from 'lucide-react';
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Experience, Profile} from '@/lib/types';
import {PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer} from 'recharts';
import { fetchCandidateExperiences } from '@/lib/experiences';

interface CandidateProfileProps {
    profile: Profile;
    onSaveProfile?: (updatedData: Partial<Profile>) => Promise<void>;
}

export default function CandidateProfile({profile, onSaveProfile}: CandidateProfileProps) {
    const {t} = useTranslation();
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [experiences, setExperiences] = useState<Experience[]>([]);
    const [loadingExp, setLoadingExp] = useState(true);

    // Локален стейт за формата при редакция
    const [editForm, setEditForm] = useState({
        name: profile?.name || '',
        role: profile?.role || '',
        bio: profile?.bio || '',
        githubUrl: '',
        linkedinUrl: ''
    });

    useEffect(() => {
        if (profile?.id) {
            fetchCandidateExperiences(profile.id)
                .then(setExperiences)
                .catch(err => console.error("Грешка при зареждане на опит:", err))
                .finally(() => setLoadingExp(false));
        }
    }, [profile?.id]);

    // Рестартираме формата, ако профилът се промени отвън
    useEffect(() => {
        setEditForm({
            name: profile?.name || '',
            role: profile?.role || '',
            bio: profile?.bio || t('profile.defaultBio', 'Страстен софтуерен инженер с опит в изграждането на мащабируеми уеб приложения...'),
            githubUrl: '',
            linkedinUrl: ''
        });
    }, [profile, t]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            if (onSaveProfile) {
                await onSaveProfile(editForm);
            }
            setIsEditing(false);
        } catch (error) {
            console.error(t('profile.saveError', 'Грешка при запазване:'), error);
        } finally {
            setIsSaving(false);
        }
    };

    const displaySkills = profile?.skills && profile.skills.length > 0
        ? profile.skills
        : ['Java', 'Spring Boot', 'React', 'TypeScript', 'PostgreSQL', 'Docker', 'AWS', 'Machine Learning'];

    // @ts-ignore
    const skillsData = displaySkills.slice(0, 6).map((skill, index) => ({
        subject: skill,
        A: 60 + (Math.random() * 40),
        fullMark: 100
    }));

    const getInitials = (name: string) => {
        if (!name || name.includes(t('profile.unknownUser', 'Неизвестен'))) return 'JD';
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
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
                            onClick={() => setIsEditing(false)}
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
                                    {getInitials(editForm.name)}
                                </div>
                            </div>

                            {isEditing ? (
                                <div className="space-y-3 mt-4">
                                    <Input
                                        value={editForm.name}
                                        onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                                        placeholder={t('profile.placeholders.name', 'Име и фамилия')}
                                        className="text-center font-bold"
                                    />
                                    <Input
                                        value={editForm.role}
                                        onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                                        placeholder={t('profile.placeholders.role', 'Позиция (напр. Full-Stack Developer)')}
                                        className="text-center text-sm text-brand-blue"
                                    />
                                </div>
                            ) : (
                                <>
                                    <h2 className="text-xl font-bold text-grey-dark mt-2">
                                        {profile?.name && !profile?.name.includes(t('profile.unknownUser', 'Неизвестен')) ? profile.name : 'Джон Доу'}
                                    </h2>
                                    <p className="text-sm text-brand-blue font-semibold mb-4">
                                        {profile?.role || 'Full-Stack Developer'}
                                    </p>
                                </>
                            )}

                            <div className="flex flex-col gap-3 text-sm text-grey-muted text-left mt-6">
                                <div className="flex items-center gap-3">
                                    <Mail className="w-4 h-4 text-brand-blue"/> {profile?.email || 'email@example.com'}
                                </div>
                                <div className="flex items-center gap-3">
                                    <MapPin
                                        className="w-4 h-4 text-brand-blue"/> {profile?.location || t('profile.defaultLocation', 'София, България')}
                                </div>
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
                                            placeholder="GitHub URL"
                                            value={editForm.githubUrl}
                                            onChange={(e) => setEditForm({...editForm, githubUrl: e.target.value})}
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
                                    <a href="#"
                                       className="w-12 h-12 rounded-xl bg-[#fcf8fa] dark:bg-slate-800 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-grey-dark flex items-center justify-center transition-all shadow-sm border border-[#c6c6cd]/30 group">
                                        <Code2 className="w-6 h-6 group-hover:scale-110 transition-transform"/>
                                    </a>
                                    <a href="#"
                                       className="w-12 h-12 rounded-xl bg-[#fcf8fa] dark:bg-slate-800 hover:bg-[#0077b5] hover:text-white text-grey-dark flex items-center justify-center transition-all shadow-sm border border-[#c6c6cd]/30 group">
                                        <ExternalLink className="w-6 h-6 group-hover:scale-110 transition-transform"/>
                                    </a>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card
                        className="rounded-3xl border border-[#c6c6cd]/30 shadow-md bg-white dark:bg-slate-900 overflow-hidden relative">
                        <CardHeader className="pb-0 relative z-10">
                            <CardTitle
                                className="text-lg font-bold text-grey-dark text-center">{t('profile.skillProfile', 'Профил на Уменията')}</CardTitle>
                        </CardHeader>
                        <CardContent className="h-72 flex items-center justify-center relative z-10 pt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="65%" data={skillsData}>
                                    <PolarGrid stroke="#e2e8f0" className="dark:stroke-slate-700"
                                               strokeDasharray="3 3"/>

                                    <PolarAngleAxis
                                        dataKey="subject"
                                        tick={{fill: '#64748b', fontSize: 12, fontWeight: 700}}
                                        className="dark:text-slate-300"
                                    />
                                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false}/>

                                    <Radar
                                        name="Умения"
                                        dataKey="A"
                                        stroke="#2563eb"
                                        strokeWidth={2}
                                        fill="#3b82f6"
                                        fillOpacity={0.4}
                                    />
                                </RadarChart>
                            </ResponsiveContainer>
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
                                    value={editForm.bio}
                                    onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                                    className="min-h-[120px]"
                                    placeholder={t('profile.placeholders.bio', 'Разкажете малко повече за вашия опит...')}
                                />
                            ) : (
                                <p className="text-grey-dark leading-relaxed text-sm">
                                    {editForm.bio}
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    <Card
                        className="rounded-3xl border border-[#c6c6cd]/50 shadow-sm bg-white/70 backdrop-blur-md dark:bg-slate-900/70">
                        <CardHeader className="pb-3">
                            <CardTitle
                                className="text-lg font-bold text-grey-dark">{t('profile.keyTech', 'Ключови Технологии')}</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-wrap gap-2">
                            {displaySkills.map((skill) => (
                                <Badge key={skill}
                                       className="bg-brand-blue/10 text-brand-blue hover:bg-brand-blue/20 px-3 py-1.5 rounded-lg border-0 font-bold shadow-sm">
                                    {skill}
                                </Badge>
                            ))}
                        </CardContent>
                    </Card>

                    <Card className="rounded-3xl border-0 shadow-md bg-white dark:bg-slate-900">
                        <CardHeader>
                            <CardTitle className="text-xl font-bold text-grey-dark flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-professional-emerald"/>
                                {t('profile.experience', 'Професионален Опит')}
                                //todo add button here probably
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {loadingExp ? (
                                <p className="text-sm text-grey-muted">Зареждане...</p>
                            ) : experiences.length === 0 ? (
                                <p className="text-sm text-grey-muted">Все още няма добавен опит.</p>
                            ) : (
                                experiences.map((exp) => (
                                    <div key={exp.id} className="group relative pl-6 border-l-2 border-[#f0edef] hover:border-brand-blue transition-colors">
                                        <div className="absolute w-3 h-3 bg-brand-blue rounded-full -left-[7px] top-1.5 shadow-[0_0_0_4px_white]"></div>
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className="text-lg font-bold text-grey-dark">{exp.title}</h3>
                                            <Badge variant="outline" className="text-xs">{exp.mode}</Badge>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-grey-muted mb-2 font-medium">
                        <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3"/> {exp.startDate} {exp.endDate ? `- ${exp.endDate}` : '- Настояще'}
                        </span>
                                        </div>
                                        <p className="text-sm text-grey-dark">{exp.organization}</p>
                                        <p className="text-sm text-grey-muted italic mt-1">{exp.description}</p>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}