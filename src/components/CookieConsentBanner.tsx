'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useCookieConsent } from './CookieConsentContext';

export default function CookieConsentBanner() {
    const { consent, acceptCookies, declineCookies } = useCookieConsent();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Show banner only if consent is null (user hasn't chosen yet)
        // Small delay to prevent flashing on load
        const timer = setTimeout(() => {
            if (consent === null) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        }, 1000);

        return () => clearTimeout(timer);
    }, [consent]);

    if (!isVisible && consent !== null) return null;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
                >
                    <div className="max-w-7xl mx-auto">
                        <div className="bg-white/95 backdrop-blur-md border border-gray-200 shadow-[0_-4px_24px_rgba(0,0,0,0.1)] rounded-2xl p-6 md:flex md:items-center md:justify-between gap-6">

                            <div className="flex-1 mb-6 md:mb-0">
                                <div className="flex items-start gap-4">
                                    <div className="hidden sm:flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-yellow-100 text-yellow-600">
                                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                            Rispettiamo la tua privacy
                                        </h3>
                                        <p className="text-gray-600 text-sm leading-relaxed">
                                            Utilizziamo i cookie per migliorare la tua esperienza e analizzare il traffico del sito.
                                            Cliccando su "Accetta tutto", acconsenti all'uso di tutti i cookie.
                                            Puoi rifiutare o modificare le tue preferenze in qualsiasi momento.
                                            <Link href="/cookie-policy" className="text-yellow-600 hover:text-yellow-700 font-medium ml-1 underline decoration-yellow-600/30 hover:decoration-yellow-600">
                                                Leggi la Cookie Policy
                                            </Link>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 min-w-fit">
                                <button
                                    onClick={declineCookies}
                                    className="px-6 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium bg-white hover:bg-gray-50 hover:text-gray-900 transition-colors focus:ring-4 focus:ring-gray-100"
                                >
                                    Rifiuta
                                </button>
                                <button
                                    onClick={acceptCookies}
                                    className="px-6 py-2.5 rounded-xl bg-yellow-500 text-white font-semibold hover:bg-yellow-400 shadow-lg shadow-yellow-500/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] focus:ring-4 focus:ring-yellow-500/30"
                                >
                                    Accetta tutto
                                </button>
                            </div>

                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
