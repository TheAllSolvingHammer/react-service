import apiClient from '@/lib/axios';
import {ApiExperienceMode, CandidateMode, toApiMode} from '@/lib/mode';
import { Experience } from '@/lib/types';

export async function fetchCandidateExperiences(
    profileId: string,
    mode?: CandidateMode
): Promise<Experience[]> {
    const params = new URLSearchParams({ page: '0', size: '20' });
    if (mode) {
        params.set('mode', toApiMode(mode));
    }

    const response = await apiClient.get(
        `/api/v1/experiences/candidate/${profileId}?${params.toString()}`
    );
    const content = response.data?.content ?? [];

    return content.map((item: Record<string, unknown>) => ({
        id: String(item.id),
        title: String(item.title ?? ''),
        organization: String(item.organization ?? ''),
        description: item.description ? String(item.description) : undefined,
        startDate: item.startDate ? String(item.startDate) : undefined,
        endDate: item.endDate ? String(item.endDate) : undefined,
        currentlyActive: Boolean(item.currentlyActive),
        mode: typeof item.mode === 'object' && item.mode !== null 
            ? String((item.mode as any).value ?? (item.mode as any).name ?? '')
            : String(item.mode ?? ''),
    }));
}

export async function createCandidateExperience(payload: {
    candidateId: string;
    title: string;
    organization: string;
    description?: string;
    startDate: string;
    endDate?: string;
    currentlyActive: boolean;
    mode: ApiExperienceMode;
}): Promise<void> {
    await apiClient.post('/api/v1/experiences', payload);
}

export async function deleteCandidateExperience(expId: string): Promise<void> {
    await apiClient.delete(`/api/v1/experiences/${expId}`);
}
