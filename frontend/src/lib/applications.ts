import apiClient from '@/lib/axios';
import { ApplicationActivity } from '@/lib/types';

export interface ApplicationRecord {
    applicationId: string;
    candidateId: string;
    opportunityId: string;
    title: string;
    company: string;
    status: string;
    appliedAt?: string;
    appliedAtDate?: string;
}

function mapStatus(status: string): string {
    switch (status) {
        case 'PENDING':
            return 'В процес на преглед';
        case 'REVIEWING':
            return 'Преглед';
        case 'INTERVIEW_SCHEDULED':
            return 'Интервю';
        case 'ACCEPTED':
            return 'Приет';
        case 'REJECTED':
            return 'Отказан';
        default:
            return status;
    }
}

export function mapApplicationActivity(app: any): ApplicationActivity {
    const dateSource = app.appliedAtDate || app.appliedAt;
    const title = app.title || app.opportunityTitle || app.jobTitle || 'Неизвестна позиция';
    const company = app.company || app.location || app.institutionName || 'Неизвестна компания';
    return {
        id: app.opportunityId || app.applicationId || app.id,
        title,
        company,
        status: mapStatus(app.status),
        date: dateSource
            ? new Date(dateSource).toLocaleDateString('bg-BG')
            : new Date().toLocaleDateString('bg-BG'),
        logoColor: 'bg-gradient-to-br from-brand-blue to-purple-600',
    };
}

export async function fetchCandidateApplications(candidateUserId: string): Promise<ApplicationRecord[]> {
    const response = await apiClient.get(`/api/v1/opportunities/applications/candidate/${candidateUserId}`);
    const data = response.data;
    return Array.isArray(data) ? data : (data.applications ?? []);
}

export async function fetchLatestApplications(): Promise<ApplicationRecord[]> {
    const response = await apiClient.get('/api/v1/opportunities/applications/latest');
    const data = response.data;
    return Array.isArray(data) ? data : (data.applications ?? []);
}

export async function applyToOpportunity(
    opportunityId: string,
    candidateUserId: string,
    coverLetter = ''
): Promise<void> {
    const applicationData = {
        opportunityId,
        facultyNumber: candidateUserId,
        coverLetter,
    };

    const formData = new FormData();
    formData.append(
        'applicationData',
        new Blob([JSON.stringify(applicationData)], { type: 'application/json' })
    );
    formData.append(
        'cvFile',
        new Blob(['RecruitAI generated CV placeholder'], { type: 'application/pdf' }),
        `${candidateUserId}-cv.pdf`
    );

    await apiClient.post('/api/v1/opportunities/apply', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
}
