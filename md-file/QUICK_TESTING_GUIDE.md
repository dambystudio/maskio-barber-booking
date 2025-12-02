# 🧪 Guida Rapida al Testing - Sistema Notifiche Waitlist

## 🎯 Test Scenario 1: Flusso Completo

### Setup Iniziale (1 minuto)
1. Apri il sito su mobile (ngrok URL)
2. Login come utente normale
3. Abilita notifiche push: vai su `/debug-push` → clicca "Abilita Notifiche"
4. Permetti le notifiche quando richiesto

### Fase 1: Iscriviti alla Lista d'Attesa (2 minuti)
1. Vai su "Prenota"
2. Scegli un giorno che ha prenotazioni ma non è completamente pieno
   - Esempio: scegli un giorno con 6-7 prenotazioni su 8 slot
3. Se il giorno è pieno, vedrai il pulsante "📋 Lista d'attesa"
4. Clicca e conferma l'iscrizione
5. **Verifica:** Dovresti vedere "✅ Aggiunto alla lista d'attesa in posizione X"

### Fase 2: Cancella una Prenotazione (1 minuto)
1. Logout e login come barbiere o admin
   - Email barbiere: `fabio.cassano97@icloud.com`
   - Email admin: `davide431@outlook.it`
2. Vai su "Pannello Prenotazioni"
3. Trova una prenotazione per lo stesso giorno della waitlist
4. Clicca sul booking → "Cancella Prenotazione"
5. **Attesa:** Il sistema invia automaticamente la notifica

### Fase 3: Ricevi e Gestisci Notifica (2 minuti)
1. Sul telefono, dovresti ricevere notifica push:
   ```
   🎉 Posto Disponibile!
   Si è liberato un posto per il [giorno] alle [ora].
   Conferma entro 24 ore!
   ```
2. Click sulla notifica → ti porta a `/area-personale/profilo`
3. Scorri in basso, vedi sezione "🎉 Posto Disponibile!"
4. Vedi:
   - Data e ora disponibile
   - Timer countdown (24 ore)
   - Pulsanti "✅ Conferma" e "❌ Rifiuta"

### Fase 4: Conferma Prenotazione (1 minuto)
1. Clicca "✅ Conferma Prenotazione"
2. **Verifica:** Dovresti vedere "✅ Prenotazione confermata per il [data] alle [ora]"
3. La pagina si ricarica
4. L'offerta scompare dalla lista
5. Vai su "Le Mie Prenotazioni" → vedi la nuova prenotazione creata!

---

## 🔄 Test Scenario 2: Rifiuto Offerta

### Segui Fase 1-3 come sopra, poi:

### Fase 4 Alternativa: Rifiuta Offerta
1. Clicca "❌ Rifiuta"
2. **Verifica:** "✅ Offerta rifiutata"
3. Se c'è un altro utente in lista:
   - Sistema invia automaticamente notifica al prossimo
   - Attendi qualche secondo
   - Se hai un secondo account, login e verifica

---

## ⚡ Test Rapido (Solo Notifiche)

### Verifica che le notifiche arrivino:

**Metodo 1: Test Manuale**
```bash
# Nel terminale
node send-test-notification.mjs
```
Dovresti ricevere notifica di test sul telefono.

**Metodo 2: Test da Browser**
1. Vai su `/debug-push`
2. Clicca "Abilita Notifiche" (se non già fatto)
3. Clicca "🧪 Test Notifica Server"
4. Controlla che arrivi la notifica

---

## 🔍 Verifica Database

### Controlla stato sistema:
```bash
node test-waitlist-notification-system.mjs
```

Output dovrebbe mostrare:
- ✅ 4/4 colonne database presenti
- ✅ Numero sottoscrizioni push attive
- ✅ Utenti in lista d'attesa
- ✅ Offerte attive (se presenti)

---

## ✅ Checklist Test Completo

Prima di considerare il test completato, verifica:

- [ ] Notifiche push arrivano anche con app chiusa
- [ ] Click notifica reindirizza a `/area-personale/profilo`
- [ ] Offerta appare correttamente con timer
- [ ] Pulsante "Conferma" crea prenotazione
- [ ] Prenotazione appare in "Le Mie Prenotazioni"
- [ ] Pulsante "Rifiuta" passa al prossimo in lista
- [ ] Timer countdown funziona correttamente
- [ ] Offerta scade dopo 24 ore
- [ ] Riordinamento posizioni funziona
- [ ] Nessun errore in console browser
- [ ] Nessun errore in log server

---

**Durata Test Completo:** ~10 minuti  
**Difficoltà:** ⭐⭐ (Facile-Media)  
**Preparato da:** GitHub Copilot + David  
**Data:** 9 Ottobre 2025
