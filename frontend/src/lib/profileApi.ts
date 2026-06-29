import apiClient from '@/lib/axios';
import {CandidateMode, parseApiMode, toApiMode} from '@/lib/mode';
import {Profile} from '@/lib/types';

export async function switchCandidateMode(
    profileId: string,
    mode: CandidateMode
): Promise<CandidateMode> {
    const response = await apiClient.patch(
        `/api/v1/profiles/candidates/${profileId}/mode`,
        null,
        {params: {mode: toApiMode(mode)}}
    );
    return parseApiMode(response.data?.currentMode);
}

export async function saveCandidateProfile(profile: Profile): Promise<Profile> {
    const profileSkills = profile.profileSkills ?? [];

    const payload = {
        firstName: profile.firstName,
        middleName: profile.middleName,
        lastName: profile.lastName,
        location: profile.location,
        headline: profile.headline,
        biography: profile.biography,
        birthday: profile.birthday || '2000-01-01',
        candidateType: profile.candidateType || 'Professional',
        educationType: profile.educationType || 'Bachelor',
        currentMode: toApiMode(profile.currentMode ?? 'professional'),
        expectedSalary: profile.expectedSalary,
        profileSkills: profileSkills,
    };

    const response = await apiClient.put('/api/v1/profiles/candidate/complete', payload);
    const saved = response.data;

    return {
        ...profile,
        id: saved.id || profile.id,
        userId: saved.userId || profile.userId,
        firstName: saved.firstName ?? profile.firstName,
        lastName: saved.lastName ?? profile.lastName,
        middleName: saved.middleName ?? profile.middleName,
        fullName: saved.fullName ?? profile.fullName,
        headline: saved.headline ?? profile.headline,
        biography: saved.biography ?? profile.biography,
        location: saved.location ?? profile.location,
        candidateType: saved.candidateType ?? profile.candidateType,
        educationType: saved.educationType ?? profile.educationType,
        expectedSalary: saved.expectedSalary ?? profile.expectedSalary,
        currentMode: parseApiMode(saved.currentMode ?? profile.currentMode),
        profileSkills: profileSkills,
        isCompleted: saved.isCompleted ?? true,
    };
}

export async function updateCandidateProfile(profile: Profile): Promise<Profile> {
    const profileSkills = profile.profileSkills ?? [];

    // Convert empty strings to null so backend validation doesn't reject them
    const clean = (v?: string) => v?.trim() || null;

    const payload = {
        firstName: profile.firstName,
        middleName: clean(profile.middleName),
        lastName: profile.lastName,
        headline: clean(profile.headline),
        biography: clean(profile.biography),
        location: profile.location,
        resumeUrl: clean(profile.resumeUrl),
        portfolioUrl: clean(profile.portfolioUrl),
        linkedinUrl: clean(profile.linkedinUrl),
        profileSkills: profileSkills,
    };

    //@ts-ignore
    const response = await apiClient.put('/api/v1/profiles/candidates/update', payload);

    return {...profile, profileSkills};
}

export async function createInstitutionProfile(data: any) {
    const response = await apiClient.post('/api/v1/profiles/institutions', data);
    return response.data;
}

export async function uploadCandidateCv(file: File, candidateId: string): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('candidateId', candidateId);

    const response = await apiClient.post('/api/v1/opportunities/files/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    return response.data;
}
