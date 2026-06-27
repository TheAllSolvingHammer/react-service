// src/types.ts

export interface Profile {
    id?: string;
    userId?: string;
    name: string;
    role: string;
    email: string;
    location: string;
    bio: string;
    skills: string[];
    skillIds?: string[];
    type?: 'academic' | 'professional' | 'institution';
    candidateType?: string;
    educationType?: string;
    birthday?: string;
    currentMode?: 'professional' | 'academic';
    avatarUrl?: string;
    isCompleted?: boolean;
    isUniversity?: boolean;
    sectorType?: string;
}

export interface Experience {
    id: string;
    title: string;
    organization: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    currentlyActive?: boolean;
    mode?: string;
}

export interface Opportunity {
    id: string;
    title: string;
    company: string;
    location?: string;
    description?: string;
    requirements?: string[];
    matchScore: number;
    tags: string[];
    salary?: string;
    postedDate?: string;
    aiReasoning?: string;
}

export interface Applicant {
    id: string;
    name: string;
    role: string;
    email: string;
    matchScore: number;
    status: "Ново" | "Преглед" | "Интервю" | "Приет" | "Отказан";
    appliedDate: string;
    skills: string[];
    candidateMode: 'academic' | 'professional';
}

export interface ApplicationActivity {
    id: string;
    title: string;
    company: string;
    status: string;
    date: string;
    logoColor?: string;
}