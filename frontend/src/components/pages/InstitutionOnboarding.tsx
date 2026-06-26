import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Building2, GraduationCap, Loader2} from 'lucide-react';
import {Button} from "@/components/ui/button";
import {createInstitutionProfile} from '@/lib/profileApi';

interface InstitutionOnboardingProps {
    profile: any;
    onComplete: (profile: any) => void;
    onLogout: () => void;
}

export default function InstitutionOnboarding({profile, onComplete, onLogout}: InstitutionOnboardingProps) {
    const {t} = useTranslation();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);


    const [formData, setFormData] = useState({
        displayName: profile?.name || '',
        isUniversity: false,
        sectorName: 'Service',
        location: '',
        biography: '',
        websiteUrl: '',
        profilePictureUrl: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const {name, value} = e.target;
        setFormData(prev => ({...prev, [name]: value}));
    };

    const handleTypeChange = (isUni: boolean) => {
        setFormData(prev => ({
            ...prev,
            isUniversity: isUni,
            sectorName: isUni ? 'Unspecified' : 'Service'
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            await createInstitutionProfile(formData);
            onComplete({...profile, ...formData, isCompleted: true});
        } catch (err) {
            console.error("Грешка при създаване на институция:", err);
            setError(t('institutionOnboarding.errorMessage', 'Възникна грешка при запазването на профила. Моля, опитайте отново.'));
            setIsLoading(false);
        }
    };

    const headerGradient = formData.isUniversity
        ? "from-purple-900 to-indigo-900"
        : "from-blue-900 to-slate-900";

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <div className="max-w-2xl w-full bg-white rounded-3xl shadow-xl overflow-hidden animate-fade-in">

                {/* Header */}
                <div
                    className={`bg-gradient-to-r ${headerGradient} p-8 text-white text-center transition-colors duration-500`}>
                    <div
                        className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-4">
                        {formData.isUniversity ? <GraduationCap className="w-8 h-8"/> :
                            <Building2 className="w-8 h-8"/>}
                    </div>
                    <h1 className="text-3xl font-black mb-2">{t('institutionOnboarding.title', 'Настройка на профил')}</h1>
                    <p className="text-blue-100 opacity-90">{t('institutionOnboarding.subtitle', 'Попълнете данните за вашата организация')}</p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {error && (
                        <div
                            className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100 flex items-center">
                            {error}
                        </div>
                    )}

                    {/* Тип институция */}
                    <div className="flex gap-4 p-2 bg-slate-100 rounded-xl">
                        <button
                            type="button"
                            onClick={() => handleTypeChange(false)}
                            className={`flex-1 py-2.5 px-4 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 ${!formData.isUniversity ? 'bg-white text-blue-900 shadow-sm' : 'text-slate-500 hover:bg-slate-200'}`}
                        >
                            <Building2 className="w-4 h-4"/> {t('institutionOnboarding.company', 'Компания')}
                        </button>
                        <button
                            type="button"
                            onClick={() => handleTypeChange(true)}
                            className={`flex-1 py-2.5 px-4 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 ${formData.isUniversity ? 'bg-white text-purple-900 shadow-sm' : 'text-slate-500 hover:bg-slate-200'}`}
                        >
                            <GraduationCap className="w-4 h-4"/> {t('institutionOnboarding.university', 'Университет')}
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Име */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">
                                {formData.isUniversity
                                    ? t('institutionOnboarding.uniName', 'Име на университета')
                                    : t('institutionOnboarding.compName', 'Име на компанията')}
                            </label>
                            <input required name="displayName" value={formData.displayName} onChange={handleChange}
                                   className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                                   placeholder={formData.isUniversity ? "Технически Университет" : "Tech Solutions Ltd."}/>
                        </div>

                        {/* Сектор (САМО за компания) */}
                        {!formData.isUniversity && (
                            <div className="space-y-2 animate-fade-in">
                                <label className="text-sm font-bold text-gray-700">{t('institutionOnboarding.sector', 'Индустриален сектор')}</label>
                                <select name="sectorName" value={formData.sectorName} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-white outline-none">
                                    <option value="Service">{t('institutionOnboarding.sectors.service', 'Сфера на услугите (ИТ, Финанси, Търговия)')}</option>
                                    <option value="Secondary">{t('institutionOnboarding.sectors.secondary', 'Производство и Индустрия')}</option>
                                    <option value="Primary">{t('institutionOnboarding.sectors.primary', 'Суровини и Земеделие')}</option>
                                    <option value="Quaternary">{t('institutionOnboarding.sectors.quaternary', 'Наука и Изследователска дейност')}</option>
                                    <option value="Unspecified">{t('institutionOnboarding.sectors.unspecified', 'Друг / Неопределен')}</option>
                                </select>
                            </div>
                        )}

                        {/* Локация: Заема цял ред при компания, или е до името при университет */}
                        <div className={`space-y-2 ${!formData.isUniversity ? 'md:col-span-2' : ''}`}>
                            <label
                                className="text-sm font-bold text-gray-700">{t('institutionOnboarding.location', 'Локация')}</label>
                            <input required name="location" value={formData.location} onChange={handleChange}
                                   className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                                   placeholder={t('institutionOnboarding.locationPlaceholder', 'Напр. Варна, България')}/>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label
                            className="text-sm font-bold text-gray-700">{t('institutionOnboarding.website', 'Уебсайт')}</label>
                        <input name="websiteUrl" value={formData.websiteUrl} onChange={handleChange}
                               className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                               placeholder="https://..."/>
                    </div>

                    <div className="space-y-2">
                        <label
                            className="text-sm font-bold text-gray-700">{t('institutionOnboarding.biography', 'Описание (Биография)')}</label>
                        <textarea required name="biography" value={formData.biography} onChange={handleChange} rows={4}
                                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all resize-none outline-none"
                                  placeholder={t('institutionOnboarding.bioPlaceholder', 'Кратко описание...')}/>
                    </div>

                    <div
                        className="flex flex-col-reverse sm:flex-row justify-end items-center gap-3 pt-6 border-t border-gray-100">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onLogout}
                            className="w-full sm:w-auto h-11 px-6 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                        >
                            {t('institutionOnboarding.cancel', 'Отказ')}
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full sm:w-auto h-11 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md flex items-center justify-center"
                        >
                            {isLoading && <Loader2 className="w-4 h-4 animate-spin mr-2"/>}
                            {t('institutionOnboarding.submit', 'Завърши регистрацията')}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}