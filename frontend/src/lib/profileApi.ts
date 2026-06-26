import apiClient from '@/lib/axios';
import { CandidateMode, parseApiMode, toApiMode } from '@/lib/mode';
import { Profile } from '@/lib/types';
import { resolveSkillIds } from '@/lib/skills';

export async function switchCandidateMode(
    profileId: string,
    mode: CandidateMode
): Promise<CandidateMode> {
    const response = await apiClient.patch(
        `/api/v1/profiles/candidates/${profileId}/mode`,
        null,
        { params: { mode: toApiMode(mode) } }
    );
    return parseApiMode(response.data?.currentMode);
}

export async function saveCandidateProfile(profile: Profile): Promise<Profile> {
    const nameParts = profile.name.trim().split(/\s+/);
    const firstName = nameParts[0] || 'Candidate';
    const lastName = nameParts.slice(1).join(' ') || firstName;
    const skillIds = await resolveSkillIds(profile.skills ?? []);

    const payload = {
        firstName,
        lastName,
        location: profile.location,
        headline: profile.role,
        biography: profile.bio,
        birthday: profile.birthday || '2000-01-01',
        candidateType: profile.candidateType || 'Professional',
        educationType: profile.educationType || 'Bachelor',
        currentMode: toApiMode(profile.currentMode ?? 'professional'),
        skills: skillIds,
    };

    const response = await apiClient.put('/api/v1/profiles/candidate/complete', payload);
    const saved = response.data;

    return {
        ...profile,
        id: saved.id || profile.id,
        userId: saved.userId || profile.userId,
        name: `${saved.firstName ?? firstName} ${saved.lastName ?? lastName}`.trim(),
        role: saved.headline ?? profile.role,
        bio: saved.biography ?? profile.bio,
        location: saved.location ?? profile.location,
        candidateType: saved.candidateType ?? profile.candidateType,
        educationType: saved.educationType ?? profile.educationType,
        currentMode: parseApiMode(saved.currentMode ?? profile.currentMode),
        skillIds,
        isCompleted: saved.isCompleted ?? true,
    };
}

export async function createInstitutionProfile(data: any) {
    const response = await apiClient.post('/api/v1/profiles/institutions', data);
    return response.data;
}
