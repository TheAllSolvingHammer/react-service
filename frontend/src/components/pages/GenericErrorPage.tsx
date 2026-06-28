import { AlertTriangle, Home, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GenericErrorPageProps {
    message?: string;
    onRetry?: () => void;
    onHome?: () => void;
}

export default function GenericErrorPage({ message, onRetry, onHome }: GenericErrorPageProps) {
    return (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center animate-fade-in">
            <div className="w-24 h-24 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-6">
                <AlertTriangle className="w-12 h-12 text-red-500" />
            </div>
            
            <h1 className="text-4xl font-display font-black text-grey-dark dark:text-white mb-4">
                Възникна Проблем
            </h1>
            
            <p className="text-lg text-grey-muted max-w-md mb-8">
                {message || "Неразрешен достъп или заявката не може да бъде изпълнена. Моля, опитайте отново по-късно."}
            </p>
            
            <div className="flex gap-4">
                {onRetry && (
                    <Button 
                        onClick={onRetry}
                        variant="outline"
                        className="rounded-xl border-[#c6c6cd] hover:border-brand-blue"
                    >
                        <RefreshCcw className="w-4 h-4 mr-2" />
                        Опитай отново
                    </Button>
                )}
                {onHome && (
                    <Button 
                        onClick={onHome}
                        className="rounded-xl bg-brand-blue hover:bg-brand-blue-dark text-white shadow-md"
                    >
                        <Home className="w-4 h-4 mr-2" />
                        Към Начало
                    </Button>
                )}
            </div>
        </div>
    );
}
