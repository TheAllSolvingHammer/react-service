import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {Sparkles, Mail, Lock, ArrowRight, Loader2, AlertCircle, CheckCircle2} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import apiClient from '@/lib/axios';
import { parseJwt } from "@/lib/utils.ts";
import AuthToolbar from '@/components/shared/AuthToolbar';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const loginSchema = z.object({
    username: z.string()
        .min(1, "Потребителското име / Имейлът е задължителен")
        .min(3, "Трябва да съдържа поне 3 символа"),
    password: z.string()
        .min(1, "Паролата е задължителна")
        .min(6, "Паролата трябва да е поне 6 символа")
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login({ onNavigateToRegister, onNavigateToForgotPassword, onLoginSuccess }: { onNavigateToRegister: () => void, onNavigateToForgotPassword: () => void, onLoginSuccess: () => void }) {    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(false);
    const [globalError, setGlobalError] = useState<string | null>(null);
    const [globalSuccess, setGlobalSuccess] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            username: '',
            password: ''
        }
    });

    const onSubmit = async (data: LoginFormValues) => {
        if (isLoading) return;
        setIsLoading(true);
        setGlobalError(null);

        try {
            const payload = {
                username: data.username,
                password: data.password
            };

            const response = await apiClient.post('/api/v1/auth/login', payload);
            const token = response.data.token;
            // Jackson could serialize it as 'restricted' or 'isRestricted' depending on the exact Jackson version/config.
            // Also explicitly check boolean true
            const isRestrictedUser = response.data.restricted === true || response.data.isRestricted === true;
            const email = response.data.email;
            const decodedToken = parseJwt(token);

            if (decodedToken) {
                localStorage.setItem('jwt_token', token);
                localStorage.setItem('is_restricted', isRestrictedUser ? 'true' : 'false');
                if (email) {
                    localStorage.setItem('user_email', email);
                }

                const backendRole = decodedToken.role.toUpperCase();
                const frontendRole = backendRole === 'ADMIN'
                    ? 'admin'
                    : (backendRole === 'INSTITUTION' || backendRole === 'RECRUITER')
                        ? 'recruiter'
                        : 'candidate';

                localStorage.setItem('user_role', frontendRole);
                localStorage.setItem('user_id', decodedToken.userId);
                setGlobalSuccess(t('auth.loginSuccess', 'Успешен вход! Зареждане на профила...'));
                setTimeout(() => {
                    onLoginSuccess();
                }, 1200);
            } else {
                setGlobalError("Невалиден формат на токена.");
            }
        } catch (error: any) {
            console.error("Login failed:", error);
            if (error.response?.status === 401 || error.response?.status === 403) {
                setGlobalError("Грешно потребителско име или парола.");
            } else {
                setGlobalError("Възникна сървърна грешка. Моля, опитайте по-късно.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            <AuthToolbar />
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-brand-blue/20 dark:bg-brand-blue/10 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-academic-purple/20 dark:bg-academic-purple/10 rounded-full blur-[100px]"></div>

            <div className="w-full max-w-md relative z-10 animate-fade-in">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-12 h-12 bg-brand-blue rounded-2xl flex items-center justify-center shadow-inner mb-4">
                        <Sparkles className="w-7 h-7 text-white" />
                    </div>
                    <span className="text-3xl font-display font-black tracking-tight text-grey-dark dark:text-white">
                        Recruit<span className="text-brand-blue">AI</span>
                    </span>
                </div>

                <Card className="rounded-3xl border-[#c6c6cd]/50 dark:border-white/10 shadow-xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl">
                    <CardHeader className="text-center pb-2">
                        <CardTitle className="text-2xl font-bold text-grey-dark dark:text-white">{t('auth.loginTitle')}</CardTitle>
                        <p className="text-sm text-grey-muted mt-2">{t('auth.loginSubtitle')}</p>
                    </CardHeader>
                    <CardContent className="pt-6">

                        {/* Показваме глобални грешки от бекенда тук */}
                        {globalError && (
                            <div className="mb-4 p-3 bg-red-50/80 border border-red-200 rounded-xl flex items-start gap-2 text-red-600 text-sm font-medium animate-fade-in">
                                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                <span>{globalError}</span>
                            </div>
                        )}

                        {/* Успех */}
                        {globalSuccess && (
                            <div className="mb-4 p-3 bg-green-50/80 border border-green-200 rounded-xl flex items-start gap-2 text-green-700 text-sm font-medium animate-fade-in">
                                <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                                <span>{globalSuccess}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                            <div className="space-y-2 relative">
                                <Label htmlFor="username" className="text-xs font-bold text-grey-dark dark:text-slate-300 uppercase tracking-wider">{t('auth.username', 'Потребителско име')}</Label>
                                <div className="relative">
                                    <Input
                                        id="username"
                                        type="text"
                                        {...register('username')}
                                        className={`pl-10 h-12 rounded-xl bg-white/50 dark:bg-slate-800/50 text-grey-dark dark:text-white focus-visible:ring-brand-blue shadow-sm ${errors.username ? 'border-red-400 focus-visible:ring-red-400' : 'border-[#c6c6cd]/60 dark:border-white/10'}`}
                                    />
                                    <Mail className={`w-4.5 h-4.5 absolute left-3.5 top-3.5 ${errors.username ? 'text-red-400' : 'text-grey-muted'}`} />
                                </div>
                                {/* Показваме Zod грешката за username */}
                                {errors.username && (
                                    <p className="text-xs text-red-500 font-bold mt-1 flex items-center gap-1 animate-fade-in">
                                        <AlertCircle className="w-3 h-3" /> {errors.username.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <Label htmlFor="password" className="text-xs font-bold text-grey-dark dark:text-slate-300 uppercase tracking-wider">{t('auth.password')}</Label>
                                    <button
                                        type="button"
                                        onClick={onNavigateToForgotPassword}
                                        className="text-xs font-bold text-brand-blue hover:underline bg-transparent border-none p-0 cursor-pointer"
                                    >
                                        {t('auth.forgotPassword')}
                                    </button>
                                </div>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type="password"
                                        {...register('password')}
                                        className={`pl-10 h-12 rounded-xl bg-white/50 dark:bg-slate-800/50 text-grey-dark dark:text-white focus-visible:ring-brand-blue shadow-sm ${errors.password ? 'border-red-400 focus-visible:ring-red-400' : 'border-[#c6c6cd]/60 dark:border-white/10'}`}
                                    />
                                    <Lock className={`w-4.5 h-4.5 absolute left-3.5 top-3.5 ${errors.password ? 'text-red-400' : 'text-grey-muted'}`} />
                                </div>
                                {/* Показваме Zod грешката за password */}
                                {errors.password && (
                                    <p className="text-xs text-red-500 font-bold mt-1 flex items-center gap-1 animate-fade-in">
                                        <AlertCircle className="w-3 h-3" /> {errors.password.message}
                                    </p>
                                )}
                            </div>

                            <Button type="submit" disabled={isLoading} className="w-full h-12 rounded-xl bg-brand-blue hover:bg-brand-blue-dark text-white font-bold text-sm shadow-md mt-4 transition-transform hover:scale-[1.02]">
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        {t('auth.loadingDots')}
                                    </>
                                ) : (
                                    <>
                                        {t('auth.signIn')} <ArrowRight className="w-4 h-4 ml-2" />
                                    </>
                                )}
                            </Button>
                        </form>

                        <div className="mt-8 text-center border-t border-[#c6c6cd]/30 pt-6">
                            <p className="text-sm text-grey-muted font-medium">
                                {t('auth.noAccount')}{' '}
                                <button onClick={onNavigateToRegister} className="text-brand-blue font-bold hover:underline">
                                    {t('auth.signUp')}
                                </button>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}