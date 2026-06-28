import {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {Input} from "@/components/ui/input";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Loader2, Search, Plus, Edit2, Trash2, Building2, Eye, LayoutGrid, List as ListIcon} from 'lucide-react';
import {Opportunity, Profile} from '@/lib/types';
import {fetchOpportunities} from '@/lib/opportunities';

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
                // Fetching all for now; in a real scenario, this would call an endpoint to get only the institution's opportunities
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

    return (
        <div className="space-y-6 animate-fade-in max-w-7xl mx-auto pb-12 relative">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-display font-extrabold text-grey-dark tracking-tight">
                        {t('recruiterOpps.title', 'Моите Обяви')}
                    </h1>
                    <p className="text-grey-muted mt-1">
                        Управлявайте вашите активни обяви и кампании.
                    </p>
                </div>

                <div className="flex gap-3">
                    <Button
                        onClick={() => setCurrentTab('recruiter_create_opportunity')}
                        className="bg-brand-blue hover:bg-indigo-600 text-white font-bold rounded-xl shadow-md transition-all h-11"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Създай нова обява
                    </Button>
                </div>
            </div>

            <Card className="rounded-3xl border border-[#c6c6cd]/50 shadow-sm bg-white overflow-hidden">
                <CardHeader className="border-b border-[#f0edef] bg-slate-50/50 pb-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="relative max-w-md w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-grey-muted" />
                            <Input
                                placeholder="Търсене на обяви..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 bg-white border-[#c6c6cd]/50 rounded-xl focus-visible:ring-brand-blue/20"
                            />
                        </div>
                        <div className="flex gap-2 bg-[#f0edef]/50 p-1 rounded-xl">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setViewMode('table')}
                                className={`rounded-lg px-3 ${viewMode === 'table' ? 'bg-white shadow-sm text-brand-blue' : 'text-grey-muted'}`}
                            >
                                <ListIcon className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setViewMode('grid')}
                                className={`rounded-lg px-3 ${viewMode === 'grid' ? 'bg-white shadow-sm text-brand-blue' : 'text-grey-muted'}`}
                            >
                                <LayoutGrid className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex justify-center items-center py-24">
                            <Loader2 className="w-8 h-8 text-brand-blue animate-spin" />
                        </div>
                    ) : filteredOpps.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="w-16 h-16 bg-[#f0edef] rounded-full flex items-center justify-center mx-auto mb-4">
                                <Building2 className="w-8 h-8 text-grey-muted" />
                            </div>
                            <h3 className="text-lg font-bold text-grey-dark mb-1">Няма намерени обяви</h3>
                            <p className="text-grey-muted text-sm">Опитайте с друго търсене или създайте нова обява.</p>
                        </div>
                    ) : viewMode === 'table' ? (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-slate-50/50">
                                    <TableRow className="border-[#f0edef]">
                                        <TableHead className="font-bold text-grey-muted">Позиция / Заглавие</TableHead>
                                        <TableHead className="font-bold text-grey-muted">Локация</TableHead>
                                        <TableHead className="font-bold text-grey-muted">Изисквания</TableHead>
                                        <TableHead className="text-right font-bold text-grey-muted">Действия</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredOpps.map((opp) => (
                                        <TableRow key={opp.id} className="border-[#f0edef] hover:bg-[#fcf8fa]/40 transition-colors group">
                                            <TableCell className="font-medium">
                                                <div className="flex flex-col">
                                                    <span className="text-grey-dark font-bold">{opp.title}</span>
                                                    <span className="text-xs text-grey-muted">ID: {opp.id.substring(0, 8)}...</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="inline-flex items-center gap-1 text-sm text-grey-dark">
                                                    <Building2 className="w-3.5 h-3.5 text-grey-muted" /> {opp.company || opp.location}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1">
                                                    {opp.requirements?.slice(0, 2).map((req, i) => (
                                                        <Badge key={i} variant="outline" className="text-[10px] bg-white border-[#c6c6cd]/40">
                                                            {req}
                                                        </Badge>
                                                    ))}
                                                    {(opp.requirements?.length || 0) > 2 && (
                                                        <Badge variant="outline" className="text-[10px] bg-[#f0edef] border-transparent">
                                                            +{(opp.requirements?.length || 0) - 2}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-lg text-brand-blue border-brand-blue/20 hover:bg-brand-blue hover:text-white">
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                    <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-lg text-amber-600 border-amber-600/20 hover:bg-amber-600 hover:text-white">
                                                        <Edit2 className="w-4 h-4" />
                                                    </Button>
                                                    <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-lg text-red-600 border-red-600/20 hover:bg-red-600 hover:text-white">
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
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
                                <Card key={opp.id} className="rounded-2xl border border-[#c6c6cd]/40 shadow-sm hover:shadow-md transition-shadow group flex flex-col">
                                    <CardHeader className="pb-3 border-b border-[#f0edef]/50">
                                        <div className="flex justify-between items-start gap-2">
                                            <CardTitle className="text-lg font-bold text-grey-dark leading-tight group-hover:text-brand-blue transition-colors">
                                                {opp.title}
                                            </CardTitle>
                                            <Badge variant="outline" className="bg-[#f0edef] border-transparent text-xs whitespace-nowrap">
                                                Активна
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-grey-muted flex items-center gap-1.5 mt-2">
                                            <Building2 className="w-4 h-4" /> {opp.company || opp.location}
                                        </p>
                                    </CardHeader>
                                    <CardContent className="pt-4 flex-1 flex flex-col justify-between gap-4">
                                        <div className="flex flex-wrap gap-1.5">
                                            {opp.requirements?.slice(0, 4).map((req, i) => (
                                                <Badge key={i} variant="secondary" className="bg-brand-blue/5 text-brand-blue border-0 font-medium text-xs">
                                                    {req}
                                                </Badge>
                                            ))}
                                        </div>
                                        <div className="flex justify-end gap-2 pt-2 border-t border-[#f0edef]/50">
                                            <Button variant="ghost" size="sm" className="h-8 px-2 text-brand-blue hover:bg-brand-blue/10 rounded-lg">
                                                <Eye className="w-4 h-4 mr-1.5" /> Преглед
                                            </Button>
                                            <Button variant="ghost" size="sm" className="h-8 px-2 text-amber-600 hover:bg-amber-50 rounded-lg">
                                                <Edit2 className="w-4 h-4 mr-1.5" /> Редакция
                                            </Button>
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
