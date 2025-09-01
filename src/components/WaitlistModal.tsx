'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { useSession } from 'next-auth/react';

interface WaitlistEntry {
  id: string;
  user_id: string;
  barber_id: string;
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
  user_name?: string;
  user_email?: string;
}

interface WaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: string;
  barberId?: string;
  barberName?: string;
  isBarber?: boolean;
}

export default function WaitlistModal({ 
  isOpen, 
  onClose, 
  date, 
  barberId, 
  barberName,
  isBarber = false 
}: WaitlistModalProps) {
  const { data: session } = useSession();
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchWaitlist();
    }
  }, [isOpen, date, barberId]);

  const fetchWaitlist = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('date', date);
      if (barberId) params.append('barberId', barberId);

      const response = await fetch(`/api/waitlist?${params}`);
      const data = await response.json();
      
      if (data.waitlist) {
        setWaitlist(data.waitlist);
      }
    } catch (error) {
      console.error('Errore nel caricamento lista d\'attesa:', error);
    } finally {
      setLoading(false);
    }
  };

  const joinWaitlist = async () => {
    setJoining(true);
    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          barberId,
          barberName,
          date,
          service: 'Taglio Uomo',
          price: 25
        })
      });

      const data = await response.json();
      
      if (data.success) {
        alert(`✅ ${data.message}`);
        fetchWaitlist(); // Ricarica la lista
      } else {
        alert(`❌ ${data.error}`);
      }
    } catch (error) {
      console.error('Errore nell\'iscrizione alla lista d\'attesa:', error);
      alert('❌ Errore nell\'iscrizione alla lista d\'attesa');
    } finally {
      setJoining(false);
    }
  };

  const leaveWaitlist = async (waitlistId: string) => {
    try {
      const response = await fetch(`/api/waitlist?id=${waitlistId}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      
      if (data.success) {
        alert(`✅ ${data.message}`);
        fetchWaitlist(); // Ricarica la lista
      } else {
        alert(`❌ ${data.error}`);
      }
    } catch (error) {
      console.error('Errore nella rimozione dalla lista d\'attesa:', error);
      alert('❌ Errore nella rimozione dalla lista d\'attesa');
    }
  };

  const approveFromWaitlist = async (waitlistId: string) => {
    try {
      const response = await fetch('/api/waitlist/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ waitlistId })
      });

      const data = await response.json();
      
      if (data.success) {
        alert(`✅ ${data.message}`);
        fetchWaitlist(); // Ricarica la lista
      } else {
        alert(`❌ ${data.error}`);
      }
    } catch (error) {
      console.error('Errore nell\'approvazione:', error);
      alert('❌ Errore nell\'approvazione');
    }
  };

  const openWhatsApp = (phone: string, name: string) => {
    if (!phone) {
      alert('Numero di telefono non disponibile');
      return;
    }
    
    const cleanPhone = phone.replace(/\s+/g, '').replace(/^\+/, '');
    const message = encodeURIComponent(
      `Ciao ${name}! 👋\n\nHo un posto disponibile per ${format(new Date(date), 'EEEE d MMMM', { locale: it })}.\n\nSei ancora interessato? Fammi sapere! 😊\n\n- Maskio Barber`
    );
    
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg shadow-lg w-full max-w-2xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="bg-amber-600 text-white p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">
            📋 Lista d'Attesa - {format(new Date(date), 'dd MMMM yyyy', { locale: it })}
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="text-center text-gray-400">Caricamento...</div>
          ) : (
            <>
              {/* Join/Leave Waitlist for Customers */}
              {!isBarber && barberId && (
                <div className="mb-6">
                  {/* Check if user is already in waitlist */}
                  {waitlist.some(entry => entry.customer_email === session?.user?.email) ? (
                    <div className="space-y-4">
                      <div className="bg-green-900/30 border border-green-400 rounded-lg p-4 text-center">
                        <div className="text-green-400 text-lg mb-2">✅ Sei in lista d'attesa!</div>
                        <p className="text-gray-300 text-sm">
                          Ti contatteremo se si libera un posto per {format(new Date(date), 'EEEE d MMMM', { locale: it })}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          const userEntry = waitlist.find(entry => entry.customer_email === session?.user?.email);
                          if (userEntry) leaveWaitlist(userEntry.id);
                        }}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg"
                      >
                        🗑️ Rimuovi dalla Lista d'Attesa
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <button
                        onClick={joinWaitlist}
                        disabled={joining}
                        className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium py-3 px-4 rounded-lg disabled:opacity-50"
                      >
                        {joining ? 'Iscrizione...' : '🔔 Mettiti in Lista d\'Attesa'}
                      </button>
                      <p className="text-gray-400 text-sm text-center">
                        Ti contatteremo se si libera un posto!
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Waitlist for Barbers Only */}
              {isBarber && (
                <>
                  {waitlist.length === 0 ? (
                    <div className="text-center text-gray-400 py-8">
                      <div className="text-4xl mb-4">🎯</div>
                      <p>Nessuno in lista d'attesa per questo giorno</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <h3 className="text-white font-semibold mb-4">
                        👥 {waitlist.length} persona/e in attesa
                      </h3>
                      
                      {waitlist.map((entry, index) => (
                        <div
                          key={entry.id}
                          className="bg-gray-800 rounded-lg p-4 border border-gray-700"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="bg-amber-600 text-white text-sm px-2 py-1 rounded-full">
                                  #{entry.position}
                                </span>
                                <h4 className="text-white font-medium">
                                  {entry.customer_name}
                                </h4>
                              </div>
                              
                              <div className="text-gray-400 text-sm space-y-1">
                                {entry.customer_email && (
                                  <div>📧 {entry.customer_email}</div>
                                )}
                                {entry.customer_phone && (
                                  <div>📱 {entry.customer_phone}</div>
                                )}
                                {entry.service && (
                                  <div>✂️ {entry.service}</div>
                                )}
                                {entry.notes && (
                                  <div>📝 {entry.notes}</div>
                                )}
                                <div>🕐 {format(new Date(entry.created_at), 'HH:mm dd/MM')}</div>
                              </div>
                            </div>

                            {/* Actions for Barbers */}
                            <div className="flex gap-2 ml-4">
                              {entry.customer_phone && (
                                <button
                                  onClick={() => openWhatsApp(entry.customer_phone!, entry.customer_name)}
                                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm font-medium"
                                  title="Contatta su WhatsApp"
                                >
                                  💬 WhatsApp
                                </button>
                              )}
                              <button
                                onClick={() => approveFromWaitlist(entry.id)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm font-medium"
                                title="Approva prenotazione"
                              >
                                ✅ Approva
                              </button>
                              <button
                                onClick={() => leaveWaitlist(entry.id)}
                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm font-medium"
                                title="Rimuovi dalla lista"
                              >
                                ❌ Rimuovi
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* Info message for customers */}
              {!isBarber && (
                <div className="text-center text-gray-400 py-4">
                  <div className="text-2xl mb-2">⏰</div>
                  <p className="text-sm">
                    Giorno completamente prenotato.<br/>
                    Mettiti in lista d'attesa per essere contattato se si libera un posto!
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-800 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
}
