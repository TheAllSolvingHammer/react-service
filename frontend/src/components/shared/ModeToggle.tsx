import { useTranslation } from 'react-i18next';
import { Briefcase, GraduationCap, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CandidateMode } from '@/lib/mode';

interface ModeToggleProps {
    mode: CandidateMode;
    onModeChange: (mode: CandidateMode) => void;
    isLoading?: boolean;
    compact?: boolean;
}

export default function ModeToggle({ mode, onModeChange, isLoading, compact }: ModeToggleProps) {
    const { t } = useTranslation();

    const baseClass = compact
        ? 'bg-[#f0edef]/80 p-1 rounded-xl border border-[#c6c6cd]/40 inline-flex items-center'
        : 'bg-white/60 p-1.5 rounded-2xl border border-[#c6c6cd]/40 inline-flex items-center shadow-sm backdrop-blur-md';

    return (
        <div className={baseClass} title={t('mode.toggleHint', 'Switch how AI and recruiters see your profile')}>
            {isLoading && (
                <Loader2 className="w-4 h-4 animate-spin text-brand-blue mx-1" />
            )}
            <Button
                variant={mode === 'professional' ? 'default' : 'ghost'}
                disabled={isLoading}
                onClick={() => onModeChange('professional')}
                className={`rounded-xl text-xs font-bold uppercase tracking-wider transition-all gap-1.5 ${
                    compact ? 'h-8 px-3' : 'h-10 px-5'
                } ${
                    mode === 'professional'
                        ? 'bg-gradient-to-r from-professional-emerald to-teal-500 text-white shadow-md'
                        : 'text-grey-muted hover:text-professional-emerald hover:bg-white/50'
                }`}
            >
                <Briefcase className="w-3.5 h-3.5" />
                {!compact && t('dashboard.professional', 'Professional')}
            </Button>
            <Button
                variant={mode === 'academic' ? 'default' : 'ghost'}
                disabled={isLoading}
                onClick={() => onModeChange('academic')}
                className={`rounded-xl text-xs font-bold uppercase tracking-wider transition-all gap-1.5 ${
                    compact ? 'h-8 px-3' : 'h-10 px-5'
                } ${
                    mode === 'academic'
                        ? 'bg-gradient-to-r from-academic-purple to-purple-500 text-white shadow-md'
                        : 'text-grey-muted hover:text-academic-purple hover:bg-white/50'
                }`}
            >
                <GraduationCap className="w-3.5 h-3.5" />
                {!compact && t('dashboard.academic', 'Academic')}
            </Button>
        </div>
    );
}
