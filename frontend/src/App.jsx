import React, { useEffect, useState } from 'react';
import SalidaCard, { fechaSalida } from './components/SalidaCard';
import { listarSalidas, listarDestinos, obtenerSalida, guardarSalida, eliminarSalida } from './services/api';
import Filtros from './components/Filtros';
import SalidaForm from './components/SalidaForm';
import ConfirmarEliminar from './components/ConfirmarEliminar';

export default function App() {
  const [salidas, setSalidas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [intento, setIntento] = useState(0);
  const [filtros, setFiltros] = useState({ destino: '', fecha: '', tipo: '' });
  const [destinos, setDestinos] = useState([]);
  const [formulario, setFormulario] = useState(null);
  const [porEliminar, setPorEliminar] = useState(null);
  const [ocupado, setOcupado] = useState(false);
  const [aviso, setAviso] = useState('');
  const [errorAccion, setErrorAccion] = useState('');

  async function editar(id) {
    setOcupado(true); setErrorAccion('');
    try { setFormulario(await obtenerSalida(id)); } catch (e) { setErrorAccion(e.message); } finally { setOcupado(false); }
  }
  async function guardar(datos, id) {
    await guardarSalida(datos, id);
    setFormulario(null); setAviso(id ? 'Salida actualizada.' : 'Salida registrada.');
    setIntento(i => i + 1);
  }
  async function eliminar(salida) {
    setOcupado(true); setErrorAccion('');
    try { await eliminarSalida(salida.id); setPorEliminar(null); setAviso('Salida eliminada.'); setIntento(i => i + 1); } finally { setOcupado(false); }
  }

  useEffect(() => {
    const controller = new AbortController();
    setCargando(true);
    setError('');
    Promise.all([listarSalidas({ signal: controller.signal, filtros }), listarDestinos({ signal: controller.signal })])
      .then(([datos, destinosApi]) => {
        if (!controller.signal.aborted) { setSalidas([...datos].sort((a, b) => fechaSalida(a.fechaHora) - fechaSalida(b.fechaHora))); setDestinos(destinosApi); }
      })
      .catch(fallo => { if (!controller.signal.aborted) setError(fallo.message); })
      .finally(() => { if (!controller.signal.aborted) setCargando(false); });
    return () => controller.abort();
  }, [intento, filtros]);

  return (
    <>
      <header className="cabecera">
        <div className="contenedor identidad">
          <img className="logo" src="/logo-lanchaya.png" alt="Logo de LanchaYa Iquitos" width="76" height="76" />
          <div className="marca">Lancha<span>Ya</span><span className="ciudad">Iquitos</span></div>
        </div>
      </header>
      <main className="contenedor">
        <section className="introduccion" aria-labelledby="titulo">
          <p className="etiqueta">TRANSPORTE FLUVIAL · LORETO</p>
          <h1 id="titulo">Tu próximo destino<br />empieza en el río.</h1>
          <p>Consulta horarios, puertos y precios de las salidas desde Iquitos.</p>
        </section>
        <section aria-labelledby="listado-titulo" aria-busy={cargando}>
          <div className="listado-cabecera"><h2 id="listado-titulo">Salidas fluviales</h2><span>Primero, las fechas más próximas</span></div>
          <div className="acciones"><button className="registrar-solido" onClick={() => { setFormulario({}); setErrorAccion(''); }} disabled={ocupado}>Registrar salida</button></div>
          <Filtros filtros={filtros} destinos={destinos} onChange={setFiltros} />
          {aviso && <p className="estado" role="status">{aviso}</p>}
          {errorAccion && <p className="estado error" role="alert">{errorAccion}</p>}
          {cargando ? <p className="estado" role="status">Cargando salidas…</p> : error ? (
            <div className="estado error" role="alert"><p>{error}</p><button onClick={() => setIntento(valor => valor + 1)}>Reintentar</button></div>
          ) : salidas.length === 0 ? <p className="estado" role="status">No hay salidas para los filtros seleccionados.</p> : (
            <div className="salidas-grid">{salidas.map(salida => <SalidaCard key={salida.id} salida={salida} onEditar={editar} onEliminar={setPorEliminar} ocupado={ocupado} />)}</div>
          )}
        </section>
      </main>
      {formulario !== null && <SalidaForm salida={formulario.id ? formulario : null} onGuardar={guardar} onCerrar={() => setFormulario(null)} />}
      {porEliminar && <ConfirmarEliminar salida={porEliminar} onConfirmar={eliminar} onCerrar={() => setPorEliminar(null)} />}
      <footer className="contenedor">LanchaYa Iquitos · Empresas ficticias y precios referenciales para este proyecto.</footer>
    </>
  );
}
