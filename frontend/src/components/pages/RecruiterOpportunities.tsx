import {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {Input} from "@/components/ui/input";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table.tsx";
import {Archive, Building2, Eye, LayoutGrid, List as ListIcon, Loader2, Plus, Search} from 'lucide-react';
import {Opportunity, Profile} from '@/lib/types';
import {archiveOpportunity, fetchOpportunities} from '@/lib/opportunities';
import {toast} from "sonner";

interface RecruiterOpportunitiesProps {
    profile: Profile;
    setCurrentTab: (tab: string) => void;
}

export default function RecruiterOpportunities({profile, setCurrentTab}: RecruiterOpportunitiesProps) {
    const {t} = useTranslation();
    const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

    useEffect(() => {
        const loadOpps = async () => {
            setIsLoading(true);
            try {
                const opps = await fetchOpportunities('', profile.isUniversity ? 'ACADEMIC' : 'PROFESSIONAL');
                setOpportunities(opps);
            } catch (error) {
                console.error("Failed to fetch recruiter opportunities:", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadOpps();
    }, [profile]);

    const filteredOpps = opportunities.filter(opp =>
        opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opp.company?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleArchive = async (id: string) => {
        if (!confirm(t('recruiterOpps.confirmArchive', 'Сигурни ли сте, че искате да архивирате тази обява?'))) {
            return;
        }

        setIsLoading(true);
        try {
            await archiveOpportunity(id);
            setOpportunities(prev => prev.map(opp => opp.id === id ? {...opp, jobStatus: 'ARCHIVED'} : opp));
            toast.success(t('recruiterOpps.archiveSuccess', 'Обявата е успешно архивирана.'));
        } catch (error) {
            toast.error(t('recruiterOpps.archiveError', 'Грешка при архивиране на обявата.'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in max-w-7xl mx-auto pb-12 relative">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-display font-extrabold text-grey-dark tracking-tight">
                        {t('recruiterOpps.title', 'Моите Обяви')}
                    </h1>
                    <p className="text-grey-muted mt-1">
                        {t('recruiterOpps.subtitle', 'Управлявайте вашите активни обяви и кампании.')}
                    </p>
                </div>

                <div className="flex gap-3">
                    <Button
                        onClick={() => setCurrentTab('recruiter_create_opportunity')}
                        className="bg-brand-blue hover:bg-indigo-600 text-white font-bold rounded-xl shadow-md transition-all h-11"
                    >
                        <Plus className="w-5 h-5 mr-2"/>
                        {t('recruiterOpps.create', 'Създай нова обява')}
                    </Button>
                </div>
            </div>

            <Card
                className="rounded-3xl border border-[#c6c6cd]/50 dark:border-white/10 shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
                <CardHeader
                    className="border-b border-[#f0edef] dark:border-white/10 bg-slate-50/50 dark:bg-slate-800/50 pb-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="relative max-w-md w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-grey-muted"/>
                            <Input
                                placeholder={t('recruiterOpps.search', 'Търсене на обяви...')}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 bg-white dark:bg-slate-900 border-[#c6c6cd]/50 dark:border-white/10 rounded-xl focus-visible:ring-brand-blue/20"
                            />
                        </div>
                        <div className="flex gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setViewMode('table')}
                                className={`rounded-lg px-3 ${viewMode === 'table' ? 'bg-white dark:bg-slate-700 shadow-sm text-brand-blue' : 'text-grey-muted dark:text-slate-400'}`}
                            >
                                <ListIcon className="w-4 h-4"/>
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setViewMode('grid')}
                                className={`rounded-lg px-3 ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 shadow-sm text-brand-blue' : 'text-grey-muted dark:text-slate-400'}`}
                            >
                                <LayoutGrid className="w-4 h-4"/>
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex justify-center items-center py-24">
                            <Loader2 className="w-8 h-8 text-brand-blue animate-spin"/>
                        </div>
                    ) : filteredOpps.length === 0 ? (
                        <div className="text-center py-16">
                            <div
                                className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Building2 className="w-8 h-8 text-grey-muted dark:text-slate-500"/>
                            </div>
                            <h3 className="text-lg font-bold text-grey-dark dark:text-slate-200 mb-1">{t('recruiterOpps.noOpps', 'Няма намерени обяви')}</h3>
                            <p className="text-grey-muted dark:text-slate-400 text-sm">{t('recruiterOpps.noOppsDesc', 'Опитайте с друго търсене или създайте нова обява.')}</p>
                        </div>
                    ) : viewMode === 'table' ? (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-slate-50/50 dark:bg-slate-800/50">
                                    <TableRow className="border-slate-200 dark:border-white/10">
                                        <TableHead
                                            className="font-bold text-grey-muted dark:text-slate-400">{t('recruiterOpps.colRole', 'Позиция / Заглавие')}</TableHead>
                                        <TableHead
                                            className="font-bold text-grey-muted dark:text-slate-400">{t('recruiterOpps.colType', 'Тип')}</TableHead>
                                        <TableHead
                                            className="font-bold text-grey-muted dark:text-slate-400">{t('recruiterOpps.colLocation', 'Локация')}</TableHead>
                                        <TableHead
                                            className="font-bold text-grey-muted dark:text-slate-400">{t('recruiterOpps.colReqs', 'Изисквания')}</TableHead>
                                        <TableHead
                                            className="text-right font-bold text-grey-muted dark:text-slate-400">{t('recruiterOpps.colActions', 'Действия')}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredOpps.map((opp) => (
                                        <TableRow key={opp.id}
                                                  className="border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group">
                                            <TableCell className="font-medium">
                                                <div className="flex flex-col">
                                                    <span
                                                        className="text-grey-dark dark:text-slate-200 font-bold">{opp.title}</span>
                                                    <span
                                                        className="text-xs text-grey-muted dark:text-slate-500">ID: {opp.id.substring(0, 8)}...</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {opp.type && (
                                                    <Badge variant="outline"
                                                           className="bg-blue-50/50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800 text-[10px] whitespace-nowrap">
                                                        {opp.type.replace('_', ' ')}
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <span className="inline-flex items-center gap-1 text-sm text-grey-dark">
                                                    <Building2
                                                        className="w-3.5 h-3.5 text-grey-muted"/> {opp.company || opp.location}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1">
                                                    {opp.requirements?.slice(0, 2).map((req, i) => (
                                                        <Badge key={i} variant="outline"
                                                               className="text-[10px] bg-white dark:bg-slate-800 border-[#c6c6cd]/40 dark:border-white/10 text-slate-700 dark:text-slate-300">
                                                            {req}
                                                        </Badge>
                                                    ))}
                                                    {(opp.requirements?.length || 0) > 2 && (
                                                        <Badge variant="outline"
                                                               className="text-[10px] bg-slate-100 dark:bg-slate-700 border-transparent text-slate-700 dark:text-slate-300">
                                                            +{(opp.requirements?.length || 0) - 2}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div
                                                    className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button variant="outline" size="sm"
                                                            className="h-8 w-8 p-0 rounded-lg text-brand-blue border-brand-blue/20 hover:bg-brand-blue hover:text-white">
                                                        <Eye className="w-4 h-4"/>
                                                    </Button>
                                                    {opp.jobStatus !== 'ARCHIVED' && opp.jobStatus !== 'Archived' && (
                                                        <Button variant="outline" size="sm"
                                                                onClick={() => handleArchive(opp.id)}
                                                                className="h-8 w-8 p-0 rounded-lg text-red-600 border-red-600/20 hover:bg-red-600 hover:text-white dark:hover:border-red-600"
                                                                title={t('recruiterOpps.archive', 'Архивиране')}>
                                                            <Archive className="w-4 h-4"/>
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                            {filteredOpps.map((opp) => (
                                <Card key={opp.id}
                                      className="rounded-2xl border border-[#c6c6cd]/40 dark:border-white/10 dark:bg-slate-900 shadow-sm hover:shadow-md transition-shadow group flex flex-col">
                                    <CardHeader className="pb-3 border-b border-[#f0edef]/50 dark:border-white/10">
                                        <div className="flex justify-between items-start gap-2">
                                            <CardTitle
                                                className="text-lg font-bold text-grey-dark dark:text-slate-200 leading-tight group-hover:text-brand-blue transition-colors">
                                                {opp.title}
                                            </CardTitle>
                                            {opp.jobStatus === 'ARCHIVED' || opp.jobStatus === 'Archived' ? (
                                                <Badge variant="outline"
                                                       className="bg-slate-100 dark:bg-slate-800 border-transparent text-xs whitespace-nowrap text-slate-500 dark:text-slate-400">
                                                    {t('recruiterOpps.archivedLabel', 'Архивирана')}
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline"
                                                       className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-xs whitespace-nowrap text-green-700 dark:text-green-400">
                                                    {t('recruiterOpps.active', 'Активна')}
                                                </Badge>
                                            )}
                                        </div>
                                        {opp.type && (
                                            <div className="mt-2">
                                                <Badge variant="outline"
                                                       className="bg-blue-50/50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800 text-[10px]">
                                                    {opp.type.replace('_', ' ')}
                                                </Badge>
                                            </div>
                                        )}
                                        <p className="text-sm text-grey-muted flex items-center gap-1.5 mt-2">
                                            <Building2 className="w-4 h-4"/> {opp.company || opp.location}
                                        </p>
                                    </CardHeader>
                                    <CardContent className="pt-4 flex-1 flex flex-col justify-between gap-4">
                                        <div className="flex flex-wrap gap-1.5">
                                            {opp.requirements?.slice(0, 4).map((req, i) => (
                                                <Badge key={i} variant="secondary"
                                                       className="bg-brand-blue/5 text-brand-blue border-0 font-medium text-xs">
                                                    {req}
                                                </Badge>
                                            ))}
                                        </div>
                                        <div
                                            className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-white/10">
                                            <Button variant="ghost" size="sm"
                                                    className="h-8 px-2 text-brand-blue hover:bg-brand-blue/10 rounded-lg">
                                                <Eye className="w-4 h-4 mr-1.5"/> {t('recruiterOpps.view', 'Преглед')}
                                            </Button>
                                            {opp.jobStatus !== 'ARCHIVED' && opp.jobStatus !== 'Archived' && (
                                                <Button variant="ghost" size="sm" onClick={() => handleArchive(opp.id)}
                                                        className="h-8 px-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                                        title={t('recruiterOpps.archive', 'Архивиране')}>
                                                    <Archive
                                                        className="w-4 h-4 mr-1.5"/> {t('recruiterOpps.archive', 'Архив')}
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
