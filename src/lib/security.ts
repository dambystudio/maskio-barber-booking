// Security Protection Layer
'use client';

class SecurityManager {
  private static instance: SecurityManager;
  private debugDetected = false;
  private devToolsOpen = false;
  private isDevelopment = false;  private constructor() {
    if (typeof window !== 'undefined') {
      // Check if we're in development mode
      this.isDevelopment = process.env.NODE_ENV === 'development' || 
                          window.location.hostname === 'localhost' ||
                          window.location.hostname === '127.0.0.1';
      
      // Check if we're on mobile device
      const isMobile = this.isMobileDevice();
      
      // Only enable security in production AND NOT on mobile
      // This ensures mobile users can zoom and use the site normally
      if (!this.isDevelopment && !isMobile) {
        console.log('Security activated for desktop production');
        this.initProtections();
      } else if (isMobile) {
        console.log('Mobile device detected - security disabled for better UX');
      } else {
        console.log('Development mode - security disabled');
      }
    }
  }
  private isMobileDevice(): boolean {
    if (typeof window === 'undefined') return false;
    
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobileUserAgent = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isSmallScreen = window.innerWidth <= 768;
    const isMobileViewport = window.screen.width <= 768;
    
    return isMobileUserAgent || (hasTouchScreen && (isSmallScreen || isMobileViewport));
  }
    private isZoomEvent(): boolean {
    if (typeof window === 'undefined') return false;
    
    // Migliore rilevamento degli eventi di zoom che evita falsi positivi
    // Questo è importante per permettere agli utenti di zoomare senza attivare le misure di sicurezza
    
    // Controllo del viewport visuale (più preciso)
    if ('visualViewport' in window && window.visualViewport) {
      const zoomLevel = window.innerWidth / window.visualViewport.width;
      // Aumentiamo la soglia per essere più permissivi
      return zoomLevel > 1.2; // Zoom rilevato se la scala è > 120%
    }
    
    // Fallback: controllo tramite devicePixelRatio
    // Siamo più permissivi per consentire piccole variazioni
    const currentZoom = window.devicePixelRatio || 1;
    return currentZoom > 1.2 || currentZoom < 0.8; // Permetti variazioni tra 0.8 e 1.2
  }

  public static getInstance(): SecurityManager {
    if (!SecurityManager.instance) {
      SecurityManager.instance = new SecurityManager();
    }
    return SecurityManager.instance;
  }

  private initProtections(): void {
    // Anti-debugging protection
    this.setupAntiDebugging();
    
    // Console protection
    this.disableConsole();
    
    // DevTools detection
    this.detectDevTools();
    
    // Context menu protection
    this.disableContextMenu();
    
    // Keyboard shortcuts protection
    this.disableKeyboardShortcuts();
    
    // Source code protection
    this.protectSourceCode();
    
    // Performance monitoring (detect debugging)
    this.monitorPerformance();
  }
  private setupAntiDebugging(): void {
    // Mantenendo alcune misure anti-debugging ma solo per rilevare
    // l'uso attivo degli strumenti di sviluppo, non durante lo zoom o altre operazioni legittime
    if (typeof window === 'undefined') return;
    
    // Rilevamento attivazione debugger più leggero
    const detectDebugger = () => {
      try {
        const start = performance.now();
        debugger;
        const end = performance.now();
        
        // Aumentiamo significativamente la soglia per evitare falsi positivi
        if (end - start > 300) {
          this.debugDetected = true;
          this.handleSecurityBreach('debugger');
        }
      } catch (e) {
        // Ignoriamo gli errori
      }
    };

    // Riduciamo la frequenza per migliorare le prestazioni
    setInterval(detectDebugger, 5000);
  }
  private disableConsole(): void {
    if (typeof window !== 'undefined') {
      // Store original console reference before overriding
      const originalConsole = { ...console };
      
      // Override console methods
      const noop = () => {};
      const methods = ['log', 'debug', 'info', 'warn', 'error', 'table', 'clear', 'trace', 'assert'];
      
      methods.forEach(method => {
        (console as any)[method] = noop;
      });

      // Store original console for internal use
      (window as any).__originalConsole = originalConsole;
    }
  }  private detectDevTools(): void {
    if (typeof window === 'undefined') return;

    // Solo il rilevamento di F12 e scorciatoie per gli strumenti di sviluppo
    // Questo metodo non utilizza più il rilevamento basato su dimensioni della finestra
    // che può interferire con lo zoom e altre funzionalità legittime
    
    // Rimuovere tutti i rilevamenti che possono essere attivati da azioni legittime come lo zoom
    // Mantenere solo il rilevamento di F12 e scorciatoie da tastiera specifiche che appaiono in disableKeyboardShortcuts

    // Non utilizziamo più toString modification e performance timing
    // in quanto possono causare falsi positivi e limitare funzionalità legittime
  }
  private disableContextMenu(): void {
    // Non blocchiamo più il menu contestuale in quanto è una funzionalità normale del browser
    // e non è direttamente correlata all'ispezione degli elementi
  }

  private disableKeyboardShortcuts(): void {
    if (typeof document !== 'undefined') {
      document.addEventListener('keydown', (e) => {
        // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U, Ctrl+S
        if (
          e.key === 'F12' ||
          (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) ||
          (e.ctrlKey && e.key === 'U') ||
          (e.ctrlKey && e.key === 'S') ||
          (e.ctrlKey && e.shiftKey && e.key === 'C')
        ) {
          e.preventDefault();
          this.handleSecurityBreach('keyboard_shortcut');
          return false;
        }
      });
    }
  }
  private protectSourceCode(): void {
    // Non blocchiamo più la selezione di testo, il trascinamento o la stampa
    // in quanto sono funzionalità normali del browser che migliorano l'esperienza utente
    // e non sono direttamente correlate all'ispezione degli elementi
  }
  private monitorPerformance(): void {
    // Non monitoriamo più le anomalie di performance in quanto possono essere causate
    // da molti fattori legittimi come dispositivi lenti, altre schede attive,
    // batteria scarica, ecc. e non sono indicative solo dell'uso degli strumenti di sviluppo
  }  private handleSecurityBreach(type: string): void {
    // Verificare che si tratti di un'attività legata all'ispezione degli elementi
    // e non di altre operazioni legittime come lo zoom
    if (this.isMobileDevice() || this.isZoomEvent()) {
      return;
    }
    
    // Reindirizzare a about:blank solo per violazioni specifiche legate all'ispezione
    if (typeof window !== 'undefined' && !this.isMobileDevice()) {
      // Reindirizzare solo se la violazione è legata a F12 o scorciatoie da tastiera per gli strumenti di sviluppo
      if (type === 'keyboard_shortcut' || type === 'debugger') {
        window.location.replace('about:blank');
      }
    }
    
    // Opzionale: registrare l'evento di sicurezza
    this.logSecurityEvent(type);
  }

  private logSecurityEvent(type: string): void {
    // In production, you might want to send this to your analytics
    // fetch('/api/security-log', {
    //   method: 'POST',
    //   body: JSON.stringify({ type, timestamp: Date.now() })
    // }).catch(() => {});
  }  // Method to check if environment is secure
  public isSecure(): boolean {
    // Always return true in development mode or mobile devices
    if (this.isDevelopment || this.isMobileDevice()) {
      return true;
    }
    return !this.debugDetected && !this.devToolsOpen;
  }

  // Obfuscated function names
  public _0x1a2b3c(): void {
    this.initProtections();
  }

  public _0x4d5e6f(): boolean {
    return this.isSecure();
  }
}

// Self-executing protection
(() => {
  if (typeof window !== 'undefined') {
    // Check if we're in development mode
    const isDevelopment = process.env.NODE_ENV === 'development' || 
                         window.location.hostname === 'localhost' ||
                         window.location.hostname === '127.0.0.1';
    
    // Check if we're on mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                     (window.innerWidth <= 768) ||
                     ('ontouchstart' in window);
    
    // Initialize security on load
    SecurityManager.getInstance();
    
    // Additional protection layer (only in production and NOT mobile)
    if (!isDevelopment && !isMobile) {
      const _0x7g8h9i = setInterval(() => {
        if (!SecurityManager.getInstance().isSecure()) {
          clearInterval(_0x7g8h9i);
          window.location.replace('about:blank');
        }
      }, 5000);
    }
  }
})();

export default SecurityManager;

// Export obfuscated
export const _0x9j0k1l = SecurityManager;
