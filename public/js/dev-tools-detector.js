// Script per rilevare l'uso degli strumenti di sviluppo e gestire la visibilità dei blocchi di codice
(function() {
  // Funzione per verificare se gli strumenti di sviluppo sono aperti
  function areDevToolsOpen() {
    const threshold = 160; // soglia per rilevare la finestra di ispezione
    
    // Metodo 1: verifica della differenza di dimensioni della finestra
    const widthThreshold = window.outerWidth - window.innerWidth > threshold;
    const heightThreshold = window.outerHeight - window.innerHeight > threshold;
    
    // Metodo 2: verifica con console.log e tempistica
    let devtools = false;
    const startTime = new Date();
    console.log('%c', 'padding: 10px; background-color: white;');
    console.clear();
    const endTime = new Date();
    if (endTime - startTime > 100) {
      devtools = true;
    }
    
    return widthThreshold || heightThreshold || devtools;
  }
  
  // Funzione per gestire la visibilità dei blocchi di codice
  function toggleCodeBlocks() {
    const isInspecting = areDevToolsOpen();
    const codeBlocks = document.querySelectorAll('pre, code');
    
    codeBlocks.forEach(block => {
      if (isInspecting) {
        block.style.display = 'block'; // Mostra i blocchi di codice
      } else {
        block.style.display = 'none'; // Nascondi i blocchi di codice
      }
    });
  }
  
  // Controllo iniziale
  window.addEventListener('load', toggleCodeBlocks);
  
  // Controllo periodico ogni secondo
  setInterval(toggleCodeBlocks, 1000);
  
  // Controllo su ridimensionamento della finestra
  window.addEventListener('resize', toggleCodeBlocks);
})();
