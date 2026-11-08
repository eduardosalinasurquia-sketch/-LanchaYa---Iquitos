const baseUrl = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

async function solicitar(ruta, opciones = {}) {
  let respuesta;
  try {
    respuesta = await fetch(`${baseUrl}${ruta}`, opciones);
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new Error('No pudimos conectar con el servidor. Comprueba que el backend esté encendido.');
  }
  if (!respuesta.ok) {
    const error = await respuesta.json().catch(() => ({}));
    throw new Error(error.mensaje || 'No pudimos conectar con la API. Comprueba que el backend esté encendido.');
  }
  return respuesta.status === 204 ? null : respuesta.json();
}
export const listarSalidas = ({ signal, filtros = {} } = {}) => solicitar(`/salidas?${new URLSearchParams(Object.entries(filtros).filter(([, valor]) => valor))}`, { signal });
export const listarDestinos = ({ signal } = {}) => solicitar('/destinos', { signal });
export const obtenerSalida = id => solicitar(`/salidas/${id}`);
export const guardarSalida = (datos, id) => solicitar(id ? `/salidas/${id}` : '/salidas', { method: id ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(datos) });
export const eliminarSalida = id => solicitar(`/salidas/${id}`, { method: 'DELETE' });
