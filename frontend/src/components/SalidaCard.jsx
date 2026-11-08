import React from 'react';

const tipos = { lancha: 'Lancha', rapido: 'Rápido', deslizador: 'Deslizador' };
const moneda = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' });
const fecha = new Intl.DateTimeFormat('es-PE', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'America/Lima' });
const hora = new Intl.DateTimeFormat('es-PE', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'America/Lima' });

export function fechaSalida(valor) {
  return new Date(/(?:Z|[+-]\d{2}:\d{2})$/.test(valor) ? valor : `${valor}-05:00`);
}

export default function SalidaCard({ salida, onEditar, onEliminar, ocupado }) {
  const salidaFecha = fechaSalida(salida.fechaHora);
  return (
    <article className="salida-card">
      <div className="card-top"><span className="tipo">{tipos[salida.tipo] || salida.tipo}</span><span className="origen">Desde Iquitos</span></div>
      <h3>{salida.destino}</h3>
      <p className="empresa">{salida.empresa}</p>
      {salida.embarcacion && <p className="embarcacion">{salida.embarcacion}</p>}
      <dl>
        <div><dt>Salida</dt><dd><time dateTime={salida.fechaHora}>{fecha.format(salidaFecha)} · {hora.format(salidaFecha)}</time></dd></div>
        <div><dt>Puerto</dt><dd>{salida.puerto}</dd></div>
        {salida.duracionHoras !== undefined && <div><dt>Duración</dt><dd>{salida.duracionHoras} horas</dd></div>}
      </dl>
      <div className="card-bottom"><span>Pasaje referencial</span><strong>{moneda.format(salida.precio)}</strong></div>
      <div className="acciones"><button className="secundario" disabled={ocupado} onClick={() => onEditar(salida.id)} aria-label={`Editar salida a ${salida.destino} de ${salida.empresa}`}>Editar</button><button className="peligro" disabled={ocupado} onClick={() => onEliminar(salida)} aria-label={`Eliminar salida a ${salida.destino} de ${salida.empresa}`}>Eliminar</button></div>
    </article>
  );
}
