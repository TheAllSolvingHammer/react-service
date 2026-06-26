import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {Sparkles, Mail, Lock, ArrowRight, Loader2} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import apiClient from '@/lib/axios';
import {parseJwt} from "@/lib/utils.ts";

export default function Login({ onNavigateToRegister, onLoginSuccess }: { onNavigateToRegister: () => void, onLoginSuccess: () => void }) {
    const [isLoading, setIsLoading] = useState(false);
    const { t } = useTranslation();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();
        if (isLoading)
            return;

        setIsLoading(true);
        try {
            const payload = {
                username: username,
                password: password
            };

            const response = await apiClient.post('/api/v1/auth/login', payload);

            const { token } = response.data;
            const decodedToken = parseJwt(token);

            if (decodedToken) {
                localStorage.setItem('jwt_token', token);
                const backendRole = decodedToken.role.toUpperCase();
                const frontendRole = (backendRole === 'INSTITUTION' || backendRole === 'RECRUITER')
                    ? 'recruiter'
                    : 'candidate';

                localStorage.setItem('user_role', frontendRole);
                localStorage.setItem('user_id', decodedToken.userId);

                onLoginSuccess();
            } else {
                console.error("Invalid token format received");
            }
        } catch (error) {
            console.error("Login failed:", error);
        }
        finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-brand-blue/20 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-academic-purple/20 rounded-full blur-[100px]"></div>

            <div className="w-full max-w-md relative z-10 animate-fade-in">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-12 h-12 bg-brand-blue rounded-2xl flex items-center justify-center shadow-inner mb-4">
                        <Sparkles className="w-7 h-7 text-white" />
                    </div>
                    <span className="text-3xl font-display font-black tracking-tight text-grey-dark">
            Recruit<span className="text-brand-blue">AI</span>
          </span>
                </div>

                <Card className="rounded-3xl border-[#c6c6cd]/50 shadow-xl bg-white/70 backdrop-blur-xl">
                    <CardHeader className="text-center pb-2">
                        <CardTitle className="text-2xl font-bold text-grey-dark">{t('auth.loginTitle')}</CardTitle>
                        <p className="text-sm text-grey-muted mt-2">{t('auth.loginSubtitle')}</p>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2 relative">
                                <Label htmlFor="username" className="text-xs font-bold text-grey-dark uppercase tracking-wider">{t('auth.email')}</Label>
                                <div className="relative">
                                    <Input
                                        id="username"
                                        type="username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="pl-10 h-12 rounded-xl border-[#c6c6cd]/60 bg-white/50 focus-visible:ring-brand-blue shadow-sm"
                                        required
                                    />
                                    <Mail className="w-4.5 h-4.5 absolute left-3.5 top-3.5 text-grey-muted" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <Label htmlFor="password" className="text-xs font-bold text-grey-dark uppercase tracking-wider">{t('auth.password')}</Label>
                                    <a href="#" className="text-xs font-bold text-brand-blue hover:underline">{t('auth.forgotPassword')}</a>
                                </div>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pl-10 h-12 rounded-xl border-[#c6c6cd]/60 bg-white/50 focus-visible:ring-brand-blue shadow-sm"
                                        required
                                    />
                                    <Lock className="w-4.5 h-4.5 absolute left-3.5 top-3.5 text-grey-muted" />
                                </div>
                            </div>

                            <Button type="submit" className="w-full h-12 rounded-xl bg-brand-blue hover:bg-brand-blue-dark text-white font-bold text-sm shadow-md mt-4 transition-transform hover:scale-[1.02]">
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