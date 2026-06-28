import {useState} from 'react';
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {createCandidateExperience} from '@/lib/experiences';
import {ApiExperienceMode} from '@/lib/mode';
import {Loader2} from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    candidateId: string;
}

export default function AddExperienceModal({isOpen, onClose, onSuccess, candidateId}: ModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        organization: '',
        description: '',
        startDate: '',
        endDate: '',
        currentlyActive: false,
        mode: 'PROFESSIONAL'
    });

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await createCandidateExperience({
                ...formData,
                candidateId,
                mode: formData.mode as ApiExperienceMode
            });
            onSuccess();
            onClose();
        } catch (err) {
            console.error("Грешка при добавяне:", err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-md shadow-2xl animate-fade-in">
                <h2 className="text-xl font-bold mb-4">Добави нов опит</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="mode" value="PROFESSIONAL" checked={formData.mode === 'PROFESSIONAL'} onChange={() => setFormData({...formData, mode: 'PROFESSIONAL'})} />
                            <span className="text-sm font-medium">Професионален</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="mode" value="ACADEMIC" checked={formData.mode === 'ACADEMIC'} onChange={() => setFormData({...formData, mode: 'ACADEMIC'})} />
                            <span className="text-sm font-medium">Академичен</span>
                        </label>
                    </div>

                    <Input placeholder="Позиция (напр. Developer)"
                           onChange={(e) => setFormData({...formData, title: e.target.value})} required/>
                    <Input placeholder="Организация"
                           onChange={(e) => setFormData({...formData, organization: e.target.value})} required/>
                           
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="text-xs text-grey-muted mb-1 block">Начална дата</label>
                            <Input type="date" onChange={(e) => setFormData({...formData, startDate: e.target.value})} required/>
                        </div>
                        <div className="flex-1">
                            <label className="text-xs text-grey-muted mb-1 block">Крайна дата</label>
                            <Input type="date" disabled={formData.currentlyActive} onChange={(e) => setFormData({...formData, endDate: e.target.value})}/>
                        </div>
                    </div>
                    
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={formData.currentlyActive} onChange={(e) => setFormData({...formData, currentlyActive: e.target.checked, endDate: e.target.checked ? '' : formData.endDate})} className="rounded border-gray-300 text-brand-blue shadow-sm focus:border-brand-blue focus:ring focus:ring-brand-blue focus:ring-opacity-50" />
                        <span className="text-sm text-grey-dark">Настояща позиция</span>
                    </label>

                    <Textarea placeholder="Описание"
                              onChange={(e) => setFormData({...formData, description: e.target.value})}/>

                    <div className="flex gap-3 pt-4">
                        <Button type="button" variant="ghost" onClick={onClose}>Отказ</Button>
                        <Button type="submit" className="flex-1 bg-brand-blue text-white" disabled={isLoading}>
                            {isLoading ? <Loader2 className="animate-spin"/> : 'Запази'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}