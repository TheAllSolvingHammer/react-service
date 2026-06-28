import apiClient from '@/lib/axios';
import {Opportunity} from '@/lib/types';
import {fetchCandidateMatches} from '@/lib/matching';
import {resolveSkillNames} from '@/lib/skills';

function requirementLabel(requirement: unknown): string {
    if (typeof requirement === 'string') return requirement;
    if (requirement && typeof requirement === 'object') {
        const value = requirement as { name?: string; skillId?: string };
        return value.name ?? String(value.skillId ?? requirement);
    }
    return String(requirement);
}

async function mapOpportunity(opp: Record<string, unknown>): Promise<Opportunity> {
    const requirements = opp.requirements;
    const rawRequirements = Array.isArray(requirements)
        ? requirements
        : requirements && typeof requirements === 'object'
            ? Object.values(requirements as Record<string, unknown>)
            : [];

    const requirementIds = rawRequirements
        .map((r) => (typeof r === 'object' && r && 'skillId' in (r as object) ? String((r as { skillId: string }).skillId) : null))
        .filter(Boolean) as string[];

    const resolvedNames = requirementIds.length
        ? await resolveSkillNames(requirementIds).catch(err => {
            console.warn("Внимание: Неуспешно превеждане на умения за обява", err);
            return rawRequirements.map(requirementLabel); // Връщаме оригиналните ID-та или имена като резервен вариант
        })
        : [];
    const requirementList = resolvedNames.length
        ? resolvedNames
        : rawRequirements.map(requirementLabel);

    return {
        id: String(opp.id),
        title: String(opp.title ?? ''),
        company: String(opp.institutionName ?? opp.companyName ?? ''),
        location: opp.location ? String(opp.location) : undefined,
        description: opp.description ? String(opp.description) : undefined,
        requirements: requirementList,
        matchScore: 0,
        tags: requirementList.slice(0, 3),
    };
}

export async function fetchOpportunities(searchTerm = '', mode: string = 'PROFESSIONAL', page = 0, size = 50): Promise<Opportunity[]> {

    const response = await apiClient.get('/api/v1/opportunities/getAll', {
        params: {
            page: page,
            size: size,
            sortBy: 'createdAt',
            direction: 'DESC',
            nameFilter: searchTerm,
            mode: mode.toUpperCase()
        }
    });

    const content = response.data?.content ?? [];
    return Promise.all(content.map((opp: Record<string, unknown>) => mapOpportunity(opp)));
}

export async function fetchOpportunityById(id: string): Promise<Opportunity> {
    const response = await apiClient.get(`/api/v1/opportunities/get/${id}`);
    return mapOpportunity(response.data);
}

export async function fetchOpportunitiesWithMatches(
    candidateUserId: string,
    mode: string = 'PROFESSIONAL',
    page = 0,
    size = 50
): Promise<Opportunity[]> {
    const [opportunities, matches] = await Promise.all([
        fetchOpportunities('', mode, page, size),
        fetchCandidateMatches(candidateUserId, size).catch(() => []),
    ]);

    const matchByOpportunity = new Map(matches.map((match) => [match.opportunityId, match]));

    return opportunities.map((opp) => {
        const match = matchByOpportunity.get(opp.id);
        if (!match) return opp;
        return {
            ...opp,
            matchScore: match.finalScore,
            aiReasoning: match.aiReasoning,
        } as Opportunity & { aiReasoning?: string };
    });
}

export async function fetchOpportunityCount(mode: string = 'PROFESSIONAL'): Promise<number> {
    const response = await apiClient.get('/api/v1/opportunities/getAll', {
        params: {
            page: 0,
            size: 1,
            sortBy: 'createdAt',
            direction: 'DESC',
            mode: mode.toUpperCase()
        }
    });
    return Number(response.data?.totalElements ?? 0);
}

export async function updateApplicationStatus(applicationId: string, status: string) {
    const response = await apiClient.patch(`/api/v1/opportunities/${applicationId}/status`, null, {
        params: { status }
    });
    return response.data;
}

export async function fetchMyApplications(candidateId: string) {
    const response = await apiClient.get(`/api/v1/opportunities/applications/candidate/${candidateId}`);
    return response.data;
}

export async function createOpportunity(opportunityData: any): Promise<any> {
    const response = await apiClient.post('/api/v1/opportunities', opportunityData);
    return response.data;
}
