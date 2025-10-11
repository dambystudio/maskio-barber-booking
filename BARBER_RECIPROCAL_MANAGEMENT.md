# 🤝 Gestione Reciproca tra Barbieri - Implementazione

## 📋 Obiettivo
Permettere a Michele e Fabio di gestirsi reciprocamente nel pannello barbieri, includendo:
- ✅ Annullare appuntamenti dell'altro barbiere
- ✅ Confermare/modificare status prenotazioni
- ✅ Impostare chiusure per l'altro barbiere
- ✅ Spostare/modificare appuntamenti

## 🔧 Modifiche Implementate

### 1. **API Bookings - PATCH (Aggiornamento Status)**
**File**: `src/app/api/bookings/route.ts` (linee ~475-490)

**PRIMA** - Controllo restrittivo:
```typescript
if (session.user.role === 'barber') {
  const allBarbers = await DatabaseService.getBarbers();
  const currentBarber = allBarbers.find(b => b.email === session.user.email);
  
  if (!currentBarber || booking.barberId !== currentBarber.id) {
    return NextResponse.json(
      { error: 'Non hai i permessi per modificare questa prenotazione' },
      { status: 403 }  // ❌ ERRORE 403!
    );
  }
}
```

**DOPO** - Controllo rimosso:
```typescript
if (session.user.role === 'barber') {
  // Get the booking to check if it belongs to this barber
  const allBookings = await DatabaseService.getAllBookings();
  const booking = allBookings.find(b => b.id === requestData.id);
  
  if (!booking) {
    return NextResponse.json(
      { error: 'Prenotazione non trovata' },
      { status: 404 }
    );
  }

  // ✅ MODIFICA: Michele e Fabio possono gestirsi reciprocamente
  // Controllo autorizzazioni rimosso per permettere gestione reciproca tra barbieri
}
```

---

### 2. **API Bookings - DELETE (Eliminazione Prenotazione)**
**File**: `src/app/api/bookings/route.ts` (linee ~555-575)

**PRIMA** - Controllo restrittivo:
```typescript
if (session.user.role === 'barber') {
  const allBarbers = await DatabaseService.getBarbers();
  const currentBarber = allBarbers.find(b => b.email === session.user.email);
  
  if (!currentBarber || booking.barberId !== currentBarber.id) {
    return NextResponse.json(
      { error: 'Non hai i permessi per eliminare questa prenotazione' },
      { status: 403 }  // ❌ ERRORE 403!
    );
  }
}
```

**DOPO** - Controllo rimosso:
```typescript
if (session.user.role === 'barber') {
  const allBookings = await DatabaseService.getAllBookings();
  const booking = allBookings.find(b => b.id === bookingId);
  
  if (!booking) {
    return NextResponse.json(
      { error: 'Prenotazione non trovata' },
      { status: 404 }
    );
  }

  // ✅ MODIFICA: Michele e Fabio possono gestirsi reciprocamente
  // Controllo autorizzazioni rimosso per permettere gestione reciproca tra barbieri
}
```

---

### 3. **Pannello Prenotazioni - Funzione Swap Modale**
**File**: `src/app/pannello-prenotazioni/page.tsx` (linee ~1085-1105)

**PRIMA** - Controllo email barbiere:
```typescript
if (!isAdmin) {
  const barberEmailMapping: { [key: string]: string } = {
    'Fabio': 'fabio.cassano97@icloud.com',
    'Michele': 'michelebiancofiore0230@gmail.com'
  };
  
  const bookingBarberEmail = barberEmailMapping[booking.barber_name];
  if (bookingBarberEmail !== currentBarber) {
    alert('Puoi modificare solo i tuoi appuntamenti');  // ❌ BLOCCO!
    return;
  }
}
```

**DOPO** - Controllo rimosso:
```typescript
// ✅ MODIFICA: Michele e Fabio possono gestirsi reciprocamente
// Verifica solo che l'utente sia un barbiere autenticato
if (!isAdmin && !currentBarber) {
  alert('Non autorizzato a modificare appuntamenti');
  return;
}

// Controllo rimosso: barbieri possono modificare appuntamenti di altri barbieri
```

---

### 4. **Pannello Prenotazioni - Vista Mobile (Card)**
**File**: `src/app/pannello-prenotazioni/page.tsx` (linee ~1830-1900)

**PRIMA** - Bottoni condizionati a `viewMode === 'own'`:
```tsx
{/* Solo per barbieri autorizzati */}
{(isAdmin || viewMode === 'own') && booking.status !== 'cancelled' && (
  <button onClick={() => openSwapModal(booking)}>
    🔄 Modifica Appuntamento
  </button>
)}

{(isAdmin || viewMode === 'own') && (
  <div className="flex gap-2">
    {booking.status === 'pending' && (
      <>
        <button onClick={() => updateBookingStatus(booking.id, 'confirmed')}>
          ✅ Conferma
        </button>
        <button onClick={() => updateBookingStatus(booking.id, 'cancelled')}>
          ❌ Annulla
        </button>
      </>
    )}
  </div>
)}

{/* Messaggio "Solo visualizzazione" */}
{!isAdmin && viewMode === 'other' && (
  <div>👁️ Solo visualizzazione</div>
)}
```

**DOPO** - Bottoni sempre visibili per barbieri:
```tsx
{/* ✅ Barbieri possono gestirsi reciprocamente */}
{booking.status !== 'cancelled' && (
  <button onClick={() => openSwapModal(booking)}>
    🔄 Modifica Appuntamento
  </button>
)}

<div className="flex gap-2">
  {booking.status === 'pending' && (
    <>
      <button onClick={() => updateBookingStatus(booking.id, 'confirmed')}>
        ✅ Conferma
      </button>
      <button onClick={() => updateBookingStatus(booking.id, 'cancelled')}>
        ❌ Annulla
      </button>
    </>
  )}
</div>

{/* Messaggio "Solo visualizzazione" RIMOSSO */}
```

---

### 5. **Pannello Prenotazioni - Vista Desktop (Tabella)**
**File**: `src/app/pannello-prenotazioni/page.tsx` (linee ~2020-2085)

**PRIMA** - Bottoni condizionati con messaggio alternativo:
```tsx
<td>
  {(isAdmin || viewMode === 'own') ? (
    <div className="flex gap-2">
      {/* Bottoni azioni */}
    </div>
  ) : (
    <div>👁️ Solo visualizzazione</div>  // ❌ BLOCCO VISIVO
  )}
</td>
```

**DOPO** - Bottoni sempre visibili:
```tsx
<td>
  {/* ✅ Barbieri possono gestirsi reciprocamente */}
  <div className="flex gap-2">
    {booking.status !== 'cancelled' && (
      <button onClick={() => openSwapModal(booking)}>
        🔄 Modifica
      </button>
    )}
    {/* Altri bottoni conferma/annulla/elimina */}
  </div>
</td>
```

---

## ✅ Funzionalità Garantite

### Per Fabio:
- ✅ Può annullare appuntamenti di Michele
- ✅ Può confermare prenotazioni pending di Michele
- ✅ Può modificare/spostare appuntamenti di Michele
- ✅ Può impostare chiusure per Michele
- ✅ Vede tutti i bottoni di azione anche nella vista "Appuntamenti Michele"

### Per Michele:
- ✅ Può annullare appuntamenti di Fabio
- ✅ Può confermare prenotazioni pending di Fabio
- ✅ Può modificare/spostare appuntamenti di Fabio
- ✅ Può impostare chiusure per Fabio
- ✅ Vede tutti i bottoni di azione anche nella vista "Appuntamenti Fabio"

---

## 🔒 Sicurezza

### Controlli Mantenuti:
1. ✅ **Autenticazione richiesta**: Solo utenti loggati
2. ✅ **Ruolo barbiere/admin**: Solo barbieri e admin possono modificare
3. ✅ **Sessione valida**: Verifica token NextAuth

### Controlli Rimossi:
1. ❌ Verifica `booking.barberId === currentBarber.id` (API PATCH)
2. ❌ Verifica `booking.barberId === currentBarber.id` (API DELETE)
3. ❌ Verifica `bookingBarberEmail !== currentBarber` (Frontend swap)
4. ❌ Condizione `viewMode === 'own'` per visibilità bottoni (Frontend UI)

---

## 🧪 Test Necessari

### Test 1: Fabio annulla appuntamento Michele
1. Login come Fabio
2. Vai a "Prenotazioni" → seleziona visualizzazione Michele
3. Click su "Annulla" per un appuntamento di Michele
4. ✅ **Aspettato**: Appuntamento cancellato senza errore 403

### Test 2: Michele conferma appuntamento Fabio
1. Login come Michele
2. Vai a "Prenotazioni" → seleziona visualizzazione Fabio
3. Click su "Conferma" per un appuntamento pending di Fabio
4. ✅ **Aspettato**: Appuntamento confermato senza errore 403

### Test 3: Fabio modifica/sposta appuntamento Michele
1. Login come Fabio
2. Vai a "Prenotazioni" → seleziona visualizzazione Michele
3. Click su "🔄 Modifica Appuntamento"
4. ✅ **Aspettato**: Modale apertura senza alert "Puoi modificare solo i tuoi appuntamenti"

### Test 4: Michele imposta chiusura per Fabio
1. Login come Michele
2. Vai a "Chiusure" → aggiungi chiusura per Fabio
3. ✅ **Aspettato**: Chiusura salvata correttamente (già funzionante, nessun controllo restrittivo)

---

## 📅 Data Implementazione
**11 Ottobre 2025**

## 👨‍💻 Sviluppatore
GitHub Copilot

## 📝 Note Aggiuntive
- Le chiusure barbieri (`barber-closures/route.ts`) erano già configurate per gestione reciproca
- Il sistema `booking-swap` per scambio appuntamenti verificava già solo il barbiere proprietario del primo appuntamento
- Ora tutti i controlli sono allineati per gestione reciproca completa

---

## 🔄 Rollback (se necessario)

Per ripristinare i controlli originali:
1. Ripristina controllo `booking.barberId !== currentBarber.id` in API PATCH/DELETE
2. Ripristina controllo `bookingBarberEmail !== currentBarber` in `openSwapModal()`
3. Ripristina condizione `(isAdmin || viewMode === 'own')` per bottoni UI
4. Ripristina messaggi "👁️ Solo visualizzazione"

Git commit di riferimento per rollback: [da inserire dopo commit]
