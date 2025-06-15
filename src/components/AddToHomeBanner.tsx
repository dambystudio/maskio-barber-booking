"use client";
import { useEffect, useState } from "react";

const isMobile = () => {
  if (typeof window === "undefined") return false;
  return /android|iphone|ipad|ipod|opera mini|iemobile|mobile/i.test(
    window.navigator.userAgent
  );
};

export default function AddToHomeBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!isMobile()) return;
    if (window.matchMedia('(display-mode: standalone)').matches) return;
    if (localStorage.getItem("maskio_add_to_home_dismissed")) return;
    setShow(true);
  }, []);

  if (!show) return null;

  const handleClose = () => {
    setShow(false);
    localStorage.setItem("maskio_add_to_home_dismissed", "1");
  };

  return (
    <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 w-[95vw] max-w-md bg-amber-900 text-white rounded-xl shadow-lg px-4 py-3 flex items-center gap-3 animate-fade-in">
      <svg width="32" height="32" fill="none" viewBox="0 0 24 24" className="flex-shrink-0"><path fill="#fff" d="M12 2a1 1 0 0 1 1 1v12.59l3.3-3.3a1 1 0 1 1 1.4 1.42l-5 5a1 1 0 0 1-1.4 0l-5-5a1 1 0 1 1 1.4-1.42l3.3 3.3V3a1 1 0 0 1 1-1Z"/></svg>
      <div className="flex-1 text-sm">
        <b>Consiglio:</b> Per un'esperienza migliore, aggiungi Maskio Barber alla schermata Home.<br/>
        <span className="text-xs opacity-80">Dal menu del browser, scegli "Aggiungi a schermata Home".</span>
      </div>
      <button onClick={handleClose} aria-label="Chiudi notifica" className="ml-2 text-white/80 hover:text-white text-lg">&times;</button>
    </div>
  );
}
