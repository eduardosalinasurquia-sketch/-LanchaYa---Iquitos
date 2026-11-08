const { readFile, writeFile, rename } = require('node:fs/promises');
const path = require('node:path');
const archivo = process.env.SALIDAS_FILE || path.join(__dirname, '../data/salidas.json');
const tipos = ['lancha', 'rapido', 'deslizador'];
let pendiente = Promise.resolve();

async function leer() { return JSON.parse(await readFile(archivo, 'utf8')); }

// Una escritura a la vez y reemplazo del archivo completo para evitar datos truncados.
function modificar(operacion) {
  const resultado = pendiente.then(async () => {
    const salidas = await leer();
    const respuesta = operacion(salidas);
    await writeFile(`${archivo}.tmp`, JSON.stringify(salidas, null, 2) + '\n', 'utf8');
    await rename(`${archivo}.tmp`, archivo);
    return respuesta;
  });
  pendiente = resultado.catch(() => {});
  return resultado;
}

function errorHttp(status, mensaje) { return Object.assign(new Error(mensaje), { status }); }

// Las fechas sin zona del manual corresponden a Iquitos (UTC-05:00).
function instante(fecha) {
  if (typeof fecha !== 'string') return NaN;
  const partes = fecha.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})(:\d{2}(?:\.\d{1,3})?)?(Z|[+-]\d{2}:\d{2})?$/);
  if (!partes) return NaN;
  const dia = new Date(`${partes[1]}T00:00:00Z`);
  if (!Number.isFinite(dia.getTime()) || dia.toISOString().slice(0, 10) !== partes[1]) return NaN;
  if (Number(partes[2].slice(0, 2)) > 23 || Number(partes[2].slice(3)) > 59) return NaN;
  return Date.parse(fecha + (partes[4] ? '' : '-05:00'));
}

function validar(body, registro) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw errorHttp(400, 'Debe enviar un objeto JSON.');
  const datos = {};
  for (const campo of ['empresa', 'destino', 'puerto', 'fechaHora']) {
    if (typeof body[campo] !== 'string' || !body[campo].trim()) throw errorHttp(400, `${campo} es obligatorio y debe ser texto.`);
    datos[campo] = body[campo].trim();
  }
  if (typeof body.precio !== 'number' || !Number.isFinite(body.precio) || body.precio <= 0) throw errorHttp(400, 'precio debe ser un número mayor que 0.');
  if (!tipos.includes(body.tipo)) throw errorHttp(400, 'tipo solo acepta: lancha, rapido, deslizador.');
  const fecha = instante(datos.fechaHora);
  if (!Number.isFinite(fecha)) throw errorHttp(400, 'fechaHora debe ser una fecha ISO 8601 válida.');
  if (registro && fecha < Date.now()) throw errorHttp(400, 'fechaHora no puede estar en el pasado al registrar.');
  datos.precio = body.precio;
  datos.tipo = body.tipo;
  if (body.embarcacion !== undefined) {
    if (typeof body.embarcacion !== 'string') throw errorHttp(400, 'embarcacion debe ser texto.');
    datos.embarcacion = body.embarcacion.trim();
  }
  for (const campo of ['duracionHoras', 'cupos']) {
    if (body[campo] !== undefined) {
      if (typeof body[campo] !== 'number' || !Number.isFinite(body[campo]) || body[campo] < 0 || (campo === 'cupos' && !Number.isInteger(body[campo]))) {
        throw errorHttp(400, `${campo} debe ser un número no negativo${campo === 'cupos' ? ' entero' : ''}.`);
      }
      datos[campo] = body[campo];
    }
  }
  return datos;
}

function buscar(salidas, id) {
  const indice = salidas.findIndex(salida => String(salida.id) === id);
  if (indice === -1) throw errorHttp(404, 'Salida no encontrada.');
  return indice;
}

const manejar = funcion => async (req, res, next) => {
  try { await funcion(req, res); } catch (error) { next(error); }
};

const listarSalidas = manejar(async (req, res) => {
  const { destino, fecha, tipo } = req.query;
  for (const valor of [destino, fecha, tipo]) {
    if (valor !== undefined && typeof valor !== 'string') throw errorHttp(400, 'Los filtros deben ser texto.');
  }
  if (tipo && !tipos.includes(tipo)) throw errorHttp(400, 'tipo solo acepta: lancha, rapido, deslizador.');
  if (fecha && (!/^\d{4}-\d{2}-\d{2}$/.test(fecha) || !Number.isFinite(instante(`${fecha}T00:00`)))) throw errorHttp(400, 'fecha debe ser una fecha válida con formato YYYY-MM-DD.');
  const diaLocal = valor => new Date(instante(valor) - 5 * 3600000).toISOString().slice(0, 10);
  const salidas = (await leer()).filter(salida =>
    (!destino || salida.destino.toLocaleLowerCase('es-PE') === destino.trim().toLocaleLowerCase('es-PE')) &&
    (!fecha || diaLocal(salida.fechaHora) === fecha) && (!tipo || salida.tipo === tipo));
  salidas.sort((a, b) => instante(a.fechaHora) - instante(b.fechaHora));
  res.status(200).json(salidas);
});

const obtenerSalida = manejar(async (req, res) => {
  const salidas = await leer();
  res.status(200).json(salidas[buscar(salidas, req.params.id)]);
});
const crearSalida = manejar(async (req, res) => {
  const datos = validar(req.body, true);
  const creada = await modificar(salidas => {
    const salida = { id: Math.max(0, ...salidas.map(item => item.id)) + 1, ...datos };
    salidas.push(salida);
    return salida;
  });
  res.status(201).json(creada);
});
const actualizarSalida = manejar(async (req, res) => {
  const actualizada = await modificar(salidas => {
    const indice = buscar(salidas, req.params.id);
    salidas[indice] = { ...salidas[indice], ...validar(req.body, false) };
    return salidas[indice];
  });
  res.status(200).json(actualizada);
});
const eliminarSalida = manejar(async (req, res) => {
  await modificar(salidas => { salidas.splice(buscar(salidas, req.params.id), 1); });
  res.status(204).end();
});
const listarDestinos = manejar(async (req, res) => {
  res.status(200).json([...new Set((await leer()).map(salida => salida.destino))].sort((a, b) => a.localeCompare(b, 'es')));
});
module.exports = { listarSalidas, obtenerSalida, crearSalida, actualizarSalida, eliminarSalida, listarDestinos };
