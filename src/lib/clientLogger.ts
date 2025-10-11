/**
 * Client Logger per debug da mobile/PWA
 * 
 * Invia i log al server tramite API per debug remoto
 * quando la console non è accessibile (es. PWA su mobile)
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogOptions {
  details?: any;
  skipConsole?: boolean;
}

class ClientLogger {
  private queue: Array<{
    level: LogLevel;
    message: string;
    details?: any;
    userAgent: string;
    url: string;
    timestamp: string;
  }> = [];
  
  private sending = false;
  private batchTimeout: NodeJS.Timeout | null = null;

  /**
   * Log generico
   */
  private async log(level: LogLevel, message: string, options: LogOptions = {}) {
    const { details, skipConsole } = options;

    // Log anche su console del browser
    if (!skipConsole) {
      const consoleMethod = level === 'error' ? console.error : 
                           level === 'warn' ? console.warn : 
                           level === 'debug' ? console.debug : 
                           console.log;
      consoleMethod(`[${level.toUpperCase()}]`, message, details || '');
    }

    // Aggiungi alla coda per invio al server
    this.queue.push({
      level,
      message,
      details,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString()
    });

    // Debounce: invia batch ogni 2 secondi
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
    }
    
    this.batchTimeout = setTimeout(() => {
      this.flush();
    }, 2000);

    // Se è un errore, invia subito
    if (level === 'error') {
      this.flush();
    }
  }

  /**
   * Invia tutti i log in coda al server
   */
  async flush() {
    if (this.queue.length === 0 || this.sending) {
      return;
    }

    this.sending = true;
    const logsToSend = [...this.queue];
    this.queue = [];

    try {
      // Invia ogni log separatamente (potrebbero essere batch in futuro)
      for (const log of logsToSend) {
        await fetch('/api/log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(log)
        }).catch(err => {
          // Fallback: stampa su console se API non disponibile
          console.error('[Logger] Failed to send log to server:', err);
        });
      }
    } catch (error) {
      console.error('[Logger] Failed to flush logs:', error);
    } finally {
      this.sending = false;
    }
  }

  /**
   * Log livello INFO
   */
  info(message: string, details?: any) {
    return this.log('info', message, { details });
  }

  /**
   * Log livello WARN
   */
  warn(message: string, details?: any) {
    return this.log('warn', message, { details });
  }

  /**
   * Log livello ERROR
   */
  error(message: string, details?: any) {
    return this.log('error', message, { details });
  }

  /**
   * Log livello DEBUG
   */
  debug(message: string, details?: any) {
    return this.log('debug', message, { details });
  }

  /**
   * Log specifico per tracking eventi waitlist
   */
  waitlist(action: string, data: any) {
    return this.log('info', `[WAITLIST] ${action}`, { details: data });
  }
}

// Singleton instance
export const clientLogger = new ClientLogger();

// Export default per import comodo
export default clientLogger;
