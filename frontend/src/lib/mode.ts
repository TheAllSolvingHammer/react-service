export type CandidateMode = 'professional' | 'academic';

// ОБНОВЕНО: Използваме изцяло главни букви, за да съвпадат с Java Enum-а
export type ApiExperienceMode = 'PROFESSIONAL' | 'ACADEMIC';

export function parseApiMode(value: unknown): CandidateMode {
    if (value === 'Academic' || value === 'ACADEMIC' || value === 'academic') {
        return 'academic';
    }
    return 'professional';
}

export function toApiMode(mode: CandidateMode): ApiExperienceMode {
    // ОБНОВЕНО: Връщаме изцяло главни букви към бекенда
    return mode === 'academic' ? 'ACADEMIC' : 'PROFESSIONAL';
}
