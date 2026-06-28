import apiClient from '@/lib/axios';
import {Applicant} from '@/lib/types';
import {parseApiMode} from '@/lib/mode';
import {fetchLatestApplications} from '@/lib/applications';
import {fetchCandidateMatches} from '@/lib/matching';
import {resolveSkillNames} from '@/lib/skills';


function mapApplicantStatus(status: string): Applicant['status'] {
    switch (status) {
        case 'REVIEWING':
            return 'Преглед';
        case 'INTERVIEW_SCHEDULED':
            return 'Интервю';
        case 'ACCEPTED':
            return 'Приет';
        case 'REJECTED':
            return 'Отказан';
        case 'PENDING':
        default:
            return 'Ново';
    }
}

export async function fetchRecruiterApplicants(): Promise<Applicant[]> {
    const latestApplications = await fetchLatestApplications();
    if (!latestApplications.length) return [];

    const applicants = await Promise.all(
        latestApplications.map(async (application) => {
            const candidateUserId = application.candidateId;

            let profile: Record<string, unknown> = {};
            let matchScore = 0;
            let skills: string[] = [];

            try {
                const profileRes = await apiClient.get(`/api/v1/profiles/candidates/${candidateUserId}`);
                profile = profileRes.data;
                const skillIds = Array.isArray(profile.skillNames)
                    ? profile.skillNames.map(String)
                    : profile.skillNames
                        ? Array.from(profile.skillNames as Iterable<unknown>).map(String)
                        : [];
                skills = await resolveSkillNames(skillIds);
            } catch {
                profile = {};
            }

            try {
                const matches = await fetchCandidateMatches(candidateUserId, 1);
                const relevant = matches.find((match) => match.opportunityId === application.opportunityId);
                matchScore = relevant?.finalScore ?? matches[0]?.finalScore ?? 0;
            } catch {
                matchScore = 0;
            }

            const firstName = String(profile.firstName ?? 'Кандидат');
            const lastName = String(profile.lastName ?? '');
            const currentMode = parseApiMode(profile.currentMode ?? profile.candidateType);

            return {
                id: application.applicationId || candidateUserId,
                name: `${firstName} ${lastName}`.trim(),
                role: String(profile.headline ?? application.title ?? 'Кандидат'),
                email: String(profile.email ?? ''),
                matchScore,
                status: mapApplicantStatus(application.status),
                appliedDate: application.appliedAtDate || application.appliedAt
                    ? new Date(String(application.appliedAtDate ?? application.appliedAt)).toLocaleDateString('bg-BG')
                    : new Date().toLocaleDateString('bg-BG'),
                skills,
                candidateMode: currentMode,
                resumeUrl: String(profile.resumeUrl ?? ''),
            } satisfies Applicant;
        })
    );

    return applicants;
}
