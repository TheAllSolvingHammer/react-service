import { useState, useEffect } from 'react';
import Header from '@/components/pages/Header';
import CandidateDashboard from '@/components/pages/CandidateDashboard';
import CandidateProfile from '@/components/pages/CandidateProfile';
import CandidateOpportunities from '@/components/pages/CandidateOpportunities';
import CandidateAiMatches from '@/components/pages/CandidateAiMatches';
import RecruiterDashboard from '@/components/pages/RecruiterDashboard';
import RecruiterRanking from '@/components/pages/RecruiterRanking';
import RecruiterCandidateDetail from '@/components/pages/RecruiterCandidateDetail';

import apiClient from '@/lib/axios';
import { Profile, Opportunity, Applicant } from '@/lib/types';
import { Sparkles } from 'lucide-react';

export default function App() {
    const [currentRole, setCurrentRole] = useState<'candidate' | 'recruiter'>('candidate');
    const [currentTab, setCurrentTab] = useState<string>('dashboard');
    const [candidateMode, setCandidateMode] = useState<'professional' | 'academic'>('professional');

    // Network State
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Shared Application State (Initialized empty instead of using data.ts)
    const [profile, setProfile] = useState<Profile | null>(null);
    // @ts-ignore
    const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
    const [applicants, setApplicants] = useState<Applicant[]>([]);
    const [appliedList, setAppliedList] = useState<any[]>([]);

    const [selectedOpportunityId, setSelectedOpportunityId] = useState<string | null>(null);
    const [selectedApplicantId, setSelectedApplicantId] = useState<string | null>(null);

    // Fetch data from the API Gateway BFF on mount
    useEffect(() => {
        apiClient.get('/bff/dashboard')
            .then((response: { data: any; }) => {
                const payload = response.data;

                // Map the BFF data to our state
                // Note: You may need to adjust these mappings depending on your exact Profile Service JSON return structure
                if (payload.profile && payload.profile.details) {
                    setProfile(payload.profile.details);
                    setCandidateMode(payload.profile.mode === 'academic' ? 'academic' : 'professional');
                }

                if (payload.activity && payload.activity.applications) {
                    setAppliedList(payload.activity.applications);
                }

                // TODO: Map opportunities and applicants from my specific endpoints (if they are included in the BFF)

                setIsLoading(false);
            })
            .catch(err => {
                console.error("Gateway Connection Error:", err);
                setError("Неуспешна връзка със сървъра. Проверете дали API Gateway е стартиран.");
                setIsLoading(false);
            });
    }, []);

    const handleUpdateApplicantStatus = (id: string, newStatus: "Ново" | "Интервю" | "Преглед") => {
        setApplicants(prev => prev.map(app => app.id === id ? { ...app, status: newStatus } : app));
    };

    const selectedApplicant = applicants.find(a => a.id === selectedApplicantId) || applicants[0];

    // Beautiful Loading Screen matching the glassmorphism theme
    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-transparent z-10 relative">
                <Sparkles className="w-12 h-12 text-brand-blue animate-pulse mb-4" />
                <h2 className="text-xl font-display font-bold text-white tracking-widest uppercase">Зареждане на данни...</h2>
                <p className="text-sm text-grey-muted mt-2 font-mono">Connecting to API Gateway</p>
            </div>
        );
    }

    // Error Fallback
    if (error || !profile) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-transparent z-10 relative text-center px-4">
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-2xl max-w-md backdrop-blur-md">
                    <h2 className="text-lg font-bold mb-2">Грешка в системата</h2>
                    <p className="text-sm">{error || "Профилът не беше открит."}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-transparent relative overflow-x-hidden z-10">
            <Header
                currentRole={currentRole}
                setCurrentRole={setCurrentRole}
                currentTab={currentTab}
                setCurrentTab={setCurrentTab}
                candidateMode={candidateMode}
                setCandidateMode={setCandidateMode}
            />

            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {currentRole === 'candidate' && (
                    <>
                        {currentTab === 'dashboard' && (
                            <CandidateDashboard
                                profile={profile}
                                opportunities={opportunities}
                                candidateMode={candidateMode}
                                setCandidateMode={setCandidateMode}
                                setCurrentTab={setCurrentTab}
                                setSelectedOpportunityId={setSelectedOpportunityId}
                                appliedList={appliedList}
                                setAppliedList={setAppliedList}
                            />
                        )}

                        {currentTab === 'profile' && (
                            <CandidateProfile
                                profile={profile}
                                setProfile={setProfile as any}
                                candidateMode={candidateMode}
                                setCandidateMode={setCandidateMode}
                            />
                        )}

                        {currentTab === 'opportunities' && (
                            <CandidateOpportunities
                                opportunities={opportunities}
                                selectedOpportunityId={selectedOpportunityId}
                                setSelectedOpportunityId={setSelectedOpportunityId}
                                appliedList={appliedList}
                                setAppliedList={setAppliedList}
                            />
                        )}

                        {currentTab === 'aimatches' && (
                            <CandidateAiMatches
                                profile={profile}
                                setProfile={setProfile as any}
                                opportunities={opportunities}
                            />
                        )}
                    </>
                )}

                {currentRole === 'recruiter' && (
                    <>
                        {currentTab === 'recruiter_dashboard' && (
                            <RecruiterDashboard
                                applicants={applicants}
                                setCurrentTab={setCurrentTab}
                                setSelectedApplicantId={setSelectedApplicantId}
                            />
                        )}

                        {currentTab === 'recruiter_applicants' && (
                            <RecruiterRanking
                                applicants={applicants}
                                setCurrentTab={setCurrentTab}
                                setSelectedApplicantId={setSelectedApplicantId}
                            />
                        )}

                        {currentTab === 'recruiter_applicant_detail' && selectedApplicant && (
                            <RecruiterCandidateDetail
                                applicant={selectedApplicant}
                                onBack={() => setCurrentTab('recruiter_dashboard')}
                                onUpdateStatus={handleUpdateApplicantStatus}
                            />
                        )}
                    </>
                )}
            </main>

            <footer className="border-t border-[#c6c6cd]/30 py-6 text-center text-grey-muted text-[11px] font-mono select-none">
                <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <span>&copy; {new Date().getFullYear()} RecruitAI Platform. Всички права запазени.</span>
                    <div className="flex gap-4">
                        <a href="#" className="hover:text-brand-blue transition-colors">Общи Условия</a>
                        <a href="#" className="hover:text-brand-blue transition-colors">Сигурност на AI модела</a>
                        <a href="#" className="hover:text-brand-blue transition-colors">Поддръжка</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}