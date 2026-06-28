import { useState } from 'react';
import {
    Briefcase, ChevronRight, MapPin, Sparkles, LogOut,
    User, Banknote, GraduationCap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Profile } from '@/lib/types';
import apiClient from '@/lib/axios';

interface ProfileOnboardingProps {
    profile: Profile;
    onComplete: (updatedProfile: Profile) => void;
    onLogout: () => void;
}

export default function ProfileOnboarding({ profile, onComplete, onLogout }: ProfileOnboardingProps) {
    // Basic fields
    const [firstName, setFirstName] = useState(profile.firstName || profile.fullName?.split(' ')[0] || '');
    const [lastName, setLastName] = useState(profile.lastName || profile.fullName?.split(' ').slice(1).join(' ') || '');
    const [middleName, setMiddleName] = useState(profile.middleName || '');

    const [location, setLocation] = useState(profile.location || '');
    const [headline, setHeadline] = useState(profile.headline || '');
    const [bio, setBio] = useState(profile.biography || '');

    // New fields for your updated DTO
    const [expectedSalary, setExpectedSalary] = useState('');
    const [candidateType, setCandidateType] = useState('PROFESSIONAL');
    const [educationType, setEducationType] = useState('BACHELOR');

    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [birthday, setBirthday] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);

        const payload = {
            firstName,
            middleName: middleName.trim() === '' ? undefined : middleName,
            lastName,
            birthday: birthday ? birthday : null, // Add this!
            location,
            headline,
            biography: bio,
            expectedSalary: expectedSalary ? parseFloat(expectedSalary) : null,
            candidateType,
            educationType,
            skills: []
        };

        try {
            // Updated to match your exact backend endpoint
            await apiClient.put('/api/v1/profiles/candidate/complete', payload);

            // Unlock the dashboard in React state!
            onComplete({
                ...profile,
                firstName,
                middleName: middleName.trim() === '' ? undefined : middleName,
                lastName,
                fullName: `${firstName} ${lastName}`.trim(),
                location,
                headline,
                biography: bio,
                birthday,
                expectedSalary: expectedSalary ? parseFloat(expectedSalary) : undefined,
                candidateType,
                educationType,
                isCompleted: true
            });
        } catch (err: any) {
            console.error("Failed to complete profile:", err);
            setError(err.response?.data?.message || "Възникна грешка при запазване на профила.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-professional-emerald/15 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-brand-blue/20 rounded-full blur-[100px]"></div>

            {/* Logout Button */}
            <div className="w-full max-w-3xl relative z-20 flex justify-end mb-4 animate-fade-in">
                <Button
                    variant="ghost"
                    onClick={onLogout}
                    className="text-grey-muted hover:text-red-600 hover:bg-red-50 font-bold uppercase tracking-wider text-xs rounded-xl"
                >
                    <LogOut className="w-4 h-4 mr-2" /> Отказ и Изход
                </Button>
            </div>

            <div className="w-full max-w-3xl relative z-10 animate-fade-in">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-12 h-12 bg-brand-blue rounded-2xl flex items-center justify-center shadow-inner mb-4">
                        <Sparkles className="w-7 h-7 text-white"/>
                    </div>
                    <h1 className="text-3xl font-display font-black tracking-tight text-grey-dark">
                        Добре дошли{firstName ? `, ${firstName}` : ''}!
                    </h1>
                    <p className="text-grey-muted mt-2">Нека завършим вашия профил, за да активираме AI съвпаденията.</p>
                </div>

                <Card className="rounded-3xl border-[#c6c6cd]/50 shadow-xl bg-white/70 backdrop-blur-xl">
                    <CardHeader className="pb-4 border-b border-[#c6c6cd]/30">
                        <CardTitle className="text-xl font-bold text-grey-dark">Основна Информация</CardTitle>
                        {error && <p className="text-red-500 text-sm font-semibold mt-2">{error}</p>}
                    </CardHeader>
                    <CardContent className="pt-6">
                        <form onSubmit={handleSubmit} className="space-y-6">

                            {/* Row 1: Names */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2 relative">
                                    <Label className="text-xs font-bold text-grey-dark uppercase tracking-wider">Име</Label>
                                    <div className="relative">
                                        <Input
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            placeholder="напр. Иван"
                                            className="pl-10 h-12 rounded-xl border-[#c6c6cd]/60 bg-white/50"
                                            required
                                        />
                                        <User className="w-4.5 h-4.5 absolute left-3.5 top-3.5 text-grey-muted"/>
                                    </div>
                                </div>
                                <div className="space-y-2 relative">
                                    <Label className="text-xs font-bold text-grey-dark uppercase tracking-wider">Презиме (Опц.)</Label>
                                    <Input
                                        value={middleName}
                                        onChange={(e) => setMiddleName(e.target.value)}
                                        placeholder="напр. Георгиев"
                                        className="h-12 rounded-xl border-[#c6c6cd]/60 bg-white/50 px-3"
                                    />
                                </div>
                                <div className="space-y-2 relative">
                                    <Label className="text-xs font-bold text-grey-dark uppercase tracking-wider">Фамилия</Label>
                                    <Input
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        placeholder="напр. Иванов"
                                        className="h-12 rounded-xl border-[#c6c6cd]/60 bg-white/50 px-3"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 relative">
                                <Label className="text-xs font-bold text-grey-dark uppercase tracking-wider">Дата на раждане</Label>
                                <Input
                                    type="date"
                                    value={birthday}
                                    onChange={(e) => setBirthday(e.target.value)}
                                    className="h-12 rounded-xl border-[#c6c6cd]/60 bg-white/50 px-3"
                                    required // Add this if you keep @NotNull on the backend
                                />
                            </div>

                            {/* Row 2: Location & Headline */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2 relative">
                                    <Label className="text-xs font-bold text-grey-dark uppercase tracking-wider">Град / Държава</Label>
                                    <div className="relative">
                                        <Input
                                            value={location}
                                            onChange={(e) => setLocation(e.target.value)}
                                            placeholder="напр. София, България"
                                            className="pl-10 h-12 rounded-xl border-[#c6c6cd]/60 bg-white/50"
                                            required
                                        />
                                        <MapPin className="w-4.5 h-4.5 absolute left-3.5 top-3.5 text-grey-muted"/>
                                    </div>
                                </div>

                                <div className="space-y-2 relative">
                                    <Label className="text-xs font-bold text-grey-dark uppercase tracking-wider">Текуща Позиция / Титла</Label>
                                    <div className="relative">
                                        <Input
                                            value={headline}
                                            onChange={(e) => setHeadline(e.target.value)}
                                            placeholder="напр. Junior Java Developer"
                                            className="pl-10 h-12 rounded-xl border-[#c6c6cd]/60 bg-white/50"
                                            required
                                        />
                                        <Briefcase className="w-4.5 h-4.5 absolute left-3.5 top-3.5 text-grey-muted"/>
                                    </div>
                                </div>
                            </div>

                            {/* Row 3: Enums and Salary */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2 relative">
                                    <Label className="text-xs font-bold text-grey-dark uppercase tracking-wider">Тип Кандидат</Label>
                                    <select
                                        value={candidateType}
                                        onChange={(e) => setCandidateType(e.target.value)}
                                        className="flex h-12 w-full rounded-xl border border-[#c6c6cd]/60 bg-white/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                                    >
                                        <option value="PROFESSIONAL">Професионалист</option>
                                        <option value="ACADEMIC">Академик / Студент</option>
                                        <option value="ACADEMIC_STAFF">Академичен Персонал</option>
                                    </select>
                                </div>
                                <div className="space-y-2 relative">
                                    <Label className="text-xs font-bold text-grey-dark uppercase tracking-wider">Образование</Label>
                                    <div className="relative">
                                        <select
                                            value={educationType}
                                            onChange={(e) => setEducationType(e.target.value)}
                                            className="flex h-12 w-full pl-10 rounded-xl border border-[#c6c6cd]/60 bg-white/50 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                                        >
                                            <option value="HIGH_SCHOOL">Средно</option>
                                            <option value="PROFESSIONAL_BACHELOR">Професионален Бакалавър</option>
                                            <option value="BACHELOR">Бакалавър</option>
                                            <option value="MASTER">Магистър</option>
                                            <option value="PHD">Доктор (PhD)</option>
                                        </select>
                                        <GraduationCap className="w-4.5 h-4.5 absolute left-3.5 top-3.5 text-grey-muted"/>
                                    </div>
                                </div>
                                <div className="space-y-2 relative">
                                    <Label className="text-xs font-bold text-grey-dark uppercase tracking-wider">Очаквана Заплата</Label>
                                    <div className="relative">
                                        <Input
                                            type="number"
                                            value={expectedSalary}
                                            onChange={(e) => setExpectedSalary(e.target.value)}
                                            placeholder="напр. 3000"
                                            className="pl-10 h-12 rounded-xl border-[#c6c6cd]/60 bg-white/50"
                                        />
                                        <Banknote className="w-4.5 h-4.5 absolute left-3.5 top-3.5 text-grey-muted"/>
                                    </div>
                                </div>
                            </div>

                            {/* Row 4: Bio */}
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-grey-dark uppercase tracking-wider">Относно мен (Biography)</Label>
                                <Textarea
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    placeholder="Разкажете ни накратко за вашия опит и кариерни цели..."
                                    className="min-h-[100px] rounded-xl border-[#c6c6cd]/60 bg-white/50 resize-none"
                                />
                            </div>

                            {/* Note on skills */}
                            <p className="text-xs text-grey-muted italic text-center">
                                Уменията и линковете към портфолио могат да бъдат добавени по-късно през настройките на профила ви.
                            </p>

                            <div className="pt-4 border-t border-[#c6c6cd]/30 flex justify-end">
                                <Button
                                    type="submit"
                                    disabled={isSaving}
                                    className="h-12 px-8 rounded-xl bg-brand-blue hover:bg-brand-blue-dark text-white font-bold shadow-md transition-transform hover:scale-[1.02]"
                                >
                                    {isSaving ? 'Запазване...' : 'Завърши Профила'}
                                    <ChevronRight className="w-5 h-5 ml-2"/>
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}