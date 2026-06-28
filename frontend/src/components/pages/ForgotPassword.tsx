import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, Lock, ArrowRight, ArrowLeft, Loader2, AlertCircle, CheckCircle2, KeyRound } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import apiClient from '@/lib/axios';
import AuthToolbar from '@/components/shared/AuthToolbar';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

export default function ForgotPassword({ onNavigateToLogin }: { onNavigateToLogin: () => void }) {
    const { t } = useTranslation();
    const [step, setStep] = useState<1 | 2>(1);
    const [isLoading, setIsLoading] = useState(false);
    const [globalError, setGlobalError] = useState<string | null>(null);
    const [globalSuccess, setGlobalSuccess] = useState<string | null>(null);
    const [userEmail, setUserEmail] = useState('');

    // --- ZOD СХЕМИ ЗА ВАЛИДАЦИЯ ---
    const step1Schema = z.object({
        email: z.string().email(t('validation.invalidEmail', 'Невалиден имейл адрес'))
    });

    const step2Schema = z.object({
        otpCode: z.string().length(6, t('validation.otpLength', 'Кодът трябва да е точно 6 символа')),
        newPassword: z.string().min(6, t('validation.passwordMin', 'Паролата трябва да е поне 6 символа')),
        confirmPassword: z.string()
    }).refine((data) => data.newPassword === data.confirmPassword, {
        message: t('validation.passwordsMatch', 'Паролите не съвпадат'),
        path: ["confirmPassword"]
    });

    type Step1Values = z.infer<typeof step1Schema>;
    type Step2Values = z.infer<typeof step2Schema>;

    const formStep1 = useForm<Step1Values>({ resolver: zodResolver(step1Schema), defaultValues: { email: '' } });
    const formStep2 = useForm<Step2Values>({ resolver: zodResolver(step2Schema), defaultValues: { otpCode: '', newPassword: '', confirmPassword: '' } });

    const onStep1Submit = async (data: Step1Values) => {
        setIsLoading(true);
        setGlobalError(null);
        try {
            await apiClient.post('/api/v1/auth/forgot-password', { email: data.email });
            setUserEmail(data.email);
            setGlobalSuccess(t('auth.otpSentSuccess', 'Кодът е изпратен успешно на вашия имейл!'));
            setTimeout(() => {
                setGlobalSuccess(null);
                setStep(2); // Преминаваме на стъпка 2
            }, 1500);
        } catch (error: any) {
            console.error(error);
            setGlobalError(error.response?.status === 404
                ? t('auth.emailNotFound', 'Потребител с този имейл не съществува.')
                : t('auth.serverError', 'Възникна грешка. Моля, опитайте по-късно.'));
        } finally {
            setIsLoading(false);
        }
    };

    const onStep2Submit = async (data: Step2Values) => {
        setIsLoading(true);
        setGlobalError(null);
        try {
            await apiClient.post('/api/v1/auth/reset-password', {
                email: userEmail,
                otpCode: data.otpCode.toUpperCase(),
                newPassword: data.newPassword
            });

            setGlobalSuccess(t('auth.passwordResetSuccess', 'Паролата е променена успешно! Пренасочване...'));
            setTimeout(() => {
                onNavigateToLogin();
            }, 1500);
        } catch (error: any) {
            console.error(error);
            setGlobalError(t('auth.invalidOtp', 'Невалиден или изтекъл OTP код.'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            <AuthToolbar />
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-brand-blue/20 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-academic-purple/20 rounded-full blur-[100px]"></div>

            <div className="w-full max-w-md relative z-10 animate-fade-in">
                <div className="flex flex-col items-center mb-6">
                    <div className="w-12 h-12 bg-brand-blue rounded-2xl flex items-center justify-center shadow-inner mb-4">
                        <KeyRound className="w-7 h-7 text-white" />
                    </div>
                    <span className="text-3xl font-display font-black tracking-tight text-grey-dark">
                        Recruit<span className="text-brand-blue">AI</span>
                    </span>
                </div>

                <Card className="rounded-3xl border-[#c6c6cd]/50 shadow-xl bg-white/70 backdrop-blur-xl">
                    <CardHeader className="text-center pb-2">
                        <CardTitle className="text-2xl font-bold text-grey-dark">
                            {step === 1 ? t('auth.forgotTitle', 'Забравена парола') : t('auth.resetTitle', 'Въвеждане на нов код')}
                        </CardTitle>
                        <p className="text-sm text-grey-muted mt-2">
                            {step === 1
                                ? t('auth.forgotSubtitle', 'Въведете имейла си, за да ви изпратим 6-цифрен OTP код.')
                                : t('auth.resetSubtitle', 'Въведете получения код и новата си парола.')}
                        </p>
                    </CardHeader>
                    <CardContent className="pt-4">

                        {globalError && (
                            <div className="mb-4 p-3 bg-red-50/80 border border-red-200 rounded-xl flex items-start gap-2 text-red-600 text-sm font-medium animate-fade-in">
                                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                <span>{globalError}</span>
                            </div>
                        )}

                        {globalSuccess && (
                            <div className="mb-4 p-3 bg-green-50/80 border border-green-200 rounded-xl flex items-start gap-2 text-green-700 text-sm font-medium animate-fade-in">
                                <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                                <span>{globalSuccess}</span>
                            </div>
                        )}

                        {/* --- ФОРМА СТЪПКА 1 --- */}
                        {step === 1 && (
                            <form onSubmit={formStep1.handleSubmit(onStep1Submit)} className="space-y-5">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-grey-dark uppercase tracking-wider">{t('auth.email')}</Label>
                                    <div className="relative">
                                        <Input
                                            type="email"
                                            {...formStep1.register('email')}
                                            className={`pl-10 h-12 rounded-xl bg-white/50 focus-visible:ring-brand-blue ${formStep1.formState.errors.email ? 'border-red-400' : 'border-[#c6c6cd]/60'}`}
                                        />
                                        <Mail className="w-4.5 h-4.5 absolute left-3.5 top-3.5 text-grey-muted" />
                                    </div>
                                    {formStep1.formState.errors.email && <p className="text-xs text-red-500 font-bold mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{formStep1.formState.errors.email.message}</p>}
                                </div>

                                <Button type="submit" disabled={isLoading} className="w-full h-12 rounded-xl bg-brand-blue hover:bg-brand-blue-dark text-white font-bold text-sm shadow-md mt-4 transition-transform hover:scale-[1.02]">
                                    {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <>{t('auth.sendCode', 'Изпрати код')} <ArrowRight className="w-4 h-4 ml-2" /></>}
                                </Button>
                            </form>
                        )}

                        {/* --- ФОРМА СТЪПКА 2 --- */}
                        {step === 2 && (
                            <form onSubmit={formStep2.handleSubmit(onStep2Submit)} className="space-y-4">
                                {/* OTP Код */}
                                <div className="space-y-1">
                                    <Label className="text-xs font-bold text-grey-dark uppercase tracking-wider">{t('auth.otpCode', '6-символен код')}</Label>
                                    <Input
                                        type="text"
                                        maxLength={6}
                                        placeholder="A1B2C3"
                                        {...formStep2.register('otpCode')}
                                        className={`h-11 rounded-xl bg-white/50 text-center font-mono text-lg font-bold tracking-widest uppercase focus-visible:ring-brand-blue ${formStep2.formState.errors.otpCode ? 'border-red-400' : 'border-[#c6c6cd]/60'}`}
                                    />
                                    {formStep2.formState.errors.otpCode && <p className="text-xs text-red-500 font-bold mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{formStep2.formState.errors.otpCode.message}</p>}
                                </div>

                                {/* Нова Парола */}
                                <div className="space-y-1">
                                    <Label className="text-xs font-bold text-grey-dark uppercase tracking-wider">{t('auth.newPassword', 'Нова парола')}</Label>
                                    <div className="relative">
                                        <Input
                                            type="password"
                                            {...formStep2.register('newPassword')}
                                            className={`pl-10 h-11 rounded-xl bg-white/50 focus-visible:ring-brand-blue ${formStep2.formState.errors.newPassword ? 'border-red-400' : 'border-[#c6c6cd]/60'}`}
                                        />
                                        <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-grey-muted" />
                                    </div>
                                    {formStep2.formState.errors.newPassword && <p className="text-xs text-red-500 font-bold mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{formStep2.formState.errors.newPassword.message}</p>}
                                </div>

                                {/* Потвърди Парола */}
                                <div className="space-y-1">
                                    <Label className="text-xs font-bold text-grey-dark uppercase tracking-wider">{t('auth.confirmPassword')}</Label>
                                    <div className="relative">
                                        <Input
                                            type="password"
                                            {...formStep2.register('confirmPassword')}
                                            className={`pl-10 h-11 rounded-xl bg-white/50 focus-visible:ring-brand-blue ${formStep2.formState.errors.confirmPassword ? 'border-red-400' : 'border-[#c6c6cd]/60'}`}
                                        />
                                        <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-grey-muted" />
                                    </div>
                                    {formStep2.formState.errors.confirmPassword && <p className="text-xs text-red-500 font-bold mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{formStep2.formState.errors.confirmPassword.message}</p>}
                                </div>

                                <Button type="submit" disabled={isLoading} className="w-full h-12 rounded-xl bg-brand-blue hover:bg-brand-blue-dark text-white font-bold text-sm shadow-md mt-6 transition-transform hover:scale-[1.02]">
                                    {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <>{t('auth.updatePassword', 'Обнови паролата')} <ArrowRight className="w-4 h-4 ml-2" /></>}
                                </Button>
                            </form>
                        )}

                        {/* Назад към вход */}
                        <div className="mt-6 text-center border-t border-[#c6c6cd]/30 pt-4">
                            <button
                                type="button"
                                onClick={onNavigateToLogin}
                                className="inline-flex items-center text-sm font-bold text-brand-blue hover:underline bg-transparent border-none cursor-pointer gap-1.5 text-grey-muted hover:text-brand-blue transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" /> {t('auth.backToLogin', 'Назад към вход')}
                            </button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}