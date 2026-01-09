'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type ConsentStatus = 'granted' | 'denied' | null;

interface CookieConsentContextType {
    consent: ConsentStatus;
    acceptCookies: () => void;
    declineCookies: () => void;
    resetConsent: () => void;
}

const CookieConsentContext = createContext<CookieConsentContextType | undefined>(undefined);

export function CookieConsentProvider({ children }: { children: React.ReactNode }) {
    const [consent, setConsent] = useState<ConsentStatus>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // Only access localStorage on the client
        const storedConsent = localStorage.getItem('cookie_consent') as ConsentStatus;
        if (storedConsent) {
            setConsent(storedConsent);
        }
        setMounted(true);
    }, []);

    const acceptCookies = () => {
        setConsent('granted');
        localStorage.setItem('cookie_consent', 'granted');

        // Trigger Google Consent Mode update if GTM/GA is present
        if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('consent', 'update', {
                'analytics_storage': 'granted'
            });
        }
    };

    const declineCookies = () => {
        setConsent('denied');
        localStorage.setItem('cookie_consent', 'denied');

        // Trigger Google Consent Mode update if GTM/GA is present
        if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('consent', 'update', {
                'analytics_storage': 'denied'
            });
        }
    };

    const resetConsent = () => {
        setConsent(null);
        localStorage.removeItem('cookie_consent');
    };

    // Prevent hydration mismatch by not rendering provider logic until mounted 
    // (though checking localStorage in useEffect handles this, usually safer to just render children)
    // But here we want the context value to be accurate.

    return (
        <CookieConsentContext.Provider value={{ consent, acceptCookies, declineCookies, resetConsent }}>
            {children}
        </CookieConsentContext.Provider>
    );
}

export function useCookieConsent() {
    const context = useContext(CookieConsentContext);
    if (context === undefined) {
        throw new Error('useCookieConsent must be used within a CookieConsentProvider');
    }
    return context;
}
