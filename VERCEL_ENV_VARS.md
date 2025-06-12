# Variabili d'ambiente da configurare su Vercel
# Vai su https://vercel.com/dashboard → Il tuo progetto → Settings → Environment Variables

# Database
DATABASE_URL=<DATABASE_CONNECTION_STRING>

# NextAuth - IMPORTANTE: Cambia URL per produzione
NEXTAUTH_SECRET=<GENERA_UN_SECRET_SICURO>
NEXTAUTH_URL=https://tuo-dominio-produzione.vercel.app

# Google OAuth
GOOGLE_CLIENT_ID=<IL_TUO_GOOGLE_CLIENT_ID>
GOOGLE_CLIENT_SECRET=<IL_TUO_GOOGLE_CLIENT_SECRET>

# Email (opzionale se non usi email)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=<APP_PASSWORD>

# Google Reviews
GOOGLE_PLACES_API_KEY=<IL_TUO_GOOGLE_PLACES_API_KEY>
GOOGLE_PLACE_ID=<IL_TUO_GOOGLE_PLACE_ID>
