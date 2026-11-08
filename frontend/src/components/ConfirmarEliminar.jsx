import React, { useState } from 'react';
import Modal from './Modal';
import { fechaSalida } from './SalidaCard';

export default function ConfirmarEliminar({ salida, onConfirmar, onCerrar }) {
  const [eliminando, setEliminando] = useState(false);
  const [error, setError] = useState('');
  async function confirmar(e) {
    e.preventDefault();
    if (eliminando) return;
    setEliminando(true); setError('');
    try { await onConfirmar(salida); } catch (fallo) { setError(fallo.message); setEliminando(false); }
  }
  return <Modal tituloId="eliminar-titulo" descripcionId="eliminar-descripcion" ocupado={eliminando} onCerrar={onCerrar} className="confirmar-dialog">
    <form onSubmit={confirmar}>
      <span className="modal-etiqueta">GESTIONAR SALIDAS</span>
      <h2 id="eliminar-titulo">¿Eliminar esta salida?</h2>
      <p id="eliminar-descripcion">La salida se eliminará permanentemente. Esta acción no se puede deshacer.</p>
      <dl className="resumen-salida">
        <div><dt>Destino</dt><dd>{salida.destino}</dd></div>
        <div><dt>Empresa</dt><dd>{salida.empresa}</dd></div>
        <div><dt>Salida desde Iquitos</dt><dd>{new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Lima' }).format(fechaSalida(salida.fechaHora))}</dd></div>
      </dl>
      {error && <p className="estado error" role="alert">{error}</p>}
      <div className="acciones">
        <button autoFocus type="button" className="secundario" disabled={eliminando} onClick={onCerrar}>Cancelar</button>
        <button type="submit" className="peligro" disabled={eliminando}>{eliminando ? 'Eliminando…' : 'Sí, eliminar salida'}</button>
      </div>
    </form>
  </Modal>;
}
