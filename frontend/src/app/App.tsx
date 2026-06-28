import { useState, useEffect } from 'react';
import Header from '@/components/pages/Header';
import CandidateDashboard from '@/components/pages/CandidateDashboard';
import CandidateProfile from '@/components/pages/CandidateProfile';
import CandidateOpportunities from '@/components/pages/CandidateOpportunities';
import CandidateAiMatches from '@/components/pages/CandidateAiMatches';
import CandidateApplications from '@/components/pages/CandidateApplications';
import RecruiterDashboard from '@/components/pages/RecruiterDashboard';
import RecruiterRanking from '@/components/pages/RecruiterRanking';
import RecruiterCandidateDetail from '@/components/pages/RecruiterCandidateDetail';
import RecruiterOpportunities from '@/components/pages/RecruiterOpportunities';
import { AdminDashboard } from '@/components/pages/AdminDashboard';
import { Footer } from '@/components/shared/Footer';
// Auth & Onboarding Components
import Login from '@/components/pages/Login';
import Register from '@/components/pages/Register';
import ProfileOnboarding from '@/components/pages/ProfileOnboarding';

import apiClient from '@/lib/axios';
import { Profile, Opportunity, Applicant } from '@/lib/types';
import { parseApiMode, CandidateMode } from '@/lib/mode';
import { switchCandidateMode, updateCandidateProfile } from '@/lib/profileApi';
import {fetchOpportunitiesWithMatches, fetchOpportunityCount, updateApplicationStatus} from '@/lib/opportunities';
import { fetchRecruiterApplicants } from '@/lib/applicants';
import { resolveSkillNames } from '@/lib/skills';
import { Sparkles, AlertCircle } from 'lucide-react';
import AcademicDashboard from "@/components/pages/AcademicDashboard.tsx";
import InstitutionOnboarding from "@/components/pages/InstitutionOnboarding.tsx";
import ForgotPassword from "@/components/pages/ForgotPassword.tsx";
import RecruiterCreateOpportunity from "@/components/pages/RecruiterCreateOpportunity.tsx";
import GenericErrorPage from "@/components/pages/GenericErrorPage.tsx";



export default function App() {
    const savedToken = localStorage.getItem('jwt_token');
    const savedRole = localStorage.getItem('user_role') as 'candidate' | 'recruiter' | null;
    const savedUserId = localStorage.getItem('user_id');

    // Auth State
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!savedToken);
    const [authView, setAuthView] = useState<'login' | 'register' | 'forgot-password'>('login');

    // App Navigation State
    const [currentRole, setCurrentRole] = useState<'candidate' | 'recruiter' | 'admin'>(savedRole as 'candidate' | 'recruiter' | 'admin' || 'candidate');
    const [currentTab, setCurrentTab] = useState<string>('dashboard');
    const [isRestricted, setIsRestricted] = useState<boolean>(localStorage.getItem('is_restricted') === 'true');
    const [candidateMode, setCandidateMode] = useState<CandidateMode>('professional');
    const [isSwitchingMode, setIsSwitchingMode] = useState(false);

    // Network State
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Shared Application State
    const [profile, setProfile] = useState<Profile | null>(null);
    const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
    const [applicants, setApplicants] = useState<Applicant[]>([]);
    const [opportunityCount, setOpportunityCount] = useState(0);

    const [selectedOpportunityId, setSelectedOpportunityId] = useState<string | null>(null);
    const [selectedApplicantId, setSelectedApplicantId] = useState<string | null>(null);

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
        document.documentElement.classList.toggle('dark', savedTheme ? savedTheme === 'dark' : prefersDark);
    }, []);

    // Logout Handler
    const handleLogout = () => {
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('user_role');
        localStorage.removeItem('user_id');
        localStorage.removeItem('is_restricted');
        setIsAuthenticated(false);
        setProfile(null);
        setIsRestricted(false);
    };

    // Global Axios Error Interceptor
    useEffect(() => {
        const interceptor = apiClient.interceptors.response.use(
            (response) => response,
            (err) => {
                if (err.response && (err.response.status === 403 || err.response.status === 500)) {
                    setError(`Системна грешка (${err.response.status}). Възникна проблем при обработката на заявката.`);
                    setCurrentTab('error');
                }
                return Promise.reject(err);
            }
        );
        return () => apiClient.interceptors.response.eject(interceptor);
    }, []);

    // Main Data Fetching Hook
    useEffect(() => {
        if (!isAuthenticated || !savedUserId) return;

        setIsLoading(true);
        setError(null);

        if (currentRole === 'admin') {
            setIsLoading(false);
            setProfile({ id: savedUserId, userId: savedUserId, name: 'Admin', role: 'ADMIN', isCompleted: true } as any);
            return;
        }

        const profileEndpoint = currentRole === 'recruiter'
            ? `/api/v1/profiles/institution/${savedUserId}`
            : `/api/v1/profiles/candidates/${savedUserId}`;

        apiClient.get(profileEndpoint)
            .then(async (response: { data: any; }) => {
                const p = response.data;
                const skillIds = p.skillNames
                    ? Array.from(p.skillNames as Iterable<unknown>).map(String)
                    : Array.isArray(p.skills)
                        ? p.skills.map(String)
                        : [];
                const skillNames = currentRole === 'candidate'
                    ? await resolveSkillNames(skillIds)
                    : [];

                setProfile({
                    ...p,
                    id: p.id || savedUserId,
                    userId: savedUserId,
                    name: p.firstName ? [p.firstName, p.middleName, p.lastName].filter(Boolean).join(' ') : (p.displayName || p.fullName || 'Неизвестен Потребител'),
                    role: p.headline || p.role || 'Специалист',
                    email: p.email || '',
                    location: p.location || '',
                    bio: p.biography || p.bio || '',
                    skills: skillNames,
                    skillIds,
                    type: currentRole === 'candidate' ? 'professional' : 'institution',
                    candidateType: p.candidateType,
                    educationType: p.educationType,
                    birthday: p.birthday,
                    currentMode: parseApiMode(p.currentMode),
                    isCompleted: p.isCompleted !== undefined ? p.isCompleted : false,
                    isUniversity: p.isUniversity !== undefined ? p.isUniversity : (p.university !== undefined ? p.university : (p.sectorType === 'UNSPECIFIED' || false))
                });

                if (currentRole === 'candidate') {
                    setCandidateMode(parseApiMode(p.currentMode));
                }

                setIsLoading(false);
            })
            .catch(err => {
                console.error("Failed to load profile:", err);
                if (err.response?.status === 404) {

                    setProfile({
                        id: savedUserId,
                        userId: savedUserId,
                        // @ts-ignore
                        name: '',
                        role: '',
                        email: '',
                        location: '',
                        bio: '',
                        skills: [],
                        type: currentRole === 'candidate' ? 'professional' : 'institution',
                        isCompleted: false
                    });
                } else {
                    setError("Възникна системна грешка. Моля, опитайте по-късно.");
                    setCurrentTab('error');
                }
                setIsLoading(false);
            });

    }, [isAuthenticated, currentRole, savedUserId]);

    // Fetch Opportunities
    useEffect(() => {
        if (!isAuthenticated || currentRole !== 'candidate' || !profile?.isCompleted || !profile.userId) return;

        fetchOpportunitiesWithMatches(profile.userId)
            .then(setOpportunities)
            .catch((err) => console.error('Failed to load opportunities:', err));
    }, [isAuthenticated, currentRole, profile?.isCompleted, profile?.userId]);

    // Fetch Recruiter Data
    useEffect(() => {
        if (!isAuthenticated || currentRole !== 'recruiter' || !profile?.isCompleted) return;

        Promise.all([
            fetchRecruiterApplicants().then(setApplicants),
            fetchOpportunityCount().then(setOpportunityCount),
        ]).catch((err) => console.error('Failed to load recruiter data:', err));
    }, [isAuthenticated, currentRole, profile?.isCompleted]);

    const handleSwitchMode = async (mode: CandidateMode) => {
        if (!profile?.id || mode === candidateMode) return;

        const previousMode = candidateMode;
        setCandidateMode(mode);
        setIsSwitchingMode(true);

        try {
            const persistedMode = await switchCandidateMode(profile.id, mode);
            setCandidateMode(persistedMode);
            setProfile((prev) => prev ? { ...prev, currentMode: persistedMode } : prev);
        } catch (err) {
            console.error('Failed to switch mode:', err);
            setCandidateMode(previousMode);
        } finally {
            setIsSwitchingMode(false);
        }
    };

    const handleUpdateApplicantStatus = async (id: string, newStatus: "Ново" | "Интервю" | "Преглед" | "Приет" | "Отказан") => {
        let backendStatus = "REVIEWING";
        if (newStatus === "Ново") backendStatus = "PENDING";
        if (newStatus === "Интервю") backendStatus = "INTERVIEW_SCHEDULED";
        if (newStatus === "Приет") backendStatus = "ACCEPTED";
        if (newStatus === "Отказан") backendStatus = "REJECTED";

        try {
            await updateApplicationStatus(id, backendStatus);

            setApplicants(prev => prev.map(app => app.id === id ? { ...app, status: newStatus } : app));
        } catch (error) {
            console.error("Грешка при смяна на статуса", error);
            alert("Възникна грешка при запазване на статуса.");
        }
    };

    const selectedApplicant = applicants.find(a => a.id === selectedApplicantId) || applicants[0];

    // ==========================================
    // 1. AUTHENTICATION GATE
    // ==========================================
    if (!isAuthenticated) {
        if (authView === 'login') {
            return (
                <Login
                    onNavigateToRegister={() => setAuthView('register')}
                    onNavigateToForgotPassword={() => setAuthView('forgot-password')}
                    onLoginSuccess={() => {
                        setIsAuthenticated(true);
                        const role = (localStorage.getItem('user_role') as 'candidate' | 'recruiter' | 'admin') || 'candidate';
                        setCurrentRole(role);
                        const restricted = localStorage.getItem('is_restricted') === 'true';
                        setIsRestricted(restricted);
                        setCurrentTab(role === 'candidate' ? 'dashboard' : (role === 'admin' ? 'admin_dashboard' : 'recruiter_dashboard'));
                    }}
                />
            );
        }

        if (authView === 'register') {
            return (
                <Register
                    onNavigateToLogin={() => setAuthView('login')}
                    onRegisterSuccess={(role) => {
                        setCurrentRole(role);
                        setCurrentTab(role === 'candidate' ? 'dashboard' : 'recruiter_dashboard');
                        setIsAuthenticated(true);
                    }}
                />
            );
        }

        if (authView === 'forgot-password') {
            return (
                <ForgotPassword
                    onNavigateToLogin={() => setAuthView('login')}
                />
            );
        }
    }

    // ==========================================
    // 2. LOADING & ERROR STATES
    // ==========================================
    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-transparent z-10 relative">
                <Sparkles className="w-12 h-12 text-brand-blue animate-pulse mb-4" />
                <h2 className="text-xl font-display font-bold text-grey-dark tracking-widest uppercase">Зареждане на данни...</h2>
                <p className="text-sm text-grey-muted mt-2 font-mono">Подготовка на работното пространство...</p>
            </div>
        );
    }

    if (!profile && !error) {
        return null;
    }

    // ==========================================
    // 3. PROFILE ONBOARDING GATE
    // ==========================================
    if (!error && profile && profile.isCompleted === false && currentRole !== 'admin') {

        if (currentRole === 'recruiter') {
            return (
                <InstitutionOnboarding
                    profile={profile}
                    onComplete={(updatedProfile) => {
                        setProfile({ ...updatedProfile, isCompleted: true });
                    }}
                    onLogout={handleLogout}
                />
            );
        }

        return (
            <ProfileOnboarding
                profile={profile}
                onComplete={(updatedProfile) => {
                    setProfile({ ...updatedProfile, isCompleted: true });
                }}
                onLogout={handleLogout}
            />
        );
    }

    // ==========================================
    // 4. MAIN APPLICATION ROUTING
    // ==========================================
    return (
        <div className="min-h-screen flex flex-col bg-transparent relative overflow-x-hidden z-10">
            {isRestricted && currentRole !== 'admin' && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl p-8 max-w-md text-center shadow-2xl border border-red-200">
                        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-grey-dark mb-2">Достъпът е ограничен</h2>
                        <p className="text-grey-muted mb-6">
                            Вашият акаунт е ограничен от системен администратор. Моля, свържете се с поддръжката за повече информация.
                        </p>
                        <button onClick={handleLogout} className="bg-brand-blue text-white font-bold py-3 px-6 rounded-xl shadow-md hover:bg-brand-blue-dark transition-all">
                            Изход
                        </button>
                    </div>
                </div>
            )}
            
            <Header
                currentRole={currentRole as any}
                setCurrentRole={(role) => {
                    setCurrentRole(role as any);
                    setCurrentTab(role === 'candidate' ? 'dashboard' : 'recruiter_dashboard');
                }}
                currentTab={currentTab}
                setCurrentTab={setCurrentTab}
                candidateMode={candidateMode}
                onSwitchMode={handleSwitchMode}
                isSwitchingMode={isSwitchingMode}
                onLogout={handleLogout}
            />

            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {profile && currentRole === 'candidate' && (
                    <>
                        {currentTab === 'dashboard' && candidateMode === 'professional' && (
                            <CandidateDashboard
                                profile={profile}
                                candidateMode={candidateMode}
                                setCandidateMode={handleSwitchMode}
                                setCurrentTab={setCurrentTab}
                                setSelectedOpportunityId={setSelectedOpportunityId}
                            />
                        )}

                        {currentTab === 'dashboard' && candidateMode === 'academic' && (
                            <AcademicDashboard profile={profile} />
                        )}
                        {currentTab === 'profile' && (
                            <CandidateProfile
                                profile={profile}
                                onSaveProfile={async (updatedData) => {
                                    try {
                                        const fullProfile = { ...profile, ...updatedData } as Profile;
                                        await updateCandidateProfile(fullProfile);

                                        // Update local state
                                        const fullName = [fullProfile.firstName, fullProfile.middleName, fullProfile.lastName].filter(Boolean).join(' ');
                                        setProfile(prev => prev ? { ...prev, ...fullProfile, fullName } : prev);
                                    } catch (error) {
                                        console.error("Грешка при запазване на профила", error);
                                        throw error;
                                    }
                                }}
                            />
                        )}
                        {currentTab === 'opportunities' && (
                            <CandidateOpportunities
                                profile={profile}
                                candidateMode={candidateMode}
                                selectedOpportunityId={selectedOpportunityId}
                                setSelectedOpportunityId={setSelectedOpportunityId}
                            />
                        )}
                        {currentTab === 'aimatches' && (
                            <CandidateAiMatches
                                profile={profile}
                                candidateMode={candidateMode}
                                opportunities={opportunities}
                            />
                        )}
                        {currentTab === 'applications' && (
                            <CandidateApplications
                                profile={profile}
                                candidateMode={candidateMode}
                            />
                        )}
                    </>
                )}

                {profile && currentRole === 'recruiter' && (
                    <>
                        {currentTab === 'recruiter_dashboard' && <RecruiterDashboard applicants={applicants} opportunityCount={opportunityCount} setCurrentTab={setCurrentTab} setSelectedApplicantId={setSelectedApplicantId} />}
                        {currentTab === 'recruiter_applicants' && <RecruiterRanking applicants={applicants} setCurrentTab={setCurrentTab} setSelectedApplicantId={setSelectedApplicantId} />}
                        {currentTab === 'recruiter_my_opportunities' && <RecruiterOpportunities profile={profile} setCurrentTab={setCurrentTab} />}
                        {currentTab === 'recruiter_applicant_detail' && selectedApplicant && <RecruiterCandidateDetail applicant={selectedApplicant} onBack={() => setCurrentTab('recruiter_dashboard')} onUpdateStatus={handleUpdateApplicantStatus} />}
                    </>
                )}

                {currentTab === 'recruiter_create_opportunity' && !error && profile && (
                    <RecruiterCreateOpportunity onBack={() => setCurrentTab('recruiter_dashboard')} profile={profile} />
                )}

                {currentRole === 'admin' && (
                    <AdminDashboard />
                )}

                {(error || currentTab === 'error') && (
                    <GenericErrorPage
                        message={error || undefined}
                        onHome={() => {
                            setError(null);
                            setCurrentTab(currentRole === 'candidate' ? 'dashboard' : 'recruiter_dashboard');
                        }}
                        onRetry={() => window.location.reload()}
                    />
                )}
            </main>
            
            <Footer />
        </div>
    );
}
