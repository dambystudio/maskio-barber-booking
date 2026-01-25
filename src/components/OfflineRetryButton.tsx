'use client';

export default function OfflineRetryButton() {
    return (
        <button
            onClick={() => window.location.reload()}
            className="bg-primary text-black font-medium py-3 px-8 rounded-full hover:bg-white transition-colors"
        >
            Riprova
        </button>
    );
}
