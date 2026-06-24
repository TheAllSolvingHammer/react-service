import apiClient from '@/lib/axios';
import { Opportunity } from '@/lib/types';
import { fetchCandidateMatches } from '@/lib/matching';
import { resolveSkillNames } from '@/lib/skills';

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
    const resolvedNames = requirementIds.length ? await resolveSkillNames(requirementIds) : [];
    const requirementList = resolvedNames.length
        ? resolvedNames
        : rawRequirements.map(requirementLabel);

    return {
        id: String(opp.id),
        title: String(opp.title ?? ''),
        company: String(opp.location ?? 'RecruitAI'),
        location: opp.location ? String(opp.location) : undefined,
        description: opp.description ? String(opp.description) : undefined,
        requirements: requirementList,
        matchScore: 0,
        tags: requirementList.slice(0, 3),
    };
}

export async function fetchOpportunities(page = 0, size = 50): Promise<Opportunity[]> {
    const response = await apiClient.get(
        `/api/v1/opportunities/getAll?page=${page}&size=${size}&sortBy=createdAt&direction=DESC&nameFilter=`
    );
    const content = response.data?.content ?? [];
    return Promise.all(content.map((opp: Record<string, unknown>) => mapOpportunity(opp)));
}

export async function fetchOpportunitiesWithMatches(
    candidateUserId: string,
    page = 0,
    size = 50
): Promise<Opportunity[]> {
    const [opportunities, matches] = await Promise.all([
        fetchOpportunities(page, size),
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

export async function fetchOpportunityCount(): Promise<number> {
    const response = await apiClient.get(
        '/api/v1/opportunities/getAll?page=0&size=1&sortBy=createdAt&direction=DESC&nameFilter='
    );
    return Number(response.data?.totalElements ?? 0);
}
