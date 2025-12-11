# 🎄 Tema Natalizio - Guida Rapida

## Come Attivare/Disattivare

### Metodo Semplice
Apri il file `/src/config/christmas-theme.ts` e modifica:

```typescript
export const CHRISTMAS_THEME_CONFIG = {
  enabled: true, // 👈 Cambia a false per disattivare
  ...
}
```

### Attivazione Automatica per Date
Il tema può attivarsi automaticamente in base alle date:

```typescript
export const CHRISTMAS_THEME_CONFIG = {
  enabled: true,
  
  autoEnable: {
    startDate: '2025-12-01', // Inizio
    endDate: '2026-01-06',   // Fine (Epifania)
  },
  ...
}
```

## Opzioni di Personalizzazione

```typescript
export const CHRISTMAS_THEME_CONFIG = {
  enabled: true,
  
  // Abilita/disabilita singoli elementi
  snowEnabled: true,                // ❄️ Neve animata
  christmasLightsEnabled: true,     // 💡 Luci colorate
  christmasColorsEnabled: true,     // 🎨 Colori natalizi
  santaHatOnLogo: false,           // 🎅 Cappello sul logo
}
```

## File Coinvolti

### File di Configurazione
- `/src/config/christmas-theme.ts` - Configurazione principale

### File CSS
- `/src/styles/christmas.css` - Tutti gli stili natalizi

### Componenti
- `/src/components/ChristmasDecorations.tsx` - Componente decorazioni

### File Modificati (minimamente)
- `/src/app/layout.tsx` - Import CSS natalizio
- `/src/app/page.tsx` - Componente decorazioni nella homepage

## Rimozione Completa (Dopo le Feste)

Per rimuovere completamente il tema natalizio:

1. **Elimina i file:**
   ```bash
   rm src/config/christmas-theme.ts
   rm src/styles/christmas.css
   rm src/components/ChristmasDecorations.tsx
   rm CHRISTMAS_THEME_README.md
   ```

2. **Rimuovi import da layout.tsx:**
   ```typescript
   // Rimuovi questa riga
   import '../styles/christmas.css';
   ```

3. **Rimuovi da page.tsx:**
   ```typescript
   // Rimuovi import
   import ChristmasDecorations from '../components/ChristmasDecorations';
   
   // Rimuovi componente
   <ChristmasDecorations />
   ```

## Effetti Inclusi

### ❄️ Neve Animata
- 50 fiocchi di neve animati
- Movimento naturale con rotazione
- Velocità variabile

### 💡 Luci di Natale
- 20 luci colorate (rosso, verde, giallo, blu, bianco)
- Animazione lampeggiante
- Cavo decorativo

### 🎁 Decorazioni Extra
- Stelle scintillanti
- Fiocchi di neve grandi decorativi
- Campanelli e regali negli angoli
- Animazione floating

### 🎨 Effetti Speciali
- Bordi ghiacciati
- Overlay con colori natalizi
- Effetto shimmer

## Performance

Il tema è ottimizzato per:
- ✅ Zero impatto sul caricamento iniziale (lazy loading)
- ✅ Animazioni GPU-accelerated
- ✅ Conditional rendering (si attiva solo se enabled)
- ✅ Responsive design
- ✅ Pointer-events: none sulle decorazioni

## Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers

## Note

- Le decorazioni sono `pointer-events: none` quindi non interferiscono con i clic
- La neve è visibile su tutto il sito
- Le luci sono solo nella parte superiore
- Le decorazioni extra sono nascoste su mobile per performance
