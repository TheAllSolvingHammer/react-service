import apiClient from '@/lib/axios';

export interface MatchResult {
    matchId?: string;
    applicationId?: string;
    opportunityId: string;
    candidateId: string;
    finalScore: number;
    manualScore?: number;
    aiScore?: number;
    aiReasoning?: string;
    matchingMode?: string;
    appliedAt?: string;
    calculatedAt?: string;
}

export interface PaginatedMatchOutput {
    content: MatchResult[];
    totalPages: number;
    totalElements: number;
    currentPage: number;
    isLast: boolean;
}

export async function fetchCandidateMatches(
    candidateUserId: string,
    size = 20
): Promise<MatchResult[]> {
    const response = await apiClient.get(
        `/api/v1/matching/candidate/${candidateUserId}?page=0&size=${size}`
    );
    const content = response.data?.content ?? [];
    return content.map((match: Record<string, unknown>) => ({
        matchId: match.matchId ? String(match.matchId) : undefined,
        applicationId: match.applicationId ? String(match.applicationId) : undefined,
        opportunityId: String(match.opportunityId),
        candidateId: String(match.candidateId),
        finalScore: Math.round(Number(match.finalScore ?? 0)),
        manualScore: match.manualScore != null ? Number(match.manualScore) : undefined,
        aiScore: match.aiScore != null ? Number(match.aiScore) : undefined,
        aiReasoning: match.aiReasoning ? String(match.aiReasoning) : undefined,
        matchingMode: match.matchingMode ? String(match.matchingMode) : undefined,
        appliedAt: match.appliedAt ? String(match.appliedAt) : undefined,
        calculatedAt: match.calculatedAt ? String(match.calculatedAt) : undefined,
    }));
}
