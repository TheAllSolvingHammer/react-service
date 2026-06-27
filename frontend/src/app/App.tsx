import { useState, useEffect } from 'react';
import Header from '@/components/pages/Header';
import CandidateDashboard from '@/components/pages/CandidateDashboard';
import CandidateProfile from '@/components/pages/CandidateProfile';
import CandidateOpportunities from '@/components/pages/CandidateOpportunities';
import CandidateAiMatches from '@/components/pages/CandidateAiMatches';
import RecruiterDashboard from '@/components/pages/RecruiterDashboard';
import RecruiterRanking from '@/components/pages/RecruiterRanking';
import RecruiterCandidateDetail from '@/components/pages/RecruiterCandidateDetail';

// Auth & Onboarding Components
import Login from '@/components/pages/Login';
import Register from '@/components/pages/Register';
import ProfileOnboarding from '@/components/pages/ProfileOnboarding';

import apiClient from '@/lib/axios';
import { Profile, Opportunity, Applicant } from '@/lib/types';
import { parseApiMode, CandidateMode } from '@/lib/mode';
import { switchCandidateMode } from '@/lib/profileApi';
import {fetchOpportunitiesWithMatches, fetchOpportunityCount, updateApplicationStatus} from '@/lib/opportunities';
import { fetchRecruiterApplicants } from '@/lib/applicants';
import { resolveSkillNames } from '@/lib/skills';
import { Sparkles } from 'lucide-react';
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
    const [currentRole, setCurrentRole] = useState<'candidate' | 'recruiter'>(savedRole || 'candidate');
    const [currentTab, setCurrentTab] = useState<string>('dashboard');
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
        setIsAuthenticated(false);
        setProfile(null);
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
                    name: p.firstName ? `${p.firstName} ${p.lastName}` : (p.displayName || p.fullName || 'Неизвестен Потребител'),
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
                    onNavigateToForgotPassword={() => setAuthView('forgot-password')} // ДОБАВИ ТОВА
                    onLoginSuccess={() => {
                        setIsAuthenticated(true);
                        const role = (localStorage.getItem('user_role') as 'candidate' | 'recruiter') || 'candidate';
                        setCurrentRole(role);
                        setCurrentTab(role === 'candidate' ? 'dashboard' : 'recruiter_dashboard');
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
    if (!error && profile && profile.isCompleted === false) {

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
            <Header
                currentRole={currentRole}
                setCurrentRole={(role) => {
                    setCurrentRole(role);
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
                {currentRole === 'candidate' && (
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
                                        // Тук ще извикаме бекенда, когато ендпоинтът е готов
                                        // await saveCandidateProfile(profile.id, updatedData);

                                        // Засега обновяваме локалния стейт, за да видим промените веднага
                                        setProfile(prev => prev ? { ...prev, ...updatedData } : prev);
                                    } catch (error) {
                                        console.error("Грешка при запазване на профила", error);
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
                    </>
                )}

                {currentRole === 'recruiter' && (
                    <>
                        {currentTab === 'recruiter_dashboard' && <RecruiterDashboard applicants={applicants} opportunityCount={opportunityCount} setCurrentTab={setCurrentTab} setSelectedApplicantId={setSelectedApplicantId} />}
                        {currentTab === 'recruiter_applicants' && <RecruiterRanking applicants={applicants} setCurrentTab={setCurrentTab} setSelectedApplicantId={setSelectedApplicantId} />}
                        {currentTab === 'recruiter_applicant_detail' && selectedApplicant && <RecruiterCandidateDetail applicant={selectedApplicant} onBack={() => setCurrentTab('recruiter_dashboard')} onUpdateStatus={handleUpdateApplicantStatus} />}
                    </>
                )}

                {currentTab === 'recruiter_create_opportunity' && !error && (
                    <RecruiterCreateOpportunity onBack={() => setCurrentTab('recruiter_dashboard')} profile={profile} />
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
        </div>
    );
}
