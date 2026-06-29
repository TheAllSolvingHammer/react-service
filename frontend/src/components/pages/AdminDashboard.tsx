import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { adminApi } from '@/lib/adminApi.ts';
import { Users, Tags, Trash2, Shield, PlusCircle, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';

export const AdminDashboard: React.FC = () => {
    //@ts-ignore
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<'users' | 'skills'>('users');
    
    // State
    const [users, setUsers] = useState<any[]>([]);
    const [skills, setSkills] = useState<any[]>([]);
    const [tags, setTags] = useState<any[]>([]);
    
    // Input state
    const [newSkillName, setNewSkillName] = useState('');
    const [newTagName, setNewTagName] = useState('');

    useEffect(() => {
        loadData();
    }, [activeTab]);

    const loadData = async () => {
        try {
            if (activeTab === 'users') {
                const u = await adminApi.getAllUsers();
                setUsers(u);
            } else {
                const s = await adminApi.getAllSkills();
                const t = await adminApi.getAllTags();
                setSkills(s);
                setTags(t);
            }
        } catch (error) {
            console.error('Failed to load admin data:', error);
        }
    };

    const handleToggleRestriction = async (userId: string, currentStatus: boolean) => {
        try {
            await adminApi.toggleUserRestriction(userId, !currentStatus);
            await loadData();
        } catch (error) {
            console.error(error);
        }
    };

    const handleCreateSkill = async () => {
        if (!newSkillName.trim()) return;
        try {
            await adminApi.createSkill(newSkillName);
            setNewSkillName('');
            await loadData();
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteSkill = async (id: string) => {
        try {
            await adminApi.deleteSkill(id);
            await loadData();
        } catch (error) {
            console.error(error);
        }
    };

    const handleCreateTag = async () => {
        if (!newTagName.trim()) return;
        try {
            await adminApi.createTag(newTagName);
            setNewTagName('');
            await loadData();
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteTag = async (id: string) => {
        try {
            await adminApi.deleteTag(id);
            await loadData();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
            <h1 className="text-3xl font-bold text-grey-dark dark:text-white mb-8">{t('admin.dashboard', 'Админ панел')}</h1>
            
            <div className="flex gap-4 mb-8">
                <button 
                    onClick={() => setActiveTab('users')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all ${activeTab === 'users' ? 'bg-brand-blue text-white shadow-md' : 'bg-white dark:bg-slate-800 text-grey-dark dark:text-white border border-grey-muted/30 dark:border-white/10 hover:bg-brand-blue/10 dark:hover:bg-white/5'}`}
                >
                    <Users className="w-5 h-5" />
                    {t('admin.users', 'Потребители')}
                </button>
                <button 
                    onClick={() => setActiveTab('skills')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all ${activeTab === 'skills' ? 'bg-brand-blue text-white shadow-md' : 'bg-white dark:bg-slate-800 text-grey-dark dark:text-white border border-grey-muted/30 dark:border-white/10 hover:bg-brand-blue/10 dark:hover:bg-white/5'}`}
                >
                    <Tags className="w-5 h-5" />
                    {t('admin.skillsAndTags', 'Умения и Тагове')}
                </button>
            </div>

            {activeTab === 'users' && (
                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl p-8 border border-grey-muted/20 dark:border-white/10 shadow-xl">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2 dark:text-white"><Shield className="text-brand-blue" /> {t('admin.userManagement', 'Управление на потребители')}</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-grey-muted/20 dark:border-white/10 text-grey-muted dark:text-slate-400">
                                    <th className="p-4 font-semibold">{t('admin.user', 'Потребител')}</th>
                                    <th className="p-4 font-semibold">{t('admin.email', 'Имейл')}</th>
                                    <th className="p-4 font-semibold">{t('admin.role', 'Роля')}</th>
                                    <th className="p-4 font-semibold">{t('admin.status', 'Статус')}</th>
                                    <th className="p-4 font-semibold text-right">{t('admin.actions', 'Действия')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Array.isArray(users) && users.map(user => (
                                    <tr key={user.id} className="border-b border-grey-muted/10 dark:border-white/5 hover:bg-brand-blue/5 dark:hover:bg-white/5 transition-colors">
                                        <td className="p-4 font-medium text-grey-dark dark:text-slate-200">{user.username}</td>
                                        <td className="p-4 text-grey-dark dark:text-slate-300">{user.email}</td>
                                        <td className="p-4">
                                            <span className="px-3 py-1 bg-brand-blue/10 text-brand-blue rounded-full text-sm font-semibold">{user.role}</span>
                                        </td>
                                        <td className="p-4">
                                            {user.isRestricted ? (
                                                <span className="flex items-center gap-1 text-red-500 text-sm font-semibold"><XCircle className="w-4 h-4"/> {t('admin.restricted', 'Ограничен')}</span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-green-500 text-sm font-semibold"><CheckCircle className="w-4 h-4"/> {t('admin.active', 'Активен')}</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-right">
                                            {user.role !== 'ADMIN' && (
                                                <button 
                                                    onClick={() => handleToggleRestriction(user.id, user.isRestricted)}
                                                    className={`px-4 py-2 rounded-xl font-semibold transition-all ${user.isRestricted ? 'bg-green-500/10 text-green-600 hover:bg-green-500/20' : 'bg-red-500/10 text-red-600 hover:bg-red-500/20'}`}
                                                >
                                                    {user.isRestricted ? t('admin.removeRestriction', 'Премахни ограничение') : t('admin.restrict', 'Ограничи')}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'skills' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Skills */}
                    <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl border-0 shadow-xl p-2">
                        <CardHeader>
                            <CardTitle className="text-xl flex items-center justify-between dark:text-white">
                                {t('admin.skills', 'Умения')}
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        value={newSkillName}
                                        onChange={e => setNewSkillName(e.target.value)}
                                        className="text-sm px-4 py-2 rounded-xl border border-grey-muted/30 dark:border-white/10 dark:bg-slate-800 dark:text-white focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none"
                                        placeholder={t('admin.newSkill', 'Ново умение...')}
                                    />
                                    <button onClick={handleCreateSkill} className="bg-brand-blue text-white p-2 rounded-xl hover:bg-blue-600 transition-colors">
                                        <PlusCircle className="w-5 h-5" />
                                    </button>
                                </div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-3">
                                {Array.isArray(skills) && skills.map(skill => (
                                    <div key={skill.id} className="flex items-center gap-2 bg-brand-blue/10 text-brand-blue px-4 py-2 rounded-xl font-medium">
                                        {skill.name}
                                        <button onClick={() => handleDeleteSkill(skill.id)} className="text-red-400 hover:text-red-600">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Tags */}
                    <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl border-0 shadow-xl p-2">
                        <CardHeader>
                            <CardTitle className="text-xl flex items-center justify-between dark:text-white">
                                {t('admin.tags', 'Тагове')}
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        value={newTagName}
                                        onChange={e => setNewTagName(e.target.value)}
                                        className="text-sm px-4 py-2 rounded-xl border border-grey-muted/30 dark:border-white/10 dark:bg-slate-800 dark:text-white focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none"
                                        placeholder={t('admin.newTag', 'Нов таг...')}
                                    />
                                    <button onClick={handleCreateTag} className="bg-brand-blue text-white p-2 rounded-xl hover:bg-blue-600 transition-colors">
                                        <PlusCircle className="w-5 h-5" />
                                    </button>
                                </div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-3">
                                {Array.isArray(tags) && tags.map(tag => (
                                    <div key={tag.id} className="flex items-center gap-2 bg-purple-500/10 text-purple-600 px-4 py-2 rounded-xl font-medium">
                                        {tag.name}
                                        <button onClick={() => handleDeleteTag(tag.id)} className="text-red-400 hover:text-red-600">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};
