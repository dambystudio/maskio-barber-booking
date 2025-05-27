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
    
    // Check if it's a zoom event by comparing visual viewport
    if ('visualViewport' in window && window.visualViewport) {
      const zoomLevel = window.innerWidth / window.visualViewport.width;
      return zoomLevel > 1.1; // Zoom detected if scale > 110%
    }
    
    // Fallback: check devicePixelRatio changes
    const currentZoom = window.devicePixelRatio || 1;
    return currentZoom !== 1;
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
    // Detect debugger
    const detectDebugger = () => {
      const start = performance.now();
      debugger;
      const end = performance.now();
      
      if (end - start > 100) {
        this.debugDetected = true;
        this.handleSecurityBreach('debugger');
      }
    };

    // Run detection every 2 seconds
    setInterval(detectDebugger, 2000);

    // Infinite debugger loop
    setInterval(() => {
      if (this.debugDetected) {
        debugger;
      }
    }, 1000);
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
  }
  private detectDevTools(): void {
    if (typeof window === 'undefined') return;

    // Method 1: Window size detection (enhanced for mobile)
    let devtools = {
      open: false,
      orientation: null as string | null
    };

    setInterval(() => {
      // Skip detection if mobile device or zoom event
      if (this.isMobileDevice() || this.isZoomEvent()) {
        return;
      }
      
      const heightDiff = window.outerHeight - window.innerHeight;
      const widthDiff = window.outerWidth - window.innerWidth;
      
      // More conservative thresholds and additional checks
      if ((heightDiff > 250 || widthDiff > 250) && 
          !this.isZoomEvent() && 
          !this.isMobileDevice()) {
        if (!devtools.open) {
          devtools.open = true;
          this.devToolsOpen = true;
          this.handleSecurityBreach('devtools_size');
        }
      } else {
        devtools.open = false;
        this.devToolsOpen = false;
      }
    }, 1000); // Increased interval to 1 second

    // Method 2: toString modification detection
    let element = new Image();
    Object.defineProperty(element, 'id', {
      get: () => {
        // Only trigger on desktop
        if (!this.isMobileDevice()) {
          this.handleSecurityBreach('devtools_element');
        }
        return 'devtools_detected';
      }
    });

    // Method 3: Performance timing (mobile-safe)
    setInterval(() => {
      // Skip on mobile devices
      if (this.isMobileDevice()) {
        return;
      }
      
      const start = performance.now();
      // Use original console if available to avoid recursion
      if (typeof window !== 'undefined' && (window as any).__originalConsole) {
        (window as any).__originalConsole.clear();
      }
      const end = performance.now();
      
      if (end - start > 2) { // Increased threshold for mobile compatibility
        this.handleSecurityBreach('devtools_performance');
      }
    }, 5000); // Increased interval to 5 seconds
  }

  private disableContextMenu(): void {
    if (typeof document !== 'undefined') {
      document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        this.handleSecurityBreach('context_menu');
        return false;
      });
    }
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
    if (typeof document !== 'undefined') {
      // Disable text selection
      document.addEventListener('selectstart', (e) => {
        e.preventDefault();
        return false;
      });

      // Disable drag
      document.addEventListener('dragstart', (e) => {
        e.preventDefault();
        return false;
      });

      // Disable print
      window.addEventListener('beforeprint', (e) => {
        e.preventDefault();
        this.handleSecurityBreach('print_attempt');
        return false;
      });
    }
  }

  private monitorPerformance(): void {
    let lastTime = performance.now();
    
    const monitor = () => {
      const currentTime = performance.now();
      const timeDiff = currentTime - lastTime;
      
      // If execution is too slow, debugging might be active
      if (timeDiff > 200) {
        this.handleSecurityBreach('performance_anomaly');
      }
      
      lastTime = currentTime;
      requestAnimationFrame(monitor);
    };
    
    requestAnimationFrame(monitor);
  }  private handleSecurityBreach(type: string): void {
    // Double-check: never trigger on mobile devices or during zoom
    if (this.isMobileDevice() || this.isZoomEvent()) {
      return;
    }
    
    // Use original console if available to avoid recursion
    if (typeof window !== 'undefined' && (window as any).__originalConsole) {
      (window as any).__originalConsole.clear();
    }
    
    // Redirect to blank page only on desktop
    if (typeof window !== 'undefined' && !this.isMobileDevice()) {
      window.location.replace('about:blank');
    }
    
    // Optional: Send analytics about the breach
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
