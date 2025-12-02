# File da MANTENERE per produzione

## Script Utili per Admin
- `init-admin.mjs` - Creazione admin iniziale
- `generate-password-hash.mjs` - Generazione password hash
- `set-barber-role.mjs` - Assegnazione ruolo barbiere
- `promote-user-role.mjs` - Promozione utenti
- `reset-user-password.mjs` - Reset password utenti

## Configurazione
- `postcss.config.mjs` - Configurazione PostCSS (NECESSARIO)
- `migrate-to-postgres.mjs` - Migrazione database (se serve)

## Database Management
- `database-script-template.mjs` - Template per script DB

---

# File da ELIMINARE (solo test/debug)

## Test Waitlist
- `test-waitlist-broadcast.mjs`
- `test-manual-waitlist.mjs`
- `test-e2e-waitlist.mjs`
- `simulate-real-waitlist.mjs`
- `send-notification-api.mjs`
- `send-direct-notification.mjs`
- `send-test-notification.mjs`
- `reset-waitlist.mjs`
- `check-waitlist-structure.mjs`
- `check-and-notify.mjs`
- `check-push-sub.mjs`
- `add-to-waitlist-and-notify.mjs`
- `create-waitlist.mjs`
- `prepara-test-waitlist-5dic.mjs`
- `riempi-5-dicembre.mjs`

## Test Booking
- `test-booking-*.mjs` (tutti)
- `test-barber-*.mjs` (tutti)
- `book-all-slots-*.mjs`
- `create-booking-*.mjs`
- `create-test-bookings.mjs`
- `create-today-bookings.mjs`
- `create-fresh-booking.mjs`
- `insert-bookings-june-18.mjs`

## Check/Debug
- `check-*.mjs` (tutti tranne admin)
- `debug-*.mjs` (tutti)
- `diagnose-*.mjs`
- `show-database-status.mjs`
- `search-*.mjs`
- `find-*.mjs`
- `investigate-*.mjs`

## Test API
- `test-api-*.mjs`
- `test-auth-status.mjs`
- `test-cache-*.mjs`
- `test-calendar-*.mjs`
- `test-client-*.mjs`
- `test-closure-*.mjs`
- `test-complete-no-sms.mjs`
- `test-reviews-*.mjs`
- `test-resend-*.mjs`
- `test-profile-*.mjs`
- `test-sms-*.mjs`
- `test-slots-*.mjs`
- `test-account-deletion.mjs`
- `test-closed-message.mjs`

## Fix Scripts (già applicati)
- `fix-*.mjs` (tutti)

## Delete/Reset Scripts
- `delete-*.mjs` (tutti)
- `remove-*.mjs`
- `reset-*.mjs` (tranne reset-user-password.mjs)
- `clean-*.mjs`
- `clear-database.mjs`

## Setup/Quick Scripts
- `setup-*.mjs`
- `quick-*.mjs`
- `simple-*.mjs`
- `temp-*.mjs`

## Altri
- `extend-schedules.mjs`
- `inject-push-handlers.mjs`
- `migrate-michele-email.mjs`
- `recreate-database.mjs`
- `reset-all-closures.mjs`
- `reset-closure-days.mjs`
- `TASK_COMPLETED_SUMMARY.mjs`

---

# TOTALE
- **Da mantenere**: ~8 file
- **Da eliminare**: ~150+ file
