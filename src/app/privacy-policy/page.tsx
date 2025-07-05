import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Maskio Barber',
  description: 'Informativa sulla privacy e protezione dei dati personali di Maskio Barber',
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              Ultimo aggiornamento: {new Date().toLocaleDateString('it-IT')}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Chi siamo</h2>
              <p className="text-gray-700 mb-4">
                <strong>Maskio Barber Concept</strong> (di seguito "noi", "nostro" o "Maskio Barber") 
                gestisce il sito web maskiobarber.it e l'applicazione mobile (di seguito "Servizio").
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-amber-800">
                  <strong>Titolare del trattamento:</strong><br />
                  Maskio Barber Concept<br />
                  Via Sant'Agata, 24<br />
                  71013 San Giovanni Rotondo (FG)<br />
                  Email: fabio.cassano97@icloud.com
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Dati che raccogliamo</h2>
              
              <div className="space-y-6">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Dati di registrazione</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>Nome e cognome</li>
                    <li>Indirizzo email</li>
                    <li>Numero di telefono</li>
                    <li>Password (crittografata)</li>
                  </ul>
                </div>

                <div className="border-l-4 border-green-500 pl-4">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Dati di prenotazione</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>Data e ora degli appuntamenti</li>
                    <li>Servizi richiesti</li>
                    <li>Note specifiche</li>
                    <li>Barbiere scelto</li>
                  </ul>
                </div>

                <div className="border-l-4 border-purple-500 pl-4">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Dati tecnici</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>Indirizzo IP</li>
                    <li>Tipo di browser e dispositivo</li>
                    <li>Pagine visitate</li>
                    <li>Data e ora di accesso</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Come utilizziamo i tuoi dati</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-blue-800 mb-2">Gestione del servizio</h3>
                  <ul className="list-disc list-inside text-blue-700 space-y-1 text-sm">
                    <li>Gestire le prenotazioni</li>
                    <li>Confermare gli appuntamenti</li>
                    <li>Inviare promemoria</li>
                    <li>Gestire il tuo account</li>
                  </ul>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-green-800 mb-2">Comunicazione</h3>
                  <ul className="list-disc list-inside text-green-700 space-y-1 text-sm">
                    <li>Inviare conferme via email</li>
                    <li>Notificare modifiche</li>
                    <li>Fornire assistenza</li>
                    <li>Aggiornamenti importanti</li>
                  </ul>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-purple-800 mb-2">Miglioramento del servizio</h3>
                  <ul className="list-disc list-inside text-purple-700 space-y-1 text-sm">
                    <li>Analizzare l'utilizzo</li>
                    <li>Ottimizzare l'esperienza</li>
                    <li>Sviluppare nuove funzionalità</li>
                    <li>Risolvere problemi tecnici</li>
                  </ul>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-orange-800 mb-2">Obblighi legali</h3>
                  <ul className="list-disc list-inside text-orange-700 space-y-1 text-sm">
                    <li>Rispettare normative</li>
                    <li>Conservare documenti</li>
                    <li>Collaborare con autorità</li>
                    <li>Gestire controversie</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Base giuridica del trattamento</h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center text-white text-sm font-bold mt-1">✓</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Consenso</h3>
                    <p className="text-gray-700">Per l'invio di comunicazioni promozionali</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center text-white text-sm font-bold mt-1">✓</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Esecuzione del contratto</h3>
                    <p className="text-gray-700">Per gestire le prenotazioni e fornire i servizi</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center text-white text-sm font-bold mt-1">✓</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Interesse legittimo</h3>
                    <p className="text-gray-700">Per migliorare i nostri servizi e la sicurezza</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">I tuoi diritti</h2>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <p className="text-gray-700 mb-4">Secondo il GDPR, hai i seguenti diritti:</p>
                <div className="grid md:grid-cols-2 gap-4">
                  <ul className="space-y-2">
                    <li className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                      <span className="text-gray-700">Accesso ai tuoi dati</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                      <span className="text-gray-700">Rettifica dei dati</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                      <span className="text-gray-700">Cancellazione</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                      <span className="text-gray-700">Limitazione del trattamento</span>
                    </li>
                  </ul>
                  <ul className="space-y-2">
                    <li className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                      <span className="text-gray-700">Portabilità dei dati</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                      <span className="text-gray-700">Opposizione</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                      <span className="text-gray-700">Revoca del consenso</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                      <span className="text-gray-700">Reclamo al Garante</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Sicurezza dei dati</h2>
              <p className="text-gray-700 mb-4">
                Implementiamo misure di sicurezza appropriate per proteggere i tuoi dati personali:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Crittografia delle password</li>
                <li>Connessioni HTTPS sicure</li>
                <li>Database protetti</li>
                <li>Accesso limitato ai dati</li>
                <li>Backup regolari</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Conservazione dei dati</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo di dato</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Periodo di conservazione</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 text-sm text-gray-900">Dati di registrazione</td>
                      <td className="px-6 py-4 text-sm text-gray-700">Fino alla cancellazione dell'account</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm text-gray-900">Storico prenotazioni</td>
                      <td className="px-6 py-4 text-sm text-gray-700">5 anni per obblighi fiscali</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm text-gray-900">Log di accesso</td>
                      <td className="px-6 py-4 text-sm text-gray-700">12 mesi</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contatti</h2>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
                <p className="text-amber-800 mb-4">
                  Per esercitare i tuoi diritti o per domande su questa Privacy Policy:
                </p>
                <div className="space-y-2 text-amber-700">
                  <p><strong>Email:</strong> fabio.cassano97@icloud.com</p>
                  <p><strong>Telefono:</strong> +39 331 710 0730</p>
                  <p><strong>Indirizzo:</strong> Via Sant'Agata, 24 - 71013 San Giovanni Rotondo (FG)</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
