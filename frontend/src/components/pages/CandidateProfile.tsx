import {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Briefcase, Edit2, GraduationCap, Loader2, Mail, MapPin, Plus, Save, X} from 'lucide-react';
import {Experience, Profile} from '@/lib/types';
import {CandidateMode} from '@/lib/mode';
import ModeToggle from '@/components/shared/ModeToggle';
import {fetchCandidateExperiences} from '@/lib/experiences';
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Badge} from "@/components/ui/badge";
import {Label} from "@/components/ui/label";

interface CandidateProfileProps {
    profile: Profile;
    setProfile: (profile: Profile) => void;
    candidateMode: CandidateMode;
    onSwitchMode: (mode: CandidateMode) => void;
    isSwitchingMode?: boolean;
    onSaveProfile: (profile: Profile) => Promise<void>;
}

export default function CandidateProfile({
                                             profile,
                                             setProfile,
                                             candidateMode,
                                             onSwitchMode,
                                             isSwitchingMode,
                                             onSaveProfile
                                         }: CandidateProfileProps) {
    const {t} = useTranslation();
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editedProfile, setEditedProfile] = useState<Profile>(profile);
    const [experiences, setExperiences] = useState<Experience[]>([]);
    const [isLoadingExperiences, setIsLoadingExperiences] = useState(true);
    const [newSkill, setNewSkill] = useState('');

    useEffect(() => {
        setEditedProfile(profile);
    }, [profile]);

    useEffect(() => {
        if (!profile.id) return;

        setIsLoadingExperiences(true);
        fetchCandidateExperiences(profile.id, candidateMode)
            .then(setExperiences)
            .catch((err) => console.error('Failed to load experiences:', err))
            .finally(() => setIsLoadingExperiences(false));
    }, [profile.id, candidateMode]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onSaveProfile(editedProfile);
            setIsEditing(false);
        } catch (err) {
            console.error('Failed to save profile:', err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && newSkill.trim() !== '') {
            e.preventDefault();
            setEditedProfile({
                ...editedProfile,
                skills: [...editedProfile.skills, newSkill.trim()]
            });
            setNewSkill('');
        }
    };

    const removeSkill = (skillToRemove: string) => {
        setEditedProfile({
            ...editedProfile,
            skills: editedProfile.skills.filter(s => s !== skillToRemove)
        });
    };

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            {/* Header & Global Actions */}
            <div
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#c6c6cd]/30 pb-6">
                <div>
                    <h1 className="text-3xl font-display font-extrabold text-grey-dark tracking-tight">
                        {t('profile.title')}
                    </h1>
                    <p className="text-sm text-grey-muted mt-1">
                        {t('profile.subtitle')}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {isEditing ? (
                        <Button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="bg-brand-blue hover:bg-brand-blue-dark text-white rounded-xl shadow-sm gap-2 px-6 h-10"
                        >
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4"/>}
                            {isSaving ? t('profile.saving', 'Запазване...') : t('profile.saveChanges')}
                        </Button>
                    ) : (
                        <Button
                            onClick={() => setIsEditing(true)}
                            variant="outline"
                            className="border-[#c6c6cd] text-grey-dark hover:bg-white rounded-xl shadow-xs gap-2 px-6 h-10"
                        >
                            <Edit2 className="w-4 h-4"/>
                            {t('profile.edit')}
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* LEFT COLUMN: Basic Identity & Links */}
                <div className="lg:col-span-4 space-y-6">
                    <Card
                        className="rounded-3xl border-[#c6c6cd] shadow-xs bg-white/40 backdrop-blur-md overflow-hidden">
                        <CardContent className="p-6">
                            {/* Avatar/Initials */}
                            <div className="flex flex-col items-center mb-8">
                                <div
                                    className="w-24 h-24 rounded-full bg-brand-blue/10 border-2 border-brand-blue/20 flex items-center justify-center text-3xl font-display font-bold text-brand-blue mb-4 shadow-inner">
                                    {editedProfile.name ? editedProfile.name.split(' ').map(n => n[0]).join('') : 'U'}
                                </div>
                                {isEditing ? (
                                    <div className="w-full space-y-4">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="name"
                                                   className="text-xs font-bold text-grey-muted uppercase">{t('profile.nameLabel')}</Label>
                                            <Input
                                                id="name"
                                                value={editedProfile.name}
                                                onChange={e => setEditedProfile({
                                                    ...editedProfile,
                                                    name: e.target.value
                                                })}
                                                className="rounded-xl border-[#c6c6cd]/50 bg-white/50 focus-visible:ring-brand-blue"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="role"
                                                   className="text-xs font-bold text-grey-muted uppercase">{t('profile.roleLabel')}</Label>
                                            <Input
                                                id="role"
                                                value={editedProfile.role}
                                                onChange={e => setEditedProfile({
                                                    ...editedProfile,
                                                    role: e.target.value
                                                })}
                                                className="rounded-xl border-[#c6c6cd]/50 bg-white/50 focus-visible:ring-brand-blue"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <h2 className="text-xl font-bold text-grey-dark">{profile.name}</h2>
                                        <p className="text-brand-blue font-medium mt-1">{profile.role}</p>
                                    </div>
                                )}
                            </div>

                            {/* Contact Information */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-sm text-grey-dark">
                                    <Mail className="w-4 h-4 text-grey-muted"/>
                                    {isEditing ? (
                                        <Input
                                            value={editedProfile.email}
                                            onChange={e => setEditedProfile({...editedProfile, email: e.target.value})}
                                            className="h-8 text-sm rounded-lg border-[#c6c6cd]/50 bg-white/50 flex-1"
                                        />
                                    ) : (
                                        <span>{profile.email}</span>
                                    )}
                                </div>
                                <div className="flex items-center gap-3 text-sm text-grey-dark">
                                    <MapPin className="w-4 h-4 text-grey-muted"/>
                                    {isEditing ? (
                                        <Input
                                            value={editedProfile.location}
                                            onChange={e => setEditedProfile({
                                                ...editedProfile,
                                                location: e.target.value
                                            })}
                                            className="h-8 text-sm rounded-lg border-[#c6c6cd]/50 bg-white/50 flex-1"
                                        />
                                    ) : (
                                        <span>{profile.location}</span>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-3xl border-[#c6c6cd] shadow-xs bg-white/40 backdrop-blur-md">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-bold text-grey-dark uppercase tracking-wider">
                                {t('profile.aboutMe')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isEditing ? (
                                <Textarea
                                    value={editedProfile.bio}
                                    onChange={e => setEditedProfile({...editedProfile, bio: e.target.value})}
                                    className="min-h-[120px] text-sm rounded-xl border-[#c6c6cd]/50 bg-white/50 resize-none focus-visible:ring-brand-blue"
                                />
                            ) : (
                                <p className="text-sm text-grey-muted leading-relaxed">
                                    {profile.bio}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* RIGHT COLUMN: Mode-Specific Data */}
                <div className="lg:col-span-8 space-y-6">

                    {/* Active Mode Indicator */}
                    <div
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-[#f0edef]/50 p-4 rounded-2xl border border-[#c6c6cd]/30">
                        <div className="flex items-center gap-3">
                            <div
                                className={`p-2 rounded-xl text-white ${candidateMode === 'professional' ? 'bg-professional-emerald' : 'bg-academic-purple'}`}>
                                {candidateMode === 'professional' ? <Briefcase className="w-5 h-5"/> :
                                    <GraduationCap className="w-5 h-5"/>}
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-grey-dark">
                                    {t('profile.activeView')}: {candidateMode === 'professional' ? t('profile.proMode') : t('profile.academicMode')}
                                </h3>
                                <p className="text-xs text-grey-muted mt-0.5">
                                    {t('profile.activeViewDesc')}
                                </p>
                            </div>
                        </div>
                        <ModeToggle
                            mode={candidateMode}
                            onModeChange={onSwitchMode}
                            isLoading={isSwitchingMode}
                        />
                    </div>

                    <Card className="rounded-3xl border-[#c6c6cd] shadow-xs bg-white/40 backdrop-blur-md">
                        <CardHeader className="pb-4 border-b border-[#c6c6cd]/20">
                            <CardTitle className="text-lg font-bold text-grey-dark">
                                {candidateMode === 'professional' ? t('profile.skillsPro') : t('profile.skillsAcademic')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="flex flex-wrap gap-2 mb-4">
                                {editedProfile.skills.map((skill, index) => (
                                    <Badge
                                        key={index}
                                        variant="secondary"
                                        className="px-3 py-1.5 text-sm font-medium bg-[#fcf8fa] text-brand-blue border border-[#c6c6cd]/40 rounded-xl gap-1.5 shadow-xs"
                                    >
                                        {skill}
                                        {isEditing && (
                                            <button onClick={() => removeSkill(skill)}
                                                    className="hover:text-red-500 focus:outline-none transition-colors ml-1">
                                                <X className="w-3.5 h-3.5"/>
                                            </button>
                                        )}
                                    </Badge>
                                ))}
                            </div>

                            {isEditing && (
                                <div className="relative mt-2 max-w-sm">
                                    <Input
                                        type="text"
                                        placeholder={t('profile.addSkillPlaceholder')}
                                        value={newSkill}
                                        onChange={(e) => setNewSkill(e.target.value)}
                                        onKeyDown={handleAddSkill}
                                        className="pl-10 h-10 rounded-xl border-[#c6c6cd]/50 bg-white/50 text-sm focus-visible:ring-brand-blue"
                                    />
                                    <Plus className="w-4 h-4 absolute left-3.5 top-3 text-grey-muted"/>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Timeline Placeholder */}
                    <Card className="rounded-3xl border-[#c6c6cd] shadow-xs bg-white/40 backdrop-blur-md">
                        <CardHeader className="pb-4 border-b border-[#c6c6cd]/20">
                            <CardTitle className="text-lg font-bold text-grey-dark">
                                {candidateMode === 'professional' ? t('profile.experience') : t('profile.education')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            {isLoadingExperiences ? (
                                <div className="flex items-center justify-center py-8 text-grey-muted gap-2">
                                    <Loader2 className="w-5 h-5 animate-spin"/>
                                    {t('profile.loadingExperiences', 'Зареждане...')}
                                </div>
                            ) : experiences.length === 0 ? (
                                <p className="text-sm text-grey-muted">{t('profile.noExperiences', 'Все още няма добавен опит за този режим.')}</p>
                            ) : (
                                <div className="relative border-l-2 border-[#c6c6cd]/40 ml-4 pl-6 pb-4 space-y-8">
                                    {experiences.map((experience) => (
                                        <div key={experience.id} className="relative">
                                            <div
                                                className={`absolute -left-[35px] top-1 w-4 h-4 rounded-full border-2 border-white shadow-sm ${candidateMode === 'professional' ? 'bg-professional-emerald' : 'bg-academic-purple'}`}></div>
                                            <h4 className="text-base font-bold text-grey-dark">
                                                {experience.title}
                                            </h4>
                                            <p className="text-sm font-medium text-brand-blue mt-0.5">
                                                {experience.organization}
                                            </p>
                                            <p className="text-xs text-grey-muted mt-1 font-mono">
                                                {experience.startDate ?? '—'}
                                                {' - '}
                                                {experience.currentlyActive ? t('profile.present', 'Настояще') : (experience.endDate ?? '—')}
                                            </p>
                                            {experience.description && (
                                                <p className="text-sm text-grey-muted mt-3 leading-relaxed">
                                                    {experience.description}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                </div>
            </div>
        </div>
    );
}