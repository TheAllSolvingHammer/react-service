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
                    <Input placeholder="Позиция (напр. Developer)"
                           onChange={(e) => setFormData({...formData, title: e.target.value})} required/>
                    <Input placeholder="Организация"
                           onChange={(e) => setFormData({...formData, organization: e.target.value})} required/>
                    <Input type="date" onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                           required/>
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