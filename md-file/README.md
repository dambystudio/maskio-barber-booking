# 💈 Maskio Barber - Sistema di Prenotazione Barbiere

[![License: CC BY-NC-SA 4.0](https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc-sa/4.0/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8)](https://tailwindcss.com/)

**Sistema completo di prenotazione online per barbiere con verifica SMS e gestione manuale prenotazioni.**

---

## ✨ Caratteristiche Principali

- 📱 **Verifica SMS** con Twilio (rate limiting 3 SMS/15min)
- 🧑‍💼 **Prenotazioni manuali barbiere** (nome obbligatorio, email/telefono opzionali)
- 📅 **Gestione appuntamenti** con calendario dinamico
- 🔐 **Sistema di autenticazione** con NextAuth.js
- 💳 **Gestione servizi e prezzi**
- 📊 **Pannello admin** per barbieri
- 🎨 **UI moderna** con Tailwind CSS e Framer Motion

---

## 👨‍💻 Sviluppatore

**dambystudio** - Web Development Studio  
🌐 Portfolio: [https://linktr.ee/dambystudio](https://linktr.ee/dambystudio)  
📧 Contatti: dambystudio@gmail.com

---

## 🔒 Licenza

Questo progetto è rilasciato sotto licenza **Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)**.

- **🚫 Non commerciale**: Non puoi utilizzare il codice per scopi commerciali senza permesso
- **👤 Attribuzione**: Devi sempre citare l'autore (dambystudio)
- **🔄 Stessa licenza**: Le modifiche devono mantenere la stessa licenza

Per dettagli completi, vedi il file [LICENSE](LICENSE) e [COPYRIGHT.md](COPYRIGHT.md).

---

## 🚀 Installazione e Avvio

Questo è un progetto [Next.js](https://nextjs.org) con TypeScript.

### Prerequisiti
- Node.js 18+ 
- npm/yarn/pnpm
- Database PostgreSQL (Neon)

### Setup
1. Clona il repository
2. Installa le dipendenze: `npm install`
3. Configura `.env.local` con le tue variabili
4. Avvia il server di sviluppo:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Apri [http://localhost:3000](http://localhost:3000) nel browser.

---

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.