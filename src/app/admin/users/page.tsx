'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'customer' | 'barber' | 'admin';
  createdAt: string;
  lastLogin?: string;
}

export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [permissionsChecked, setPermissionsChecked] = useState(false);
  // Verifica permessi tramite API invece che da sessione
  const checkAdminPermissions = async () => {
    try {
      if (!session?.user?.email) return;
      
      const response = await fetch('/api/debug/check-permissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: session.user.email })
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Admin page permissions check:', data);
        setIsAdmin(data.success && data.permissions.isAdmin || false);
      } else {
        console.error('Failed to check permissions:', response.status);
        setIsAdmin(false);
      }
    } catch (error) {
      console.error('Error checking permissions:', error);
      setIsAdmin(false);
    } finally {
      setPermissionsChecked(true);
    }
  };

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    checkAdminPermissions();
  }, [session, status, router]);

  useEffect(() => {
    if (!permissionsChecked) return;
    
    if (!isAdmin) {
      router.push('/');
      return;
    }
    
    fetchUsers();
  }, [permissionsChecked, isAdmin, router]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      } else {
        console.error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: 'customer' | 'barber' | 'admin') => {
    setUpdateLoading(userId);
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, role: newRole }),
      });

      if (response.ok) {
        await fetchUsers(); // Ricarica la lista
      } else {
        console.error('Failed to update user role');
      }
    } catch (error) {
      console.error('Error updating user role:', error);
    } finally {
      setUpdateLoading(null);
    }
  };

  const deleteUser = async (userId: string, userName: string, userEmail: string) => {
    // Conferma con l'admin prima di eliminare
    const confirmMessage = `⚠️ ATTENZIONE: Stai per eliminare definitivamente l'account di ${userName} (${userEmail}).\n\n` +
                          `Questa azione eliminerà:\n` +
                          `- L'account utente\n` +
                          `- Tutte le prenotazioni associate\n` +
                          `- Tutte le sessioni e i dati di login\n\n` +
                          `Questa operazione NON PUÒ essere annullata.\n\n` +
                          `Sei sicuro di voler procedere?`;
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    setDeleteLoading(userId);
    try {
      const response = await fetch(`/api/admin/users?userId=${encodeURIComponent(userId)}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const result = await response.json();
        console.log('User deleted successfully:', result);
        
        // Mostra messaggio di successo
        alert(`✅ Account eliminato con successo: ${userName} (${userEmail})`);
        
        // Ricarica la lista utenti
        await fetchUsers();
      } else {
        const errorData = await response.json();
        console.error('Failed to delete user:', errorData);
        
        if (response.status === 400 && errorData.error.includes('Non puoi eliminare')) {
          alert('❌ Non puoi eliminare il tuo stesso account.');
        } else {
          alert(`❌ Errore nell'eliminazione: ${errorData.error || 'Errore sconosciuto'}`);
        }
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('❌ Errore di rete durante l\'eliminazione dell\'account.');
    } finally {
      setDeleteLoading(null);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-500"></div>
      </div>
    );
  }
  if (!session || !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Accesso Negato</h1>
          <p className="text-gray-600">Solo gli amministratori possono accedere a questa pagina.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Gestione Utenti (Admin)
          </h1>
          <p className="text-gray-600 mt-2">
            Gestisci i ruoli degli utenti del sistema ed elimina account se necessario
          </p>
          
          {/* Avviso di sicurezza */}
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  ⚠️ Attenzione - Poteri di Amministratore
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>Come admin hai il potere di:</p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li><strong>Cambiare ruoli</strong> (Cliente → Barbiere → Admin)</li>
                    <li><strong>Eliminare account</strong> in modo permanente (include prenotazioni e dati)</li>
                  </ul>
                  <p className="mt-2 font-semibold">🚨 L'eliminazione degli account è irreversibile!</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Utente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ruolo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Registrato
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">                    Ultimo Login
                  </th>                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gestione Account
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.role === 'admin' 
                          ? 'bg-red-100 text-red-800'
                          : user.role === 'barber'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {user.role === 'admin' ? 'Admin' : user.role === 'barber' ? 'Barbiere' : 'Cliente'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString('it-IT')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('it-IT') : 'Mai'}                    </td>                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex flex-col space-y-2">
                        {/* Pulsanti cambio ruolo */}
                        <div className="flex space-x-2">
                          {user.role !== 'customer' && (
                            <button
                              onClick={() => updateUserRole(user.id, 'customer')}
                              disabled={updateLoading === user.id || deleteLoading === user.id}
                              className="text-green-600 hover:text-green-900 disabled:opacity-50 text-xs px-2 py-1 border border-green-300 rounded"
                            >
                              Cliente
                            </button>
                          )}
                          {user.role !== 'barber' && (
                            <button
                              onClick={() => updateUserRole(user.id, 'barber')}
                              disabled={updateLoading === user.id || deleteLoading === user.id}
                              className="text-amber-600 hover:text-amber-900 disabled:opacity-50 text-xs px-2 py-1 border border-amber-300 rounded"
                            >
                              Barbiere
                            </button>
                          )}
                          {user.role !== 'admin' && (
                            <button
                              onClick={() => updateUserRole(user.id, 'admin')}
                              disabled={updateLoading === user.id || deleteLoading === user.id}
                              className="text-red-600 hover:text-red-900 disabled:opacity-50 text-xs px-2 py-1 border border-red-300 rounded"
                            >
                              Admin
                            </button>
                          )}
                          {updateLoading === user.id && (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-500"></div>
                          )}
                        </div>
                        
                        {/* Pulsante eliminazione separato e ben visibile */}
                        <div className="flex space-x-2 pt-1 border-t border-gray-200">
                          <button
                            onClick={() => deleteUser(user.id, user.name, user.email)}
                            disabled={updateLoading === user.id || deleteLoading === user.id}
                            className="text-red-600 hover:text-red-800 hover:bg-red-50 disabled:opacity-50 text-xs px-3 py-1 border-2 border-red-500 rounded font-medium transition-colors"
                            title="Elimina account definitivamente"
                          >
                            🗑️ Elimina Account
                          </button>
                          {deleteLoading === user.id && (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {users.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">Nessun utente trovato.</p>
          </div>
        )}
      </div>
    </div>
  );
}
