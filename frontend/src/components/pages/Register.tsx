import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, Mail, Lock, User, Briefcase, Building, ArrowRight, ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import apiClient from '@/lib/axios';
import {parseJwt} from "@/lib/utils.ts";

export default function Register({ onNavigateToLogin, onRegisterSuccess }: { onNavigateToLogin: () => void, onRegisterSuccess: (role: 'candidate' | 'recruiter') => void }) {
    const { t } = useTranslation();
    const [step, setStep] = useState<1 | 2>(1);

    // Step 1 State: Identity
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Step 2 State: Role
    const [selectedRole, setSelectedRole] = useState<'candidate' | 'recruiter' | null>(null);

    // UI State
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleClearForm = () => {
        setName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setError(null);
    };

    const handleIdentitySubmit = (e: React.SubmitEvent) => {
        e.preventDefault();
        setError(null);

        // 1. Frontend Validations (Matching your Java Spring Boot constraints)
        if (name.trim().length < 3) {
            setError(t('auth.shortName'));
            return;
        }
        if (password.length < 6) {
            setError(t('auth.shortPassword'));
            return;
        }
        if (password !== confirmPassword) {
            setError(t('auth.passwordsDoNotMatch'));
            return;
        }

        // Passed validations, move to role selection
        setStep(2);
    };

    const handleFinalSubmit = async () => {
        if (!selectedRole) return;
        setIsSubmitting(true);
        setError(null);

        try {
            const payload = {
                username: name,
                email: email,
                password: password,
                role: selectedRole === 'candidate' ? 'CANDIDATE' : 'INSTITUTION'
            };

            const response = await apiClient.post('/api/v1/auth/register', payload);

            const { token } = response.data;
            const decodedToken = parseJwt(token);

            if (decodedToken) {
                localStorage.setItem('jwt_token', token);
                localStorage.setItem('user_role', decodedToken.role.toLowerCase());
                localStorage.setItem('user_id', decodedToken.userId);
                onRegisterSuccess(selectedRole);
            } else {
                console.error("Invalid token format received");
            }



        } catch (err: any) {
            console.error("Registration failed:", err);
            // Try to extract the exact error message from the Spring Boot response
            const backendMessage = err.response?.data?.message || err.response?.data;
            setError(typeof backendMessage === 'string' ? backendMessage : t('auth.registrationFailed'));
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-professional-emerald/15 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-brand-blue/20 rounded-full blur-[100px]"></div>

            <div className={`w-full relative z-10 transition-all duration-500 ${step === 1 ? 'max-w-md' : 'max-w-2xl'} animate-fade-in`}>

                <div className="flex flex-col items-center mb-8">
                    <div className="w-12 h-12 bg-[#1b1b1d] rounded-2xl flex items-center justify-center shadow-inner mb-4">
                        <Sparkles className="w-7 h-7 text-white" />
                    </div>
                    <span className="text-3xl font-display font-black tracking-tight text-grey-dark">
            Recruit<span className="text-brand-blue">AI</span>
          </span>
                </div>

                <Card className="rounded-3xl border-[#c6c6cd]/50 shadow-xl bg-white/70 backdrop-blur-xl overflow-hidden relative">

                    {/* Progress Bar */}
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-[#f0edef]">
                        <div className={`h-full bg-brand-blue transition-all duration-500 ${step === 1 ? 'w-1/2' : 'w-full'}`}></div>
                    </div>

                    <CardHeader className="text-center pb-2 pt-8">
                        <CardTitle className="text-2xl font-bold text-grey-dark">
                            {step === 1 ? t('auth.registerTitle') : t('auth.roleSelectionTitle')}
                        </CardTitle>
                        <p className="text-sm text-grey-muted mt-2">
                            {step === 1 ? t('auth.registerSubtitle') : t('auth.roleSelectionSubtitle')}
                        </p>
                    </CardHeader>

                    <CardContent className="pt-4">

                        {/* Global Error Display */}
                        {error && (
                            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 animate-fade-in">
                                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                                <p className="text-sm text-red-700 font-medium">{error}</p>
                            </div>
                        )}

                        {/* STEP 1: IDENTITY CREATION */}
                        {step === 1 && (
                            <form onSubmit={handleIdentitySubmit} className="space-y-4 animate-fade-in">
                                <div className="space-y-1.5 relative">
                                    <Label htmlFor="name" className="text-xs font-bold text-grey-dark uppercase tracking-wider">{t('auth.name')}</Label>
                                    <div className="relative">
                                        <Input
                                            id="name"
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="pl-10 h-11 rounded-xl border-[#c6c6cd]/60 bg-white/50 focus-visible:ring-brand-blue shadow-sm"
                                            required
                                        />
                                        <User className="w-4 h-4 absolute left-3.5 top-3.5 text-grey-muted" />
                                    </div>
                                </div>

                                <div className="space-y-1.5 relative">
                                    <Label htmlFor="email" className="text-xs font-bold text-grey-dark uppercase tracking-wider">{t('auth.email')}</Label>
                                    <div className="relative">
                                        <Input
                                            id="email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="pl-10 h-11 rounded-xl border-[#c6c6cd]/60 bg-white/50 focus-visible:ring-brand-blue shadow-sm"
                                            required
                                        />
                                        <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-grey-muted" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5 relative">
                                        <Label htmlFor="password" className="text-xs font-bold text-grey-dark uppercase tracking-wider">{t('auth.password')}</Label>
                                        <div className="relative">
                                            <Input
                                                id="password"
                                                type="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="pl-10 h-11 rounded-xl border-[#c6c6cd]/60 bg-white/50 focus-visible:ring-brand-blue shadow-sm"
                                                required
                                            />
                                            <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-grey-muted" />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5 relative">
                                        <Label htmlFor="confirmPassword" className="text-xs font-bold text-grey-dark uppercase tracking-wider">{t('auth.confirmPassword')}</Label>
                                        <div className="relative">
                                            <Input
                                                id="confirmPassword"
                                                type="password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className={`pl-10 h-11 rounded-xl border-[#c6c6cd]/60 bg-white/50 focus-visible:ring-brand-blue shadow-sm ${confirmPassword && password !== confirmPassword ? 'border-red-400 focus-visible:ring-red-400' : ''}`}
                                                required
                                            />
                                            <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-grey-muted" />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3 mt-6 pt-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleClearForm}
                                        className="h-12 px-4 rounded-xl border-[#c6c6cd]/60 text-grey-muted hover:text-grey-dark font-bold"
                                        title={t('auth.clearForm')}
                                    >
                                        <RefreshCw className="w-4 h-4" />
                                    </Button>
                                    <Button type="submit" className="flex-1 h-12 rounded-xl bg-grey-dark hover:bg-black text-white font-bold text-sm shadow-md transition-transform hover:scale-[1.02]">
                                        {t('auth.nextStep')} <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </div>

                                <div className="mt-6 text-center border-t border-[#c6c6cd]/30 pt-6">
                                    <p className="text-sm text-grey-muted font-medium">
                                        {t('auth.hasAccount')}{' '}
                                        <button type="button" onClick={onNavigateToLogin} className="text-grey-dark font-bold hover:underline">
                                            {t('auth.loginInstead')}
                                        </button>
                                    </p>
                                </div>
                            </form>
                        )}

                        {/* STEP 2: ROLE SELECTION */}
                        {step === 2 && (
                            <div className="space-y-6 animate-fade-in">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                                    <div
                                        onClick={() => setSelectedRole('candidate')}
                                        className={`cursor-pointer p-6 rounded-2xl border-2 transition-all duration-200 ${
                                            selectedRole === 'candidate'
                                                ? 'border-brand-blue bg-brand-blue/5 shadow-md'
                                                : 'border-[#c6c6cd]/40 bg-white/50 hover:border-brand-blue/50 hover:bg-white/80'
                                        }`}
                                    >
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${selectedRole === 'candidate' ? 'bg-brand-blue text-white shadow-sm' : 'bg-[#f0edef] text-grey-muted'}`}>
                                            <Briefcase className="w-6 h-6" />
                                        </div>
                                        <h3 className={`text-lg font-bold mb-2 ${selectedRole === 'candidate' ? 'text-brand-blue' : 'text-grey-dark'}`}>
                                            {t('auth.roleCandidate')}
                                        </h3>
                                        <p className="text-sm text-grey-muted leading-relaxed">
                                            {t('auth.roleCandidateDesc')}
                                        </p>
                                    </div>

                                    <div
                                        onClick={() => setSelectedRole('recruiter')}
                                        className={`cursor-pointer p-6 rounded-2xl border-2 transition-all duration-200 ${
                                            selectedRole === 'recruiter'
                                                ? 'border-grey-dark bg-grey-dark/5 shadow-md'
                                                : 'border-[#c6c6cd]/40 bg-white/50 hover:border-grey-dark/50 hover:bg-white/80'
                                        }`}
                                    >
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${selectedRole === 'recruiter' ? 'bg-grey-dark text-white shadow-sm' : 'bg-[#f0edef] text-grey-muted'}`}>
                                            <Building className="w-6 h-6" />
                                        </div>
                                        <h3 className={`text-lg font-bold mb-2 ${selectedRole === 'recruiter' ? 'text-grey-dark' : 'text-grey-dark'}`}>
                                            {t('auth.roleInstitution')}
                                        </h3>
                                        <p className="text-sm text-grey-muted leading-relaxed">
                                            {t('auth.roleInstitutionDesc')}
                                        </p>
                                    </div>

                                </div>

                                <div className="flex gap-4 pt-4 border-t border-[#c6c6cd]/30">
                                    <Button
                                        variant="outline"
                                        onClick={() => setStep(1)}
                                        disabled={isSubmitting}
                                        className="h-12 px-6 rounded-xl border-[#c6c6cd] text-grey-dark hover:bg-white font-bold"
                                    >
                                        <ArrowLeft className="w-4 h-4 mr-2" /> {t('auth.back')}
                                    </Button>
                                    <Button
                                        onClick={handleFinalSubmit}
                                        disabled={!selectedRole || isSubmitting}
                                        className="flex-1 h-12 rounded-xl bg-brand-blue hover:bg-brand-blue-dark text-white font-bold shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? 'Моля изчакайте...' : t('auth.completeRegistration')} <Sparkles className="w-4 h-4 ml-2" />
                                    </Button>
                                </div>
                            </div>
                        )}

                    </CardContent>
                </Card>
            </div>
        </div>
    );
}