import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Termini di Servizio | Maskio Barber',
  description: 'Termini e condizioni per l\'utilizzo dei servizi di Maskio Barber',
};

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Termini di Servizio</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              Ultimo aggiornamento: {new Date().toLocaleDateString('it-IT')}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Accettazione dei termini</h2>
              <p className="text-gray-700 mb-4">
                Utilizzando il sito web e i servizi di <strong>Maskio Barber Concept</strong>, 
                accetti di essere vincolato dai seguenti termini e condizioni d'uso.
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-amber-800">
                  <strong>Importante:</strong> Se non accetti questi termini, ti preghiamo di non utilizzare i nostri servizi.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">I nostri servizi</h2>
              <div className="space-y-4">
                <div className="border-l-4 border-amber-500 pl-4">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Servizi di barbiere</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>Taglio capelli e styling</li>
                    <li>Rasatura e cura della barba</li>
                    <li>Trattamenti specifici per capelli e cuoio capelluto</li>
                    <li>Consulenza per lo stile</li>
                  </ul>
                </div>
                
                <div className="border-l-4 border-blue-500 pl-4">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Servizi digitali</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>Sistema di prenotazione online</li>
                    <li>Gestione dell'account cliente</li>
                    <li>Notifiche e promemoria</li>
                    <li>Storico appuntamenti</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Prenotazioni e cancellazioni</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-green-800 mb-2">Prenotazioni</h3>
                  <ul className="list-disc list-inside text-green-700 space-y-1 text-sm">
                    <li>Prenotazione online 24/7</li>
                    <li>Conferma automatica via email</li>
                    <li>Possibilità di modificare fino a 48h prima</li>
                    <li>Selezione del barbiere preferito</li>
                  </ul>
                </div>
                
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-red-800 mb-2">Cancellazioni</h3>
                  <ul className="list-disc list-inside text-red-700 space-y-1 text-sm">
                    <li><strong>Gratuita:</strong> Fino a 48 ore prima</li>
                    <li><strong>Penale:</strong> Cancellazioni tardive</li>
                    <li><strong>No-show:</strong> Addebito del 50% del servizio</li>
                    <li><strong>Emergenze:</strong> Valutate caso per caso</li>
                  </ul>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">⚠️ Politica di cancellazione</h3>
                <p className="text-yellow-700 text-sm">
                  Le cancellazioni devono essere effettuate almeno <strong>48 ore prima</strong> dell'appuntamento 
                  tramite il sito web o contattando direttamente il salone. Cancellazioni tardive o mancate 
                  presentazioni potrebbero comportare l'addebito di una penale.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Account utente</h2>
              
              <div className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Responsabilità dell'utente</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>Fornire informazioni accurate e aggiornate</li>
                    <li>Mantenere riservate le credenziali di accesso</li>
                    <li>Notificare immediatamente accessi non autorizzati</li>
                    <li>Utilizzare il servizio in modo appropriato</li>
                  </ul>
                </div>

                <div className="border-l-4 border-purple-500 pl-4">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Nostre responsabilità</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>Proteggere i tuoi dati personali</li>
                    <li>Mantenere la sicurezza del sistema</li>
                    <li>Fornire assistenza tecnica</li>
                    <li>Rispettare la privacy policy</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Pagamenti e prezzi</h2>
              
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Modalità di pagamento</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quando</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Note</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 text-sm text-gray-900">Contanti</td>
                      <td className="px-6 py-4 text-sm text-gray-700">Al momento del servizio</td>
                      <td className="px-6 py-4 text-sm text-gray-700">Sempre accettati</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm text-gray-900">Carta di credito/debito</td>
                      <td className="px-6 py-4 text-sm text-gray-700">Al momento del servizio</td>
                      <td className="px-6 py-4 text-sm text-gray-700">Visa, Mastercard, Bancomat</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm text-gray-900">Pagamenti digitali</td>
                      <td className="px-6 py-4 text-sm text-gray-700">Al momento del servizio</td>
                      <td className="px-6 py-4 text-sm text-gray-700">PayPal, Apple Pay, Google Pay</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <p className="text-blue-800 text-sm">
                  <strong>Prezzi:</strong> I prezzi dei servizi sono disponibili sul sito web e possono variare 
                  senza preavviso. Il prezzo finale sarà quello vigente al momento dell'erogazione del servizio.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Limitazioni e esclusioni</h2>
              
              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-red-800 mb-2">Esclusioni di responsabilità</h3>
                  <ul className="list-disc list-inside text-red-700 space-y-1 text-sm">
                    <li>Problemi tecnici del sito web o dell'app</li>
                    <li>Interruzioni del servizio per manutenzione</li>
                    <li>Reazioni allergiche a prodotti (previa informazione)</li>
                    <li>Risultati non conformi alle aspettative non specificate</li>
                  </ul>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-orange-800 mb-2">Limitazioni del servizio</h3>
                  <ul className="list-disc list-inside text-orange-700 space-y-1 text-sm">
                    <li>Servizi disponibili solo durante gli orari di apertura</li>
                    <li>Prenotazioni soggette a disponibilità</li>
                    <li>Alcuni servizi richiedono consulenza preliminare</li>
                    <li>Ci riserviamo il diritto di rifiutare il servizio</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Proprietà intellettuale</h2>
              <p className="text-gray-700 mb-4">
                Tutti i contenuti del sito web (testi, immagini, loghi, design) sono protetti da copyright 
                e appartengono a Maskio Barber Concept o ai rispettivi proprietari.
              </p>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-gray-700 text-sm">
                  È vietata la riproduzione, distribuzione o utilizzo commerciale dei contenuti 
                  senza autorizzazione scritta.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Modifiche ai termini</h2>
              <p className="text-gray-700 mb-4">
                Ci riserviamo il diritto di modificare questi termini in qualsiasi momento. 
                Le modifiche saranno pubblicate su questa pagina con la data di aggiornamento.
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-amber-800 text-sm">
                  <strong>Consiglio:</strong> Controlla periodicamente questa pagina per rimanere 
                  aggiornato sui termini di servizio.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Legge applicabile</h2>
              <p className="text-gray-700 mb-4">
                Questi termini sono regolati dalla legge italiana. Per qualsiasi controversia, 
                sarà competente il Foro di Foggia.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contatti</h2>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
                <p className="text-amber-800 mb-4">
                  Per domande sui termini di servizio o per assistenza:
                </p>
                <div className="space-y-2 text-amber-700">
                  <p><strong>Email:</strong> fabio.cassano97@icloud.com</p>
                  <p><strong>Telefono:</strong> +39 XXX XXX XXXX</p>
                  <p><strong>Indirizzo:</strong> Via Sant'Agata, 24 - 71013 San Giovanni Rotondo (FG)</p>
                  <p><strong>Orari:</strong> Lun-Sab 9:00-19:00</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
