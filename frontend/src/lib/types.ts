// src/types.ts

export interface Profile {
    id?: string;
    name: string;
    role: string;
    email: string;
    location: string;
    bio: string;
    skills: string[];
    type?: 'academic' | 'professional' | 'institution';
    avatarUrl?: string;
    isCompleted?: boolean;
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
}

export interface Applicant {
    id: string;
    name: string;
    role: string;
    email: string;
    matchScore: number;
    status: "Ново" | "Интервю" | "Преглед";
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