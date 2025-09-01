'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

interface WaitlistEntry {
  id: string;
  user_id: string;
                  {entries.map((entry, index) => (
                    <div
                      key={entry.id}
                      className="bg-gray-800 rounded-lg p-4 border border-gray-700"
                    >
                      {console.log('🔍 WaitlistPanel: Rendering entry:', {
                        id: entry.id,
                        name: entry.customer_name,
                        phone: entry.customer_phone,
                        email: entry.customer_email,
                        hasPhone: !!entry.customer_phone
                      })}
                      
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="bg-amber-600 text-white text-sm px-2 py-1 rounded-full font-medium">
                              #{entry.position}
                            </span>
                            <h5 className="text-white font-medium">
                              {entry.customer_name}
                            </h5>
                          </div>ring;
  barber_name: string;
  date: string;
  service?: string;
  price?: number;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  notes?: string;
  status: string;
  position: number;
  created_at: string;
}

interface WaitlistPanelProps {
  selectedDate: string;
  onRefresh?: () => void;
}

export default function WaitlistPanel({ selectedDate, onRefresh }: WaitlistPanelProps) {
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchWaitlist = async () => {
    if (!selectedDate) return;
    
    try {
      setLoading(true);
      console.log('🔍 WaitlistPanel: Fetching waitlist for date:', selectedDate);
      
      const url = `/api/waitlist?date=${selectedDate}`;
      console.log('🔍 WaitlistPanel: Request URL:', url);
      
      const response = await fetch(url);
      console.log('🔍 WaitlistPanel: Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('🔍 WaitlistPanel: Response data:', data);
      console.log('🔍 WaitlistPanel: Response data details:', JSON.stringify(data, null, 2));
      
      // L'API restituisce direttamente l'array, non wrapped in un oggetto
      const waitlistArray = Array.isArray(data) ? data : [];
      console.log('🔍 WaitlistPanel: Processed waitlist:', waitlistArray);
      console.log('🔍 WaitlistPanel: Waitlist length:', waitlistArray.length);
      
      setWaitlist(waitlistArray);
    } catch (error) {
      console.error('❌ WaitlistPanel: Errore nel caricamento lista d\'attesa:', error);
      setWaitlist([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWaitlist();
  }, [selectedDate]); // Ora selectedDate è l'unica dipendenza e fetchWaitlist è definita prima

  const openWhatsApp = (phone: string, name: string) => {
    console.log('🔍 WaitlistPanel: openWhatsApp called with:', { phone, name });
    
    if (!phone) {
      alert('Numero di telefono non disponibile');
      return;
    }
    
    const cleanPhone = phone.replace(/\s+/g, '').replace(/^\+/, '');
    const message = encodeURIComponent(
      `Ciao ${name}! 👋\n\nHo un posto disponibile per ${format(new Date(selectedDate), 'EEEE d MMMM', { locale: it })}.\n\nSei ancora interessato? Fammi sapere! 😊\n\n- Maskio Barber Concept`
    );
    
    console.log('🔍 WaitlistPanel: Opening WhatsApp with phone:', cleanPhone);
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  const approveFromWaitlist = async (waitlistId: string) => {
    console.log('🔍 WaitlistPanel: approveFromWaitlist called with ID:', waitlistId);
    
    if (!confirm('Sei sicuro di voler approvare questa richiesta? Verrà creata una prenotazione automaticamente.')) {
      return;
    }
    
    try {
      console.log('🔍 WaitlistPanel: Sending approve request...');
      const response = await fetch('/api/waitlist/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ waitlistId })
      });

      console.log('🔍 WaitlistPanel: Approve response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Errore nell\'approvazione');
      }

      const result = await response.json();
      console.log('🔍 WaitlistPanel: Approve success:', result);
      alert(`✅ ${result.message}`);
      
      fetchWaitlist(); // Ricarica la lista
      onRefresh?.(); // Ricarica le prenotazioni nel pannello principale
    } catch (error: any) {
      console.error('❌ WaitlistPanel: Errore nell\'approvazione:', error);
      alert(`❌ Errore: ${error.message}`);
    }
  };

  const removeFromWaitlist = async (waitlistId: string) => {
    console.log('🔍 WaitlistPanel: removeFromWaitlist called with ID:', waitlistId);
    
    if (!confirm('Sei sicuro di voler rimuovere questa persona dalla lista d\'attesa?')) {
      return;
    }

    try {
      console.log('🔍 WaitlistPanel: Sending remove request...');
      const response = await fetch('/api/waitlist', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ waitlistId })
      });

      console.log('🔍 WaitlistPanel: Remove response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Errore nella rimozione: ${response.status} ${errorText}`);
      }

      console.log('🔍 WaitlistPanel: Remove success');
      alert('✅ Rimosso dalla lista d\'attesa');
      
      fetchWaitlist(); // Ricarica la lista
    } catch (error: any) {
      console.error('❌ WaitlistPanel: Errore nella rimozione:', error);
      alert(`❌ Errore: ${error.message}`);
    }
  };

  // Raggruppa per barbiere
  const waitlistByBarber = waitlist.reduce((acc, entry) => {
    if (!acc[entry.barber_name]) {
      acc[entry.barber_name] = [];
    }
    acc[entry.barber_name].push(entry);
    return acc;
  }, {} as Record<string, WaitlistEntry[]>);

  // Debug logging
  console.log('🔍 WaitlistPanel: Rendering with:', {
    selectedDate,
    waitlistLength: waitlist.length,
    waitlistEntries: waitlist,
    waitlistByBarber,
    loading
  });

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg shadow overflow-hidden">
      <div className="bg-amber-600 text-white p-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          📋 Lista d'Attesa - {format(new Date(selectedDate), 'EEEE d MMMM yyyy', { locale: it })}
        </h3>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="text-center text-gray-400 py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto mb-4"></div>
            Caricamento lista d'attesa...
          </div>
        ) : waitlist.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <div className="text-4xl mb-4">🎯</div>
            <p>Nessuno in lista d'attesa per questo giorno</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(waitlistByBarber).map(([barberName, entries]) => (
              <div key={barberName} className="space-y-3">
                <h4 className="text-white font-medium text-lg border-b border-gray-700 pb-2">
                  👨‍💼 {barberName} ({entries.length} in attesa)
                </h4>
                
                <div className="space-y-3">
                  {entries
                    .sort((a, b) => a.position - b.position)
                    .map((entry) => (
                    <div
                      key={entry.id}
                      className="bg-gray-800 rounded-lg p-4 border border-gray-700"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="bg-amber-600 text-white text-sm px-2 py-1 rounded-full font-medium">
                              #{entry.position}
                            </span>
                            <h5 className="text-white font-medium">
                              {entry.customer_name}
                            </h5>
                          </div>
                          
                          <div className="text-gray-400 text-sm space-y-1">
                            {entry.customer_email && (
                              <div className="flex items-center gap-1">
                                <span>📧</span>
                                <span>{entry.customer_email}</span>
                              </div>
                            )}
                            {entry.customer_phone && (
                              <div className="flex items-center gap-1">
                                <span>📱</span>
                                <span>{entry.customer_phone}</span>
                              </div>
                            )}
                            {entry.service && (
                              <div className="flex items-center gap-1">
                                <span>✂️</span>
                                <span>{entry.service}</span>
                              </div>
                            )}
                            {entry.notes && (
                              <div className="flex items-center gap-1">
                                <span>📝</span>
                                <span>{entry.notes}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <span>🕐</span>
                              <span>Richiesta il {format(new Date(entry.created_at), 'HH:mm dd/MM')}</span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-2 ml-4">
                          {entry.customer_phone && (
                            <button
                              onClick={() => openWhatsApp(entry.customer_phone!, entry.customer_name)}
                              className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm font-medium transition-colors"
                              title="Contatta su WhatsApp"
                            >
                              💬 WhatsApp
                            </button>
                          )}
                          <button
                            onClick={() => approveFromWaitlist(entry.id)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm font-medium transition-colors"
                            title="Approva e crea prenotazione"
                          >
                            ✅ Approva
                          </button>
                          <button
                            onClick={() => removeFromWaitlist(entry.id)}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm font-medium transition-colors"
                            title="Rimuovi dalla lista"
                          >
                            ❌ Rimuovi
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
