import {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Briefcase, Building2, CheckCircle2, DollarSign, FileText, Loader2, MapPin, Plus, Target, X as XIcon} from 'lucide-react';
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Label} from "@/components/ui/label";
import {createOpportunity} from '@/lib/opportunities';
import { fetchAllSkills, resolveSkillIds, SkillRecord } from '@/lib/skills';
import {Profile} from '@/lib/types';

interface RecruiterCreateOpportunityProps {
    onBack: () => void;
    profile?: Profile | null;
}

export default function RecruiterCreateOpportunity({onBack, profile}: RecruiterCreateOpportunityProps) {

    // @ts-ignore
    //todo use translation here
    const {t} = useTranslation();
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const [availableSkills, setAvailableSkills] = useState<SkillRecord[]>([]);
    const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
    const [skillInput, setSkillInput] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    useEffect(() => {
        fetchAllSkills().then(skills => {
            if (skills) setAvailableSkills(skills);
        }).catch(console.error);
    }, []);

    const filteredSkills = availableSkills.filter(s => 
        s.name.toLowerCase().includes(skillInput.toLowerCase()) && 
        !selectedSkills.includes(s.name)
    );

    const handleAddSkill = (skillName: string) => {
        if (skillName && !selectedSkills.includes(skillName)) {
            setSelectedSkills([...selectedSkills, skillName]);
        }
        setSkillInput('');
        setIsDropdownOpen(false);
    };

    const handleRemoveSkill = (skillName: string) => {
        setSelectedSkills(selectedSkills.filter(s => s !== skillName));
    };

    const [formData, setFormData] = useState({
        title: '',
        location: '',
        mode: 'PROFESSIONAL',
        startingPrice: '',
        endingPrice: '',
        description: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const skillIds = await resolveSkillIds(selectedSkills);
            const requirements = skillIds.map(id => ({ skillId: id, importance: 'MANDATORY' }));

            // Форматиране за бекенда
            const payload = {
                title: formData.title,
                location: formData.location,
                type: 'FULL_TIME',
                mode: formData.mode,
                startingPrice: formData.startingPrice ? parseFloat(formData.startingPrice) : 0,
                endingPrice: formData.endingPrice ? parseFloat(formData.endingPrice) : 0,
                description: formData.description,
                requirements: requirements
            };

            await createOpportunity(payload);
            setIsSuccess(true);
            setTimeout(() => {
                onBack();
            }, 2000);
        } catch (error) {
            console.error("Грешка при създаване на обява:", error);
            alert("Възникна грешка при запазването.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
                <div
                    className="w-20 h-20 bg-professional-emerald/10 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 className="w-10 h-10 text-professional-emerald"/>
                </div>
                <h2 className="text-3xl font-display font-bold text-grey-dark">Обявата е публикувана!</h2>
                <p className="text-grey-muted mt-2">Кандидатите вече могат да кандидатстват.</p>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-display font-extrabold text-grey-dark">Създай Обява</h1>
                    <p className="text-grey-muted mt-1">Публикувайте нова позиция или академична програма.</p>
                </div>
                <Button variant="outline" onClick={onBack} className="rounded-xl border-[#c6c6cd]">
                    Отказ
                </Button>
            </div>

            <form onSubmit={handleSubmit}>
                <Card
                    className="rounded-3xl border border-[#c6c6cd] shadow-lg bg-white dark:bg-slate-900 overflow-visible">
                    <CardHeader className="bg-brand-blue/5 border-b border-[#c6c6cd]/20 pb-6 rounded-t-3xl">
                        <CardTitle className="text-xl flex items-center gap-2">
                            <Briefcase className="w-5 h-5 text-brand-blue"/>
                            Основна Информация
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Заглавие */}
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-grey-dark uppercase tracking-wider">Заглавие на
                                    позицията</Label>
                                <Input
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                                    placeholder="напр. Senior Java Developer"
                                    className="h-11 rounded-xl bg-white dark:bg-slate-800 border-[#c6c6cd] focus-visible:ring-brand-blue"
                                />
                            </div>

                            {/* Локация / Институция */}
                            <div className="space-y-2">
                                <Label
                                    className="text-xs font-bold text-grey-dark uppercase tracking-wider flex items-center gap-1"><MapPin
                                    className="w-3 h-3"/> Локация</Label>
                                <Input
                                    required
                                    value={formData.location}
                                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                                    placeholder="София, България или Remote"
                                    className="h-11 rounded-xl bg-white dark:bg-slate-800 border-[#c6c6cd] focus-visible:ring-brand-blue"
                                />
                            </div>
                        </div>

                        {/* Тип на обявата (Professional vs Academic) */}
                        <div className="space-y-3 pt-2">
                            <Label className="text-xs font-bold text-grey-dark uppercase tracking-wider">Тип на
                                обявата</Label>
                            <div className={`grid ${profile?.isUniversity ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}>
                                <div
                                    onClick={() => setFormData({...formData, mode: 'PROFESSIONAL'})}
                                    className={`cursor-pointer rounded-2xl border-2 p-4 flex flex-col items-center gap-2 transition-all ${formData.mode === 'PROFESSIONAL' ? 'border-brand-blue bg-brand-blue/5' : 'border-[#c6c6cd]/30 hover:border-brand-blue/50'}`}
                                >
                                    <Building2
                                        className={`w-8 h-8 ${formData.mode === 'PROFESSIONAL' ? 'text-brand-blue' : 'text-grey-muted'}`}/>
                                    <span className="font-bold text-grey-dark">Професионална</span>
                                    <span className="text-xs text-center text-grey-muted">Работа, Стаж, Корпоративна позиция</span>
                                </div>
                                {profile?.isUniversity && (
                                    <div
                                        onClick={() => setFormData({...formData, mode: 'ACADEMIC'})}
                                        className={`cursor-pointer rounded-2xl border-2 p-4 flex flex-col items-center gap-2 transition-all ${formData.mode === 'ACADEMIC' ? 'border-academic-purple bg-academic-purple/5' : 'border-[#c6c6cd]/30 hover:border-academic-purple/50'}`}
                                    >
                                        <Target
                                            className={`w-8 h-8 ${formData.mode === 'ACADEMIC' ? 'text-academic-purple' : 'text-grey-muted'}`}/>
                                        <span className="font-bold text-grey-dark">Академична</span>
                                        <span className="text-xs text-center text-grey-muted">Магистратура, Докторантура, Проект</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Бюджет / Заплата */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                            <div className="space-y-2">
                                <Label
                                    className="text-xs font-bold text-grey-dark uppercase tracking-wider flex items-center gap-1"><DollarSign
                                    className="w-3 h-3"/> Заплата от (лв)</Label>
                                <Input
                                    type="number"
                                    value={formData.startingPrice}
                                    onChange={(e) => setFormData({...formData, startingPrice: e.target.value})}
                                    placeholder="напр. 2000"
                                    className="h-11 rounded-xl bg-white dark:bg-slate-800 border-[#c6c6cd] focus-visible:ring-brand-blue"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label
                                    className="text-xs font-bold text-grey-dark uppercase tracking-wider flex items-center gap-1"><DollarSign
                                    className="w-3 h-3"/> Заплата до (лв)</Label>
                                <Input
                                    type="number"
                                    value={formData.endingPrice}
                                    onChange={(e) => setFormData({...formData, endingPrice: e.target.value})}
                                    placeholder="напр. 5000"
                                    className="h-11 rounded-xl bg-white dark:bg-slate-800 border-[#c6c6cd] focus-visible:ring-brand-blue"
                                />
                            </div>
                        </div>

                        {/* Умения и Изисквания - MOVED ABOVE Description */}
                        <div className="space-y-3 pt-2">
                            <Label className="text-xs font-bold text-grey-dark uppercase tracking-wider">Изисквани умения</Label>
                            
                            <div className="relative">
                                <Input
                                    value={skillInput}
                                    onChange={(e) => {
                                        setSkillInput(e.target.value);
                                        setIsDropdownOpen(true);
                                    }}
                                    onFocus={() => setIsDropdownOpen(true)}
                                    placeholder="Потърси или добави ново умение..."
                                    className="h-11 rounded-xl bg-white dark:bg-slate-800 border-[#c6c6cd] focus-visible:ring-brand-blue"
                                />
                                {isDropdownOpen && skillInput && (
                                    <ul className="absolute z-50 mt-1 max-h-48 w-full overflow-auto rounded-xl border border-[#c6c6cd] bg-white dark:bg-slate-800 p-1 shadow-lg">
                                        {filteredSkills.length > 0 ? (
                                            filteredSkills.map(skill => (
                                                <li
                                                    key={skill.id}
                                                    onClick={() => handleAddSkill(skill.name)}
                                                    className="cursor-pointer rounded-lg px-3 py-2 text-sm text-grey-dark dark:text-white hover:bg-brand-blue/10 hover:text-brand-blue transition-colors"
                                                >
                                                    {skill.name}
                                                </li>
                                            ))
                                        ) : (
                                            <li
                                                onClick={() => handleAddSkill(skillInput)}
                                                className="cursor-pointer rounded-lg px-3 py-2 text-sm text-brand-blue hover:bg-brand-blue/10 transition-colors flex items-center"
                                            >
                                                <Plus className="w-4 h-4 mr-2" /> Добави "{skillInput}"
                                            </li>
                                        )}
                                    </ul>
                                )}
                            </div>

                            {selectedSkills.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {selectedSkills.map(skill => (
                                        <div key={skill} className="flex items-center gap-1 bg-brand-blue/10 text-brand-blue px-3 py-1.5 rounded-lg border border-brand-blue/20">
                                            <span className="text-sm font-bold">{skill}</span>
                                            <button 
                                                type="button" 
                                                onClick={() => handleRemoveSkill(skill)}
                                                className="hover:bg-brand-blue/20 rounded-full p-0.5 transition-colors"
                                            >
                                                <XIcon className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Описание - MOVED BELOW Skills */}
                        <div className="space-y-2 pt-2">
                            <Label
                                className="text-xs font-bold text-grey-dark uppercase tracking-wider flex items-center gap-1"><FileText
                                className="w-3 h-3"/> Описание</Label>
                            <Textarea
                                required
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                placeholder="Опишете позицията, отговорностите и какво предлагате..."
                                className="min-h-[150px] rounded-xl resize-none bg-white dark:bg-slate-800 border-[#c6c6cd] focus-visible:ring-brand-blue"
                            />
                        </div>

                    </CardContent>
                </Card>

                <div className="mt-6 flex justify-end">
                    <Button type="submit" disabled={isLoading}
                            className="h-12 px-8 rounded-xl bg-brand-blue hover:bg-brand-blue-dark text-white font-bold shadow-md">
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin"/> : <><Plus
                            className="w-5 h-5 mr-2"/> Публикувай Обява</>}
                    </Button>
                </div>
            </form>
        </div>
    );
}