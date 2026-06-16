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
import { Sparkles } from 'lucide-react';

export default function App() {
    // Check localStorage initially to survive page refreshes
    const savedToken = localStorage.getItem('jwt_token');
    const savedRole = localStorage.getItem('user_role') as 'candidate' | 'recruiter' | null;

    // Auth State
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!savedToken);
    const [authView, setAuthView] = useState<'login' | 'register'>('login');

    // App Navigation State
    const [currentRole, setCurrentRole] = useState<'candidate' | 'recruiter'>(savedRole || 'candidate');
    const [currentTab, setCurrentTab] = useState<string>('dashboard');
    const [candidateMode, setCandidateMode] = useState<'professional' | 'academic'>('professional');

    // Network State
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Shared Application State
    const [profile, setProfile] = useState<Profile | null>(null);
    const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
    const [applicants, setApplicants] = useState<Applicant[]>([]);
    const [appliedList, setAppliedList] = useState<any[]>([]);

    const [selectedOpportunityId, setSelectedOpportunityId] = useState<string | null>(null);
    const [selectedApplicantId, setSelectedApplicantId] = useState<string | null>(null);

    // Logout Handler
    const handleLogout = () => {
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('user_role');
        setIsAuthenticated(false);
        setProfile(null);
    };

    useEffect(() => {
        if (!isAuthenticated) return;

        setIsLoading(true);

        apiClient.get('/api/v1/profiles/me')
            .then((response: { data: any; }) => {
                const p = response.data;

                setProfile({
                    ...p,
                    name: p.name || 'Неизвестен Кандидат',
                    role: p.role || 'Специалист',
                    email: p.email || '',
                    location: p.location || '',
                    bio: p.bio || '',
                    skills: Array.isArray(p.skills) ? p.skills : [],
                    type: p.type || 'professional',
                    isCompleted: p.isCompleted !== undefined ? p.isCompleted : false
                });

                setCandidateMode(p.mode === 'academic' ? 'academic' : 'professional');
                setIsLoading(false);
            })
            .catch(err => {
                console.error("Failed to load profile:", err);
                if (err.response?.status === 404) {
                    setProfile({
                        id: '', name: '', role: '', email: '', location: '', bio: '', skills: [], type: 'professional', isCompleted: false
                    });
                } else {
                    setError("Неуспешна връзка с Profile Service.");
                }
                setIsLoading(false);
            });

        // Note: You can add additional apiClient.get() calls here later
        // for /api/v1/opportunities and /api/v1/matching

    }, [isAuthenticated]);

    const handleUpdateApplicantStatus = (id: string, newStatus: "Ново" | "Интервю" | "Преглед") => {
        setApplicants(prev => prev.map(app => app.id === id ? { ...app, status: newStatus } : app));
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
    }

    // ==========================================
    // 2. LOADING & ERROR STATES (Post-Login)
    // ==========================================
    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-transparent z-10 relative">
                <Sparkles className="w-12 h-12 text-brand-blue animate-pulse mb-4" />
                <h2 className="text-xl font-display font-bold text-grey-dark tracking-widest uppercase">Зареждане на данни...</h2>
                <p className="text-sm text-grey-muted mt-2 font-mono">Connecting to API Gateway</p>
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-transparent z-10 relative text-center px-4">
                <div className="bg-red-500/10 border border-red-500/20 text-red-600 p-6 rounded-2xl max-w-md backdrop-blur-md">
                    <h2 className="text-lg font-bold mb-2">Грешка в системата</h2>
                    <p className="text-sm">{error || "Профилът не беше открит."}</p>
                    <button
                        onClick={handleLogout}
                        className="mt-4 px-4 py-2 bg-white text-red-600 rounded-lg text-sm font-bold shadow-sm hover:bg-red-50"
                    >
                        Изход
                    </button>
                </div>
            </div>
        );
    }

    // ==========================================
    // 3. PROFILE ONBOARDING GATE
    // ==========================================
    if (profile && profile.isCompleted === false) {
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
                setCandidateMode={setCandidateMode}
                onLogout={handleLogout} // <-- Passing down the logout function
            />

            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {currentRole === 'candidate' && (
                    <>
                        {currentTab === 'dashboard' && <CandidateDashboard profile={profile} opportunities={opportunities} candidateMode={candidateMode} setCandidateMode={setCandidateMode} setCurrentTab={setCurrentTab} setSelectedOpportunityId={setSelectedOpportunityId} appliedList={appliedList} setAppliedList={setAppliedList} />}
                        {currentTab === 'profile' && <CandidateProfile profile={profile} setProfile={setProfile as any} candidateMode={candidateMode} setCandidateMode={setCandidateMode} />}
                        {currentTab === 'opportunities' && <CandidateOpportunities opportunities={opportunities} selectedOpportunityId={selectedOpportunityId} setSelectedOpportunityId={setSelectedOpportunityId} appliedList={appliedList} setAppliedList={setAppliedList} />}
                        {currentTab === 'aimatches' && <CandidateAiMatches profile={profile} setProfile={setProfile as any} opportunities={opportunities} />}
                    </>
                )}

                {currentRole === 'recruiter' && (
                    <>
                        {currentTab === 'recruiter_dashboard' && <RecruiterDashboard applicants={applicants} setCurrentTab={setCurrentTab} setSelectedApplicantId={setSelectedApplicantId} />}
                        {currentTab === 'recruiter_applicants' && <RecruiterRanking applicants={applicants} setCurrentTab={setCurrentTab} setSelectedApplicantId={setSelectedApplicantId} />}
                        {currentTab === 'recruiter_applicant_detail' && selectedApplicant && <RecruiterCandidateDetail applicant={selectedApplicant} onBack={() => setCurrentTab('recruiter_dashboard')} onUpdateStatus={handleUpdateApplicantStatus} />}
                    </>
                )}
            </main>
        </div>
    );
}