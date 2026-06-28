// src/types.ts

export interface Profile {
    id?: string;
    userId?: string;
    firstName?: string;
    middleName?: string;
    lastName?: string;
    fullName?: string;
    initials?: string;
    headline?: string;
    biography?: string;
    email: string;
    location?: string;
    skills: string[];
    skillIds?: string[];
    type?: 'academic' | 'professional' | 'institution';
    candidateType?: string;
    educationType?: string;
    birthday?: string;
    expectedSalary?: number;
    currentMode?: 'professional' | 'academic';
    avatarUrl?: string;
    isCompleted?: boolean;
    isUniversity?: boolean;
    sectorType?: string;
    resumeUrl?: string;
    portfolioUrl?: string;
    linkedinUrl?: string;
    experience?: Experience[];
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
    type?: string;
    salary?: string;
    postedDate?: string;
    aiReasoning?: string;
    jobStatus?: string;
}

export interface Applicant {
    id: string;
    name: string;
    role: string;
    email: string;
    location?: string;
    matchScore: number;
    status: "Ново" | "Преглед" | "Интервю" | "Приет" | "Отказан";
    appliedDate: string;
    skills: string[];
    candidateMode: 'academic' | 'professional';
    resumeUrl?: string;
}

export interface ApplicationActivity {
    id: string;
    title: string;
    company: string;
    status: string;
    date: string;
    logoColor?: string;
}