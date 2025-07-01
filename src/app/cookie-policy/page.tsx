import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: 'Informativa sui cookie utilizzati dal sito Maskio Barber Concept. Scopri come utilizziamo i cookie per migliorare la tua esperienza.',
  keywords: ['cookie policy', 'privacy', 'maskio barber', 'informativa cookie'],
  openGraph: {
    title: 'Cookie Policy | Maskio Barber Concept',
    description: 'Informativa sui cookie utilizzati dal sito Maskio Barber Concept.',
    type: 'website',
    locale: 'it_IT',
    url: 'https://www.maskiobarberconcept.it/cookie-policy',
  },
  alternates: {
    canonical: 'https://www.maskiobarberconcept.it/cookie-policy',
  }
};

export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Cookie Policy</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              Ultimo aggiornamento: {new Date().toLocaleDateString('it-IT')}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Cosa sono i cookie</h2>
              <p className="text-gray-700 mb-4">
                I cookie sono piccoli file di testo che vengono memorizzati sul tuo dispositivo quando visiti un sito web. 
                Ci aiutano a migliorare la tua esperienza di navigazione e a fornire servizi personalizzati.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Cookie utilizzati da Maskio Barber</h2>
              
              <div className="space-y-6">
                <div className="border-l-4 border-amber-500 pl-4">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Cookie Necessari</h3>
                  <p className="text-gray-700 mb-2">
                    Questi cookie sono essenziali per il funzionamento del sito web e non possono essere disabilitati.
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li><strong>next-auth.session-token</strong> - Gestione dell'autenticazione utente</li>
                    <li><strong>next-auth.csrf-token</strong> - Protezione da attacchi CSRF</li>
                  </ul>
                </div>

                <div className="border-l-4 border-blue-500 pl-4">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Cookie Analitici</h3>
                  <p className="text-gray-700 mb-2">
                    Questi cookie ci aiutano a capire come i visitatori utilizzano il sito web.
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li><strong>Google Analytics</strong> - Analisi del traffico del sito (se configurato)</li>
                  </ul>
                </div>

                <div className="border-l-4 border-green-500 pl-4">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Cookie di Terze Parti</h3>
                  <p className="text-gray-700 mb-2">
                    Questi cookie sono impostati da servizi esterni che utilizziamo.
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li><strong>Google OAuth</strong> - Autenticazione tramite account Google</li>
                    <li><strong>Google Places API</strong> - Visualizzazione delle recensioni</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Gestione dei cookie</h2>
              <p className="text-gray-700 mb-4">
                Puoi gestire i cookie attraverso le impostazioni del tuo browser. Tieni presente che 
                disabilitare alcuni cookie potrebbe influire sulla funzionalità del sito.
              </p>
              
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-amber-800 mb-2">Come disabilitare i cookie</h3>
                <ul className="list-disc list-inside text-amber-700 space-y-1">
                  <li><strong>Chrome:</strong> Impostazioni → Privacy e sicurezza → Cookie</li>
                  <li><strong>Firefox:</strong> Opzioni → Privacy e sicurezza → Cookie</li>
                  <li><strong>Safari:</strong> Preferenze → Privacy → Cookie</li>
                  <li><strong>Edge:</strong> Impostazioni → Privacy e sicurezza → Cookie</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Durata dei cookie</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cookie</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durata</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Scopo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 text-sm text-gray-900">Session Token</td>
                      <td className="px-6 py-4 text-sm text-gray-700">30 giorni</td>
                      <td className="px-6 py-4 text-sm text-gray-700">Mantenere l'accesso</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm text-gray-900">CSRF Token</td>
                      <td className="px-6 py-4 text-sm text-gray-700">Sessione</td>
                      <td className="px-6 py-4 text-sm text-gray-700">Sicurezza</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contatti</h2>
              <p className="text-gray-700">
                Per domande su questa Cookie Policy, contattaci all'indirizzo:{' '}                <a href="mailto:fabio.cassano97@icloud.com" className="text-amber-600 hover:text-amber-700">
                  fabio.cassano97@icloud.com
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
