---
title: Ultimo appuntamento del lunedì alle 17:00
type: bugfix
created: 2026-07-17
status: done
baseline_commit: d450041eef635d2b94c6e65a4b3d7a48258b4ded
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Il sito mostra gli appuntamenti delle 17:30 e 18:00 del lunedì per Michele e Nicolò. La generazione standard termina già alle 17:00, ma gli schedule memorizzati possono contenere slot successivi e vengono usati senza il limite settimanale.

**Approach:** Leggere l'ultimo slot dalla definizione settimanale già esistente in `getUniversalSlots`, senza duplicare l'orario nelle validazioni. Applicare il controllo condiviso a disponibilità, creazione, spostamenti/scambi e accettazione della lista d'attesa. Gli altri giorni restano invariati.

## Boundaries & Constraints

**Always:** Le 17:00 rimangono prenotabili se libere. Il limite vale per tutti i barbieri e tutti i lunedì. Mantenere la chiusura ricorrente di Fabio e tutte le altre chiusure. Lasciare intatte le modifiche locali preesistenti.

**Ask First:** Modificare prenotazioni esistenti o dati in produzione; deployment.

**Never:** Cancellare prenotazioni, cambiare gli altri giorni, dipendenze, auth, UI o configurazione deploy.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Lunedì con schedule obsoleto | 16:30, 17:00, 17:30, 18:00 | Solo 16:30 e 17:00 | Nessuna mutazione DB |
| POST oltre limite | Lunedì 17:30 o 18:00 | Prenotazione rifiutata | HTTP 400 con messaggio chiaro |
| Altro giorno | Martedì 17:30 | Invariato | Regole esistenti |
| Fabio chiuso | Lunedì senza apertura eccezionale | Nessuna disponibilità | Chiusura esistente |
| Apertura manuale lunedì | Schedule con slot oltre 17:00 | Stesso limite alle 17:00 | Chiusure specifiche invariate |

</frozen-after-approval>

## Code Map

- `src/lib/universal-slots.ts` — regole condivise degli slot settimanali.
- `src/lib/database-postgres.ts` — disponibilità da schedule salvati, usata anche dai controlli degli slot.
- `src/app/api/bookings/slots/route.ts` — elenco di tutti gli slot mostrati, inclusi non disponibili.
- `src/app/api/bookings/batch-availability/route.ts` — conteggi di disponibilità calendario.
- `src/app/api/bookings/route.ts` — validazione della creazione prenotazioni.
- `test/monday-booking-cutoff.test.ts` — regressione del limite.
- `src/app/api/booking-swap/route.ts` — spostamenti/scambi e controllo slot libero.
- `src/app/api/waitlist/respond/route.ts` — accettazione offerta lista d'attesa.
- `test/monday-booking-mutations.test.ts` — esecuzione handler con dipendenze in memoria.

## Tasks & Acceptance

**Execution:**
- [x] `src/lib/universal-slots.ts` — aggiungere controllo puro data/orario e filtro condiviso del limite lunedì.
- [x] `src/lib/database-postgres.ts` — filtrare gli slot disponibili prima di escludere le prenotazioni esistenti.
- [x] `src/app/api/bookings/slots/route.ts` — filtrare anche gli slot possibili ottenuti dallo schedule.
- [x] `src/app/api/bookings/batch-availability/route.ts` — filtrare gli slot possibili per conteggi coerenti.
- [x] `src/app/api/bookings/route.ts` — rifiutare POST lunedì dopo le 17:00 prima della creazione.
- [x] `test/monday-booking-cutoff.test.ts` — testare più lunedì, limite incluso, schedule obsoleti, altri giorni e indipendenza dal fuso orario.
- [x] `src/lib/universal-slots.ts` — derivare l'orario finale da getUniversalSlots, senza duplicarlo.
- [x] `src/app/api/bookings/route.ts` — validare anche destinazioni PUT, mantenendo aggiornamenti metadata/cancellazioni delle prenotazioni legacy.
- [x] `src/app/api/booking-swap/route.ts` — validare move, entrambe le destinazioni swap e risposta disponibilità GET.
- [x] `src/app/api/waitlist/respond/route.ts` — validare l'offerta prima di inserire la prenotazione accettata.
- [x] `test/monday-booking-mutations.test.ts` — verificare rifiuti prima delle scritture DB e inclusione delle 17:00 eseguendo gli handler con mock.

**Acceptance Criteria:**
- Given uno schedule lunedì con 17:30 e 18:00, when il cliente richiede gli slot, then nessuno slot oltre le 17:00 compare.
- Given un lunedì futuro, when viene inviata una prenotazione oltre le 17:00, then il server risponde 400 senza creare record.
- Given le chiusure esistenti, when viene calcolata la disponibilità, then Fabio resta chiuso secondo le regole correnti.

## Spec Change Log

- Review indipendente 4d85eb47: rilevati bypass in PUT, move/swap e accettazione waitlist. Utente ha approvato l'estensione, chiedendo regole non hard coded; ha confermato l'uso degli orari standard già esistenti senza nuova UI/configurazione. KEEP: filtri condivisi, altri giorni invariati, legacy booking modificabili solo nei metadati senza ricollocarli fuori orario. Rimossa la duplicazione del valore di chiusura dal controllo.

## Review Status

Prima revisione completata con tre reviewer; bypass corretti con estensione autorizzata. Revisione finale b5e33a8f completata: entrambi i reviewer non segnalano problemi residui. `npm test`: 21/21 superati; `npm run typecheck` e `git diff --check`: superati. LSP non segnala errori ma non conferma esplicitamente i file clean. Configurazione `.pi/settings.json` riparata con autorizzazione separata, rimuovendo solo i campi obsoleti `fallbackModels` senza alterare modelli/thinking; esclusa dal commit per preservare modifiche locali preesistenti. Nessun push o deployment eseguito.

## Verification

**Commands:**
- `npm test` — test nuovi ed esistenti superati.
- `npm run typecheck` — nessun nuovo errore TypeScript.
- Diagnostica LSP sui file modificati e controllo diff — nessuna modifica fuori scope.

## Suggested Review Order

**Fonte degli orari**

- Il controllo legge l'ultimo slot standard esistente, senza duplicare l'orario finale.
  [`universal-slots.ts:7`](../../src/lib/universal-slots.ts#L7)

**Disponibilità**

- Filtra gli schedule salvati prima di escludere gli appuntamenti occupati.
  [`database-postgres.ts:305`](../../src/lib/database-postgres.ts#L305)
- Nasconde gli slot oltre orario anche nell'elenco degli slot non disponibili.
  [`slots/route.ts:69`](../../src/app/api/bookings/slots/route.ts#L69)
- Mantiene coerenti i conteggi del calendario.
  [`batch-availability/route.ts:122`](../../src/app/api/bookings/batch-availability/route.ts#L122)

**Mutazioni**

- Blocca la creazione prima delle scritture.
  [`bookings/route.ts:306`](../../src/app/api/bookings/route.ts#L306)
- Calcola la destinazione effettiva per aggiornamenti parziali; preserva le modifiche ai metadati.
  [`bookings/route.ts:455`](../../src/app/api/bookings/route.ts#L455)
- Controlla entrambe le destinazioni prima di iniziare lo scambio.
  [`booking-swap/route.ts:168`](../../src/app/api/booking-swap/route.ts#L168)
- Verifica l'offerta della lista d'attesa prima di creare una prenotazione.
  [`respond/route.ts:63`](../../src/app/api/waitlist/respond/route.ts#L63)

**Test**

- Esegue gli handler reali con database e autenticazione simulati, senza accessi esterni.
  [`monday-booking-mutations.test.ts:8`](../../test/monday-booking-mutations.test.ts#L8)
- Copre più lunedì, inclusione dell'ultimo slot e indipendenza dal fuso orario.
  [`monday-booking-cutoff.test.ts:13`](../../test/monday-booking-cutoff.test.ts#L13)
