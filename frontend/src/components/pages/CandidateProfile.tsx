import {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {
    Briefcase,
    Building,
    Calendar,
    Edit2,
    GraduationCap,
    Loader2,
    Mail,
    MapPin,
    Plus,
    Save,
    Trash2,
    X
} from 'lucide-react';
import {Experience, Profile} from '@/lib/types';
import {CandidateMode, toApiMode} from '@/lib/mode';
import ModeToggle from '@/components/shared/ModeToggle';
import {fetchCandidateExperiences} from '@/lib/experiences';
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Badge} from "@/components/ui/badge";
import {Label} from "@/components/ui/label";
import apiClient from '@/lib/axios';

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
                                             candidateMode,
                                             onSwitchMode,
                                             isSwitchingMode,
                                             onSaveProfile
                                         }: CandidateProfileProps) {
    const {t} = useTranslation();
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editedProfile, setEditedProfile] = useState<Profile>(profile);

    // Experience State
    const [experiences, setExperiences] = useState<Experience[]>([]);
    const [isLoadingExperiences, setIsLoadingExperiences] = useState(true);
    const [isAddingExperience, setIsAddingExperience] = useState(false);
    const [newExperience, setNewExperience] = useState<Partial<Experience>>({currentlyActive: false});

    // Skills State
    const [newSkill, setNewSkill] = useState('');

    useEffect(() => {
        setEditedProfile(profile);
    }, [profile]);

    const loadExperiences = () => {
        if (!profile.id) return;
        setIsLoadingExperiences(true);
        fetchCandidateExperiences(profile.id, candidateMode)
            .then(setExperiences)
            .catch((err) => console.error('Failed to load experiences:', err))
            .finally(() => setIsLoadingExperiences(false));
    };

    useEffect(() => {
        loadExperiences();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [profile.id, candidateMode]);

    const handleSaveProfile = async () => {
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

    // --- EXPERIENCES CRUD ---

    const handleCreateExperience = async () => {
        if (!newExperience.title || !newExperience.organization || !newExperience.startDate) return;

        try {
            const payload = {
                candidateId: profile.id,
                title: newExperience.title,
                organization: newExperience.organization,
                description: newExperience.description,
                startDate: newExperience.startDate,
                endDate: newExperience.endDate,
                currentlyActive: newExperience.currentlyActive,
                mode: toApiMode(candidateMode) // "Academic" or "Professional"
            };

            await apiClient.post('/api/v1/experiences', payload);
            setIsAddingExperience(false);
            setNewExperience({currentlyActive: false});
            loadExperiences(); // Refresh list
        } catch (error) {
            console.error('Failed to create experience:', error);
        }
    };

    const handleDeleteExperience = async (expId: string) => {
        try {
            await apiClient.delete(`/api/v1/experiences/${expId}`);
            setExperiences(prev => prev.filter(e => e.id !== expId));
        } catch (error) {
            console.error('Failed to delete experience:', error);
        }
    };

    // --- SKILLS ---

    const handleAddSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && newSkill.trim() !== '') {
            e.preventDefault();
            setEditedProfile({
                ...editedProfile,
                skills: [...(editedProfile.skills || []), newSkill.trim()]
            });
            setNewSkill('');
        }
    };

    const removeSkill = (skillToRemove: string) => {
        setEditedProfile({
            ...editedProfile,
            skills: (editedProfile.skills || []).filter(s => s !== skillToRemove)
        });
    };

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            {/* Header & Global Actions */}
            <div
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#c6c6cd]/30 pb-6">
                <div>
                    <h1 className="text-3xl font-display font-extrabold text-grey-dark tracking-tight">
                        {t('profile.title', 'Профил')}
                    </h1>
                    <p className="text-sm text-grey-muted mt-1">
                        Управлявайте вашата идентичност и професионално развитие.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {isEditing ? (
                        <Button onClick={handleSaveProfile} disabled={isSaving}
                                className="bg-brand-blue hover:bg-brand-blue-dark text-white rounded-xl shadow-sm gap-2 px-6 h-10">
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4"/>}
                            {t('profile.saveChanges', 'Запази')}
                        </Button>
                    ) : (
                        <Button onClick={() => setIsEditing(true)} variant="outline"
                                className="border-[#c6c6cd] text-grey-dark hover:bg-white rounded-xl shadow-xs gap-2 px-6 h-10">
                            <Edit2 className="w-4 h-4"/>
                            {t('profile.edit', 'Редактирай')}
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* LEFT COLUMN: Basic Identity */}
                <div className="lg:col-span-4 space-y-6">
                    <Card
                        className="rounded-3xl border-[#c6c6cd] shadow-xs bg-white/40 backdrop-blur-md overflow-hidden">
                        <CardContent className="p-6">
                            <div className="flex flex-col items-center mb-8">
                                <div
                                    className="w-24 h-24 rounded-full bg-brand-blue/10 border-2 border-brand-blue/20 flex items-center justify-center text-3xl font-display font-bold text-brand-blue mb-4 shadow-inner">
                                    {editedProfile.name ? editedProfile.name.charAt(0) : 'U'}
                                </div>
                                {isEditing ? (
                                    <div className="w-full space-y-4">
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-bold text-grey-muted uppercase">Име</Label>
                                            <Input value={editedProfile.name} onChange={e => setEditedProfile({
                                                ...editedProfile,
                                                name: e.target.value
                                            })} className="rounded-xl border-[#c6c6cd]/50 bg-white/50"/>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-bold text-grey-muted uppercase">Заглавие
                                                (Роля)</Label>
                                            <Input value={editedProfile.role} onChange={e => setEditedProfile({
                                                ...editedProfile,
                                                role: e.target.value
                                            })} className="rounded-xl border-[#c6c6cd]/50 bg-white/50"/>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <h2 className="text-xl font-bold text-grey-dark">{profile.name}</h2>
                                        <p className="text-brand-blue font-medium mt-1">{profile.role}</p>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-sm text-grey-dark">
                                    <Mail className="w-4 h-4 text-grey-muted"/>
                                    {isEditing ? <Input value={editedProfile.email} onChange={e => setEditedProfile({
                                        ...editedProfile,
                                        email: e.target.value
                                    })} className="h-8 text-sm rounded-lg"/> : <span>{profile.email}</span>}
                                </div>
                                <div className="flex items-center gap-3 text-sm text-grey-dark">
                                    <MapPin className="w-4 h-4 text-grey-muted"/>
                                    {isEditing ? <Input value={editedProfile.location} onChange={e => setEditedProfile({
                                        ...editedProfile,
                                        location: e.target.value
                                    })} className="h-8 text-sm rounded-lg"/> : <span>{profile.location}</span>}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-3xl border-[#c6c6cd] shadow-xs bg-white/40 backdrop-blur-md">
                        <CardHeader className="pb-2"><CardTitle
                            className="text-sm font-bold text-grey-dark uppercase tracking-wider">За
                            мен</CardTitle></CardHeader>
                        <CardContent>
                            {isEditing ? (
                                <Textarea value={editedProfile.bio}
                                          onChange={e => setEditedProfile({...editedProfile, bio: e.target.value})}
                                          className="min-h-[120px] text-sm rounded-xl resize-none"/>
                            ) : (
                                <p className="text-sm text-grey-muted leading-relaxed">{profile.bio || 'Няма добавена информация.'}</p>
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
                                    Активен изглед: {candidateMode === 'professional' ? 'Професионален' : 'Академичен'}
                                </h3>
                                <p className="text-xs text-grey-muted mt-0.5">Данните по-долу са филтрирани спрямо
                                    режима.</p>
                            </div>
                        </div>
                        <ModeToggle mode={candidateMode} onModeChange={onSwitchMode} isLoading={isSwitchingMode}/>
                    </div>

                    {/* Skills Card */}
                    <Card className="rounded-3xl border-[#c6c6cd] shadow-xs bg-white/40 backdrop-blur-md">
                        <CardHeader className="pb-4 border-b border-[#c6c6cd]/20">
                            <CardTitle className="text-lg font-bold text-grey-dark">Умения</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="flex flex-wrap gap-2 mb-4">
                                {(editedProfile.skills || []).map((skill, index) => (
                                    <Badge key={index} variant="secondary"
                                           className="px-3 py-1.5 text-sm font-medium bg-[#fcf8fa] text-brand-blue border border-[#c6c6cd]/40 rounded-xl gap-1.5 shadow-xs">
                                        {skill}
                                        {isEditing && (
                                            <button onClick={() => removeSkill(skill)}
                                                    className="hover:text-red-500 focus:outline-none transition-colors ml-1">
                                                <X className="w-3.5 h-3.5"/></button>
                                        )}
                                    </Badge>
                                ))}
                            </div>
                            {isEditing && (
                                <div className="relative mt-2 max-w-sm">
                                    <Input type="text" placeholder="Добави умение и натисни Enter..." value={newSkill}
                                           onChange={(e) => setNewSkill(e.target.value)} onKeyDown={handleAddSkill}
                                           className="pl-10 h-10 rounded-xl text-sm"/>
                                    <Plus className="w-4 h-4 absolute left-3.5 top-3 text-grey-muted"/>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Timeline / Experience Card */}
                    <Card className="rounded-3xl border-[#c6c6cd] shadow-xs bg-white/40 backdrop-blur-md">
                        <CardHeader
                            className="pb-4 border-b border-[#c6c6cd]/20 flex flex-row justify-between items-center">
                            <CardTitle className="text-lg font-bold text-grey-dark">
                                {candidateMode === 'professional' ? 'Професионален опит' : 'Образование'}
                            </CardTitle>
                            <Button size="sm" onClick={() => setIsAddingExperience(!isAddingExperience)} variant="ghost"
                                    className="text-brand-blue hover:bg-brand-blue/10">
                                {isAddingExperience ? <X className="w-4 h-4 mr-2"/> : <Plus className="w-4 h-4 mr-2"/>}
                                {isAddingExperience ? 'Отказ' : 'Добави'}
                            </Button>
                        </CardHeader>
                        <CardContent className="pt-6">

                            {/* Inline Form for New Experience */}
                            {isAddingExperience && (
                                <div
                                    className="bg-white p-4 rounded-2xl border border-brand-blue/30 shadow-sm mb-8 space-y-4">
                                    <h4 className="text-sm font-bold text-brand-blue mb-2">Нов запис
                                        ({candidateMode === 'professional' ? 'Професионален' : 'Академичен'})</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <Label className="text-xs text-grey-muted">Заглавие / Позиция</Label>
                                            <Input value={newExperience.title || ''} onChange={e => setNewExperience({
                                                ...newExperience,
                                                title: e.target.value
                                            })} placeholder="напр. Junior Java Developer"/>
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs text-grey-muted">Организация / Университет</Label>
                                            <Input value={newExperience.organization || ''}
                                                   onChange={e => setNewExperience({
                                                       ...newExperience,
                                                       organization: e.target.value
                                                   })} placeholder="напр. Tech Corp"/>
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs text-grey-muted">Начална дата</Label>
                                            <Input type="date" value={newExperience.startDate || ''}
                                                   onChange={e => setNewExperience({
                                                       ...newExperience,
                                                       startDate: e.target.value
                                                   })}/>
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs text-grey-muted">Крайна дата (Остави празно ако е
                                                настояща)</Label>
                                            <Input type="date" value={newExperience.endDate || ''}
                                                   disabled={newExperience.currentlyActive}
                                                   onChange={e => setNewExperience({
                                                       ...newExperience,
                                                       endDate: e.target.value
                                                   })}/>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs text-grey-muted">Описание</Label>
                                        <Textarea value={newExperience.description || ''}
                                                  onChange={e => setNewExperience({
                                                      ...newExperience,
                                                      description: e.target.value
                                                  })} placeholder="Опишете отговорностите си..."
                                                  className="resize-none h-20"/>
                                    </div>
                                    <Button onClick={handleCreateExperience}
                                            className="w-full bg-brand-blue text-white rounded-xl">Запази
                                        записа</Button>
                                </div>
                            )}

                            {/* Experience Timeline */}
                            {isLoadingExperiences ? (
                                <div className="flex items-center justify-center py-8 text-grey-muted gap-2">
                                    <Loader2 className="w-5 h-5 animate-spin"/> Зареждане...
                                </div>
                            ) : experiences.length === 0 ? (
                                <p className="text-sm text-grey-muted text-center py-4">Все още няма добавен опит за
                                    този режим.</p>
                            ) : (
                                <div className="relative border-l-2 border-[#c6c6cd]/40 ml-4 pl-6 space-y-8">
                                    {experiences.map((experience) => (
                                        <div key={experience.id} className="relative group">
                                            <div
                                                className={`absolute -left-[35px] top-1 w-4 h-4 rounded-full border-2 border-white shadow-sm ${candidateMode === 'professional' ? 'bg-professional-emerald' : 'bg-academic-purple'}`}></div>

                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="text-base font-bold text-grey-dark">{experience.title}</h4>
                                                    <p className="text-sm font-medium text-brand-blue flex items-center gap-1.5 mt-0.5">
                                                        <Building className="w-3.5 h-3.5"/> {experience.organization}
                                                    </p>
                                                    <p className="text-xs text-grey-muted flex items-center gap-1.5 mt-1.5 font-mono">
                                                        <Calendar className="w-3.5 h-3.5"/>
                                                        {experience.startDate ?? '—'} {' - '}
                                                        {experience.currentlyActive ? 'Настояще' : (experience.endDate ?? '—')}
                                                    </p>
                                                </div>
                                                <Button onClick={() => handleDeleteExperience(experience.id)}
                                                        variant="ghost" size="icon"
                                                        className="opacity-0 group-hover:opacity-100 text-red-500 hover:bg-red-50 transition-opacity">
                                                    <Trash2 className="w-4 h-4"/>
                                                </Button>
                                            </div>

                                            {experience.description && (
                                                <p className="text-sm text-grey-muted mt-3 leading-relaxed bg-[#f0edef]/30 p-3 rounded-xl">
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