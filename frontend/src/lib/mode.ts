export type CandidateMode = 'professional' | 'academic';

export type ApiExperienceMode = 'PROFESSIONAL' | 'ACADEMIC';

export function parseApiMode(value: unknown): CandidateMode {
    if (value === 'Academic' || value === 'ACADEMIC' || value === 'academic') {
        return 'academic';
    }
    return 'professional';
}

export function toApiMode(mode: CandidateMode): ApiExperienceMode {
    return mode === 'academic' ? 'ACADEMIC' : 'PROFESSIONAL';
}
