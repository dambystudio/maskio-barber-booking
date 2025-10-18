# QUICK FIX - Michele Chiuso

## Opzione 1: Clear Cache Browser
1. Apri browser in **Modalità Incognito**
2. Vai a http://localhost:3000/prenota (o al sito Vercel)
3. Verifica se funziona

## Opzione 2: Clear localStorage
1. Apri il sito
2. Premi F12 (DevTools)
3. Vai alla tab "Console"
4. Incolla ed esegui:
```javascript
localStorage.clear();
location.reload();
```

## Opzione 3: Force Rebuild (se in locale)
```bash
# Terminale
rm -rf .next
npm run build
npm run dev
```

## Opzione 4: Verifica Deploy Vercel
1. Vai a https://vercel.com/dambystudio/maskio-barber-booking
2. Controlla ultimo deploy
3. Se serve, forza redeploy:
```bash
git commit --allow-empty -m "Force rebuild"
git push
```

## Test Rapido
Apri il file: **test-exceptional-opening.html** nel browser
Segui i 4 passi per vedere esattamente dove è il problema.
