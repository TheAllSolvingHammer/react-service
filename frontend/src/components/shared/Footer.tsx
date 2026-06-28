import React from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, Phone, MapPin } from 'lucide-react';
import { FiGithub, FiLinkedin, FiTwitter } from 'react-icons/fi';

export const Footer: React.FC = () => {
    const { t } = useTranslation();

    return (
        <footer className="bg-white/80 backdrop-blur-md border-t border-[#c6c6cd]/30 mt-auto pt-16 pb-8 px-4 sm:px-6 lg:px-8 z-10 relative">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                <div className="md:col-span-2">
                    <div className="text-2xl font-black tracking-tighter text-brand-blue mb-4">
                        RecruitAI<span className="text-purple-600">.</span>
                    </div>
                    <p className="text-grey-muted mb-6 max-w-sm">
                        {t('footer.description', 'Свързваме талантите с най-добрите възможности чрез иновативни AI алгоритми. Открийте своето бъдеще днес.')}
                    </p>
                    <div className="flex gap-4">
                        <a href="#" className="w-10 h-10 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue hover:bg-brand-blue hover:text-white transition-all">
                            {/* Сменени на FiTwitter, FiLinkedin, FiGithub */}
                            <FiTwitter className="w-5 h-5" />
                        </a>
                        <a href="#" className="w-10 h-10 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue hover:bg-brand-blue hover:text-white transition-all">
                            <FiLinkedin className="w-5 h-5" />
                        </a>
                        <a href="#" className="w-10 h-10 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue hover:bg-brand-blue hover:text-white transition-all">
                            <FiGithub className="w-5 h-5" />
                        </a>
                    </div>
                </div>

                <div>
                    <h4 className="font-bold text-grey-dark mb-4 text-lg">{t('footer.quickLinks', 'Бързи връзки')}</h4>
                    <ul className="space-y-3">
                        <li><a href="#" className="text-grey-muted hover:text-brand-blue transition-colors">{t('footer.aboutUs', 'За нас')}</a></li>
                        <li><a href="#" className="text-grey-muted hover:text-brand-blue transition-colors">{t('footer.terms', 'Общи условия')}</a></li>
                        <li><a href="#" className="text-grey-muted hover:text-brand-blue transition-colors">{t('footer.privacy', 'Политика за поверителност')}</a></li>
                        <li><a href="#" className="text-grey-muted hover:text-brand-blue transition-colors">{t('footer.faq', 'ЧЗВ (FAQ)')}</a></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold text-grey-dark mb-4 text-lg">{t('footer.contacts', 'Контакти')}</h4>
                    <ul className="space-y-4">
                        <li className="flex items-start gap-3">
                            <MapPin className="w-5 h-5 text-brand-blue shrink-0 mt-0.5" />
                            <span className="text-grey-muted">{t('footer.location', 'Варна, България')}<br/>{t('footer.location2', 'Технически Университет')}</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <Phone className="w-5 h-5 text-brand-blue shrink-0" />
                            <span className="text-grey-muted">+359 888 123 456</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <Mail className="w-5 h-5 text-brand-blue shrink-0" />
                            <span className="text-grey-muted">support@recruitai.bg</span>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="max-w-7xl mx-auto pt-8 border-t border-[#c6c6cd]/30 flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-grey-muted text-sm">
                    &copy; {new Date().getFullYear()} RecruitAI. {t('footer.rights', 'Всички права запазени.')}
                </p>
                <div className="flex gap-6 text-sm">
                    <a href="#" className="text-grey-muted hover:text-brand-blue transition-colors">{t('footer.blog', 'Блог')}</a>
                    <a href="#" className="text-grey-muted hover:text-brand-blue transition-colors">{t('footer.support', 'Поддръжка')}</a>
                </div>
            </div>
        </footer>
    );
};