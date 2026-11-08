import React, { useEffect, useRef } from 'react';

export default function Modal({ tituloId, descripcionId, ocupado = false, onCerrar, className = '', children }) {
  const ref = useRef(null);
  useEffect(() => {
    const anterior = document.activeElement;
    const dialogo = ref.current;
    dialogo.showModal();
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      dialogo.close();
      document.body.style.overflow = overflowAnterior;
      if (anterior instanceof HTMLElement && anterior.isConnected) anterior.focus();
    };
  }, []);
  return <dialog ref={ref} className={`form-dialog ${className}`} aria-labelledby={tituloId} aria-describedby={descripcionId} aria-busy={ocupado} onCancel={e => { e.preventDefault(); if (!ocupado) onCerrar(); }}>
    {children}
  </dialog>;
}
