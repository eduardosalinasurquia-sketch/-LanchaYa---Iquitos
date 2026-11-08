import React from 'react';
export default function Filtros({ filtros, destinos, onChange }) {
  const cambiar = e => onChange({ ...filtros, [e.target.name]: e.target.value });
  return <div className="filtros">
    <label>Destino<select name="destino" value={filtros.destino} onChange={cambiar}><option value="">Todos los destinos</option>{destinos.map(d => <option key={d}>{d}</option>)}</select></label>
    <label>Fecha<input name="fecha" type="date" value={filtros.fecha} onChange={cambiar} /></label>
    <label>Tipo<select name="tipo" value={filtros.tipo} onChange={cambiar}><option value="">Todos los tipos</option><option value="lancha">Lancha</option><option value="rapido">Rápido</option><option value="deslizador">Deslizador</option></select></label>
    <button className="secundario" onClick={() => onChange({ destino: '', fecha: '', tipo: '' })}>Limpiar filtros</button>
  </div>;
}
