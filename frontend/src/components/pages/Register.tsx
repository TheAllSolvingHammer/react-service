import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {AlertCircle, ArrowRight, Building2, CheckCircle2, Loader2, Lock, Mail, Sparkles, User} from 'lucide-react';
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import apiClient from '@/lib/axios';

import {z} from 'zod';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';

export default function Register({onNavigateToLogin, onRegisterSuccess}: {
    onNavigateToLogin: () => void,
    onRegisterSuccess: (role: 'candidate' | 'recruiter') => void
}) {
    const {t} = useTranslation();
    const [isLoading, setIsLoading] = useState(false);
    const [globalError, setGlobalError] = useState<string | null>(null);
    const [globalSuccess, setGlobalSuccess] = useState<string | null>(null);


    const [selectedRole, setSelectedRole] = useState<'CANDIDATE' | 'INSTITUTION'>('CANDIDATE');

    const registerSchema = z.object({
        username: z.string().min(3, t('validation.usernameMin', 'Името трябва да е поне 3 символа')),
        email: z.string().email(t('validation.invalidEmail', 'Невалиден имейл')),
        password: z.string().min(6, t('validation.passwordMin', 'Минимум 6 символа')),
        confirmPassword: z.string()
    }).refine((data) => data.password === data.confirmPassword, {
        message: t('validation.passwordsMatch', 'Паролите не съвпадат'),
        path: ["confirmPassword"]
    });

    type RegisterFormValues = z.infer<typeof registerSchema>;

    const {
        register,
        handleSubmit,
        formState: {errors}
    } = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            username: '',
            email: '',
            password: '',
            confirmPassword: ''
        }
    });

    const onSubmit = async (data: RegisterFormValues) => {
        if (isLoading) return;
        setIsLoading(true);
        setGlobalError(null);

        try {
            const payload = {
                username: data.username,
                email: data.email,
                password: data.password,
                role: selectedRole
            };

            await apiClient.post('/api/v1/auth/register', payload);

            const frontendRole = selectedRole === 'INSTITUTION' ? 'recruiter' : 'candidate';
            setGlobalSuccess(t('auth.registerSuccess', 'Успешна регистрация! Пренасочване...'));

            setTimeout(() => {
                onRegisterSuccess(frontendRole);
            }, 1200);

        } catch (error: any) {
            console.error("Registration failed:", error);
            if (error.response?.status === 409) {
                setGlobalError("Този имейл или потребителско име вече съществува.");
            } else {
                setGlobalError("Възникна грешка при регистрацията. Моля, опитайте отново.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            <div
                className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-brand-blue/20 rounded-full blur-[100px]"></div>
            <div
                className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-academic-purple/20 rounded-full blur-[100px]"></div>

            <div className="w-full max-w-md relative z-10 animate-fade-in">
                <div className="flex flex-col items-center mb-6">
                    <div
                        className="w-12 h-12 bg-brand-blue rounded-2xl flex items-center justify-center shadow-inner mb-4">
                        <Sparkles className="w-7 h-7 text-white"/>
                    </div>
                    <span className="text-3xl font-display font-black tracking-tight text-grey-dark">
                        Recruit<span className="text-brand-blue">AI</span>
                    </span>
                </div>

                <Card className="rounded-3xl border-[#c6c6cd]/50 shadow-xl bg-white/70 backdrop-blur-xl">
                    <CardHeader className="text-center pb-2">
                        <CardTitle className="text-2xl font-bold text-grey-dark">{t('auth.registerTitle')}</CardTitle>
                        <p className="text-sm text-grey-muted mt-2">{t('auth.registerSubtitle')}</p>
                    </CardHeader>
                    <CardContent className="pt-4">

                        {globalError && (
                            <div
                                className="mb-4 p-3 bg-red-50/80 border border-red-200 rounded-xl flex items-start gap-2 text-red-600 text-sm font-medium animate-fade-in">
                                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0"/>
                                <span>{globalError}</span>
                            </div>
                        )}

                        {globalSuccess && (
                            <div
                                className="mb-4 p-3 bg-green-50/80 border border-green-200 rounded-xl flex items-start gap-2 text-green-700 text-sm font-medium animate-fade-in">
                                <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0"/>
                                <span>{globalSuccess}</span>
                            </div>
                        )}

                        {/* Избор на роля */}
                        <div className="flex gap-2 p-1 bg-slate-100 rounded-xl mb-6">
                            <button
                                type="button"
                                onClick={() => setSelectedRole('CANDIDATE')}
                                className={`flex-1 py-2 px-3 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-2 ${selectedRole === 'CANDIDATE' ? 'bg-white text-blue-900 shadow-sm' : 'text-slate-500 hover:bg-slate-200'}`}
                            >
                                <User className="w-4 h-4"/> {t('auth.roleCandidate')}
                            </button>
                            <button
                                type="button"
                                onClick={() => setSelectedRole('INSTITUTION')}
                                className={`flex-1 py-2 px-3 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-2 ${selectedRole === 'INSTITUTION' ? 'bg-white text-purple-900 shadow-sm' : 'text-slate-500 hover:bg-slate-200'}`}
                            >
                                <Building2 className="w-4 h-4"/> {t('auth.roleInstitution')}
                            </button>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                            {/* Име */}
                            <div className="space-y-1">
                                <Label
                                    className="text-xs font-bold text-grey-dark uppercase tracking-wider">{t('auth.fullName')}</Label>
                                <div className="relative">
                                    <Input
                                        type="text"
                                        {...register('username')}
                                        className={`pl-10 h-11 rounded-xl bg-white/50 focus-visible:ring-brand-blue ${errors.username ? 'border-red-400' : 'border-[#c6c6cd]/60'}`}
                                    />
                                    <User
                                        className={`w-4 h-4 absolute left-3.5 top-3.5 ${errors.username ? 'text-red-400' : 'text-grey-muted'}`}/>
                                </div>
                                {errors.username &&
                                    <p className="text-xs text-red-500 font-bold mt-1 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3"/>{errors.username.message}</p>}
                            </div>

                            {/* Имейл */}
                            <div className="space-y-1">
                                <Label
                                    className="text-xs font-bold text-grey-dark uppercase tracking-wider">{t('auth.email')}</Label>
                                <div className="relative">
                                    <Input
                                        type="email"
                                        {...register('email')}
                                        className={`pl-10 h-11 rounded-xl bg-white/50 focus-visible:ring-brand-blue ${errors.email ? 'border-red-400' : 'border-[#c6c6cd]/60'}`}
                                    />
                                    <Mail
                                        className={`w-4 h-4 absolute left-3.5 top-3.5 ${errors.email ? 'text-red-400' : 'text-grey-muted'}`}/>
                                </div>
                                {errors.email &&
                                    <p className="text-xs text-red-500 font-bold mt-1 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3"/>{errors.email.message}</p>}
                            </div>

                            {/* Парола */}
                            <div className="space-y-1">
                                <Label
                                    className="text-xs font-bold text-grey-dark uppercase tracking-wider">{t('auth.password')}</Label>
                                <div className="relative">
                                    <Input
                                        type="password"
                                        {...register('password')}
                                        className={`pl-10 h-11 rounded-xl bg-white/50 focus-visible:ring-brand-blue ${errors.password ? 'border-red-400' : 'border-[#c6c6cd]/60'}`}
                                    />
                                    <Lock
                                        className={`w-4 h-4 absolute left-3.5 top-3.5 ${errors.password ? 'text-red-400' : 'text-grey-muted'}`}/>
                                </div>
                                {errors.password &&
                                    <p className="text-xs text-red-500 font-bold mt-1 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3"/>{errors.password.message}</p>}
                            </div>

                            {/* Потвърди Парола */}
                            <div className="space-y-1">
                                <Label
                                    className="text-xs font-bold text-grey-dark uppercase tracking-wider">{t('auth.confirmPassword')}</Label>
                                <div className="relative">
                                    <Input
                                        type="password"
                                        {...register('confirmPassword')}
                                        className={`pl-10 h-11 rounded-xl bg-white/50 focus-visible:ring-brand-blue ${errors.confirmPassword ? 'border-red-400' : 'border-[#c6c6cd]/60'}`}
                                    />
                                    <Lock
                                        className={`w-4 h-4 absolute left-3.5 top-3.5 ${errors.confirmPassword ? 'text-red-400' : 'text-grey-muted'}`}/>
                                </div>
                                {errors.confirmPassword &&
                                    <p className="text-xs text-red-500 font-bold mt-1 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3"/>{errors.confirmPassword.message}</p>}
                            </div>

                            <Button type="submit" disabled={isLoading}
                                    className="w-full h-12 rounded-xl bg-brand-blue hover:bg-brand-blue-dark text-white font-bold text-sm shadow-md mt-6 transition-transform hover:scale-[1.02]">
                                {isLoading ? (
                                    <><Loader2 className="w-4 h-4 mr-2 animate-spin"/> {t('auth.registeringDots')}</>
                                ) : (
                                    <>{t('auth.signUp')} <ArrowRight className="w-4 h-4 ml-2"/></>
                                )}
                            </Button>
                        </form>

                        <div className="mt-6 text-center border-t border-[#c6c6cd]/30 pt-6">
                            <p className="text-sm text-grey-muted font-medium">
                                {t('auth.haveAccount')}{' '}
                                <button onClick={onNavigateToLogin}
                                        className="text-brand-blue font-bold hover:underline">
                                    {t('auth.signIn')}
                                </button>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}