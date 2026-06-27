import apiClient from '@/lib/axios';

export interface SkillRecord {
    id: string;
    name: string;
}

let cachedSkills: SkillRecord[] | null = null;

export async function fetchAllSkills(): Promise<SkillRecord[] | null> {
    if (cachedSkills) return cachedSkills;

    const response = await apiClient.get('/api/v1/utils/skills?page=0&size=100&sortBy=name&direction=ASC');
    const content = response.data?.content ?? [];
    cachedSkills = content.map((skill: Record<string, unknown>) => ({
        id: String(skill.id),
        name: String(skill.name ?? ''),
    }));
    return cachedSkills;
}

export async function resolveSkillNames(skillIds: string[] | undefined): Promise<string[]> {
    if (!skillIds?.length) return [];
    const skills = await fetchAllSkills() ?? [];
    const byId = new Map(skills.map((skill) => [skill.id, skill.name]));
    return skillIds.map((id) => byId.get(id) ?? id);
}

export async function resolveSkillIds(skillNames: string[]): Promise<string[]> {
    const skills = await fetchAllSkills() ?? [];
    const byName = new Map(skills.map((skill) => [skill.name.toLowerCase(), skill.id]));
    const ids: string[] = [];

    for (const name of skillNames) {
        const existing = byName.get(name.toLowerCase());
        if (existing) {
            ids.push(existing);
            continue;
        }

        const created = await apiClient.post('/api/v1/utils/skills', { name, tagIds: [] });
        const id = String(created.data.id);
        byName.set(name.toLowerCase(), id);
        ids.push(id);
        cachedSkills = null;
    }

    return ids;
}
