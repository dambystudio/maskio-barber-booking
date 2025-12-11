// 🎄 CONFIGURAZIONE TEMA NATALIZIO
// Cambia questo valore a `false` per disattivare il tema natalizio

export const CHRISTMAS_THEME_CONFIG = {
  enabled: true, // 👈 Cambia a false per disattivare
  
  // Date di attivazione automatica (opzionale)
  autoEnable: {
    startDate: '2025-12-01', // Inizio periodo natalizio
    endDate: '2026-01-06',   // Epifania
  },
  
  // Opzioni di personalizzazione
  snowEnabled: true,
  christmasLightsEnabled: true,
  christmasColorsEnabled: true,
  santaHatOnLogo: false, // Cappello di Babbo Natale sul logo
};

// Funzione per verificare se il tema è attivo
export function isChristmasThemeActive(): boolean {
  if (!CHRISTMAS_THEME_CONFIG.enabled) return false;
  
  // Se autoEnable è attivo, controlla la data
  if (CHRISTMAS_THEME_CONFIG.autoEnable) {
    const now = new Date();
    const start = new Date(CHRISTMAS_THEME_CONFIG.autoEnable.startDate);
    const end = new Date(CHRISTMAS_THEME_CONFIG.autoEnable.endDate);
    
    return now >= start && now <= end;
  }
  
  return true;
}
