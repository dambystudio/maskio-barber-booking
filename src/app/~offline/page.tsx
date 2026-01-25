import Link from 'next/link';
import { Metadata } from 'next';
import OfflineRetryButton from '@/components/OfflineRetryButton';

export const metadata: Metadata = {
    title: 'Offline | Maskio Barber',
    description: 'Sei offline. Controlla la tua connessione.',
};

export const dynamic = 'force-static';

export default function OfflinePage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-900 text-white p-4">
            <div className="text-center max-w-md">
                <h1 className="text-4xl font-bold mb-4">Sei Offline</h1>
                <p className="text-neutral-300 mb-8">
                    Sembra che tu non abbia una connessione internet attiva.
                    Per favore controlla la tua rete e riprova.
                </p>

                <div className="bg-neutral-800 p-6 rounded-lg mb-8">
                    <h2 className="text-xl font-semibold mb-2">Hai appuntamenti salvati?</h2>
                    <p className="text-sm text-neutral-400">
                        I tuoi appuntamenti recenti potrebbero essere visibili nella cache se hai visitato la pagina di recente.
                    </p>
                </div>

                <OfflineRetryButton />
            </div>
        </div>
    );
}
