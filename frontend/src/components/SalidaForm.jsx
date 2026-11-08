import React, { useEffect, useRef, useState } from 'react';
import { fechaSalida } from './SalidaCard';

function fechaLocal(valor) {
  if (!valor) return '';
  return new Date(fechaSalida(valor).getTime() - 5 * 3600000).toISOString().slice(0, 16);
}
export default function SalidaForm({ salida, onGuardar, onCerrar }) {
  const [datos, setDatos] = useState({ empresa: '', embarcacion: '', tipo: 'lancha', destino: '', puerto: '', duracionHoras: '', precio: '', cupos: '', ...salida, fechaHora: fechaLocal(salida?.fechaHora) });
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);
  const dialogo = useRef(null);
  useEffect(() => { const d = dialogo.current; d.showModal(); return () => d.close(); }, []);
  async function enviar(e) {
    e.preventDefault(); setError('');
    if (['empresa', 'destino', 'puerto', 'fechaHora'].some(c => !datos[c].trim())) { setError('Completa los campos obligatorios.'); return; }
    if (!(Number(datos.precio) > 0)) { setError('El precio debe ser mayor que cero.'); return; }
    if (!salida && fechaSalida(datos.fechaHora).getTime() < Date.now()) { setError('La fecha no puede estar en el pasado al registrar.'); return; }
    const payload = { ...datos, precio: Number(datos.precio) };
    delete payload.id;
    for (const campo of ['duracionHoras', 'cupos']) {
      if (datos[campo] === '') delete payload[campo];
      else {
        payload[campo] = Number(datos[campo]);
        if (!Number.isFinite(payload[campo]) || payload[campo] < 0 || (campo === 'cupos' && !Number.isInteger(payload[campo]))) { setError('La duración y los cupos deben ser no negativos; los cupos deben ser enteros.'); return; }
      }
    }
    setGuardando(true);
    try { await onGuardar(payload, salida?.id); } catch (fallo) { setError(fallo.message); setGuardando(false); }
  }
  return <dialog ref={dialogo} className="form-dialog" aria-labelledby="form-titulo" onCancel={e => { e.preventDefault(); if (!guardando) onCerrar(); }}>
    <form onSubmit={enviar}>
      <h2 id="form-titulo">{salida ? 'Editar salida' : 'Registrar salida'}</h2>
      <p>Los campos con * son obligatorios. Horarios de Iquitos.</p>
      <fieldset disabled={guardando}>
        <div className="form-grid">
          {[['empresa', 'Empresa *'], ['embarcacion', 'Embarcación'], ['destino', 'Destino *'], ['puerto', 'Puerto *']].map(([campo, texto]) => <label key={campo}>{texto}<input name={campo} value={datos[campo]} required={campo !== 'embarcacion'} onChange={e => setDatos({ ...datos, [campo]: e.target.value })} /></label>)}
          <label>Tipo *<select value={datos.tipo} onChange={e => setDatos({ ...datos, tipo: e.target.value })}><option value="lancha">Lancha</option><option value="rapido">Rápido</option><option value="deslizador">Deslizador</option></select></label>
          <label>Fecha y hora *<input type="datetime-local" required value={datos.fechaHora} onChange={e => setDatos({ ...datos, fechaHora: e.target.value })} /></label>
          {[['precio', 'Precio (S/) *', '0.01', '0.01'], ['duracionHoras', 'Duración (horas)', '0', '0.1'], ['cupos', 'Cupos', '0', '1']].map(([campo, texto, min, step]) => <label key={campo}>{texto}<input type="number" min={min} step={step} required={campo === 'precio'} value={datos[campo]} onChange={e => setDatos({ ...datos, [campo]: e.target.value })} /></label>)}
        </div>
        {error && <p className="estado error" role="alert">{error}</p>}
        <div className="acciones"><button type="submit">{guardando ? 'Guardando…' : 'Guardar salida'}</button><button type="button" className="secundario" onClick={onCerrar}>Cancelar</button></div>
      </fieldset>
    </form>
  </dialog>;
}
