import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Briefcase, Building2, CheckCircle2, DollarSign, FileText, Loader2, MapPin, Plus, Target} from 'lucide-react';
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Label} from "@/components/ui/label";
import {createOpportunity} from '@/lib/opportunities';

interface RecruiterCreateOpportunityProps {
    onBack: () => void;
}

export default function RecruiterCreateOpportunity({onBack}: RecruiterCreateOpportunityProps) {

    // @ts-ignore
    //todo use translation here
    const {t} = useTranslation();
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

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
            // Форматиране за бекенда
            const payload = {
                title: formData.title,
                location: formData.location,
                mode: formData.mode,
                startingPrice: formData.startingPrice ? parseFloat(formData.startingPrice) : 0,
                endingPrice: formData.endingPrice ? parseFloat(formData.endingPrice) : 0,
                description: formData.description,
                requirements: [] // За в бъдеще: масив с ID-та на умения
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
                    className="rounded-3xl border border-[#c6c6cd]/40 shadow-lg bg-white dark:bg-slate-900 overflow-hidden">
                    <CardHeader className="bg-brand-blue/5 border-b border-[#c6c6cd]/20 pb-6">
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
                                    className="h-11 rounded-xl"
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
                                    className="h-11 rounded-xl"
                                />
                            </div>
                        </div>

                        {/* Тип на обявата (Professional vs Academic) */}
                        <div className="space-y-3 pt-2">
                            <Label className="text-xs font-bold text-grey-dark uppercase tracking-wider">Тип на
                                обявата</Label>
                            <div className="grid grid-cols-2 gap-4">
                                <div
                                    onClick={() => setFormData({...formData, mode: 'PROFESSIONAL'})}
                                    className={`cursor-pointer rounded-2xl border-2 p-4 flex flex-col items-center gap-2 transition-all ${formData.mode === 'PROFESSIONAL' ? 'border-brand-blue bg-brand-blue/5' : 'border-[#c6c6cd]/30 hover:border-brand-blue/50'}`}
                                >
                                    <Building2
                                        className={`w-8 h-8 ${formData.mode === 'PROFESSIONAL' ? 'text-brand-blue' : 'text-grey-muted'}`}/>
                                    <span className="font-bold text-grey-dark">Професионална</span>
                                    <span className="text-xs text-center text-grey-muted">Работа, Стаж, Корпоративна позиция</span>
                                </div>
                                <div
                                    onClick={() => setFormData({...formData, mode: 'ACADEMIC'})}
                                    className={`cursor-pointer rounded-2xl border-2 p-4 flex flex-col items-center gap-2 transition-all ${formData.mode === 'ACADEMIC' ? 'border-academic-purple bg-academic-purple/5' : 'border-[#c6c6cd]/30 hover:border-academic-purple/50'}`}
                                >
                                    <Target
                                        className={`w-8 h-8 ${formData.mode === 'ACADEMIC' ? 'text-academic-purple' : 'text-grey-muted'}`}/>
                                    <span className="font-bold text-grey-dark">Академична</span>
                                    <span className="text-xs text-center text-grey-muted">Магистратура, Докторантура, Проект</span>
                                </div>
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
                                    className="h-11 rounded-xl"
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
                                    className="h-11 rounded-xl"
                                />
                            </div>
                        </div>

                        {/* Описание */}
                        <div className="space-y-2 pt-2">
                            <Label
                                className="text-xs font-bold text-grey-dark uppercase tracking-wider flex items-center gap-1"><FileText
                                className="w-3 h-3"/> Описание и изисквания</Label>
                            <Textarea
                                required
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                placeholder="Опишете позицията, отговорностите и какво предлагате..."
                                className="min-h-[150px] rounded-xl resize-none"
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