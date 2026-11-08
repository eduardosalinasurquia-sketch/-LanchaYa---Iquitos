const { test } = require('node:test');
const assert = require('node:assert/strict');
const { mkdtemp, copyFile, readFile, rm } = require('node:fs/promises');
const { tmpdir } = require('node:os');
const path = require('node:path');

test('CRUD, filtros, validaciones y persistencia de la API', async () => {
  const carpeta = await mkdtemp(path.join(tmpdir(), 'lanchaya-'));
  const archivo = path.join(carpeta, 'salidas.json');
  await copyFile(path.join(__dirname, '../src/data/salidas.json'), archivo);
  process.env.SALIDAS_FILE = archivo;
  const app = require('../src/index');
  const servidor = app.listen(0, '127.0.0.1');
  await new Promise(resolve => servidor.once('listening', resolve));
  const base = `http://127.0.0.1:${servidor.address().port}/api`;
  async function solicitar(ruta, status, metodo = 'GET', datos) {
    const respuesta = await fetch(base + ruta, {
      method: metodo,
      headers: { 'Content-Type': 'application/json' },
      body: datos === undefined ? undefined : JSON.stringify(datos)
    });
    assert.equal(respuesta.status, status, `${metodo} ${ruta}`);
    if (status === 204) { assert.equal(await respuesta.text(), ''); return; }
    const json = await respuesta.json();
    if (status >= 400) assert.equal(typeof json.mensaje, 'string');
    return json;
  }
  try {
    const inicial = await solicitar('/salidas', 200);
    assert.equal(inicial.length, 12);
    const destinos = await solicitar('/destinos', 200);
    assert.equal(destinos.length, new Set(inicial.map(s => s.destino)).size);
    for (const filtro of ['destino=Nauta', 'fecha=2026-11-09', 'tipo=rapido', 'destino=Nauta&fecha=2026-11-09&tipo=rapido']) {
      const resultado = await solicitar(`/salidas?${filtro}`, 200);
      const params = new URLSearchParams(filtro);
      const esperado = inicial.filter(s => [...params].every(([k, v]) => k === 'fecha' ? s.fechaHora.startsWith(v) : s[k] === v));
      assert.deepEqual(resultado, esperado);
    }
    assert.deepEqual(await solicitar('/salidas?destino=Inexistente', 200), []);
    await solicitar('/salidas?fecha=2026-02-30', 400);
    await solicitar('/salidas?tipo=avion', 400);
    await solicitar('/salidas?tipo[]=lancha', 400);
    assert.equal((await solicitar('/salidas/1', 200)).id, 1);
    const datos = { empresa: 'Empresa de prueba', embarcacion: 'Prueba', destino: 'Nauta', puerto: 'Puerto Henry', fechaHora: new Date(Date.now() + 86400000).toISOString(), tipo: 'rapido', precio: 30, duracionHoras: 2, cupos: 20 };
    for (const campo of ['empresa', 'destino', 'puerto', 'fechaHora']) {
      const incompleto = { ...datos }; delete incompleto[campo];
      await solicitar('/salidas', 400, 'POST', incompleto);
    }
    for (const cambio of [{ precio: 0 }, { precio: -1 }, { precio: '20' }, { tipo: 'avion' }, { fechaHora: '2020-01-01T10:00' }, { fechaHora: '2030-02-30T10:00' }, { fechaHora: '2030-01-01T24:00' }, { cupos: -1 }]) {
      await solicitar('/salidas', 400, 'POST', { ...datos, ...cambio });
    }
    const creada = await solicitar('/salidas', 201, 'POST', { ...datos, id: 1 });
    assert.equal(creada.id, 13);
    assert.deepEqual(await solicitar(`/salidas/${creada.id}`, 200), creada);
    assert.ok(JSON.parse(await readFile(archivo, 'utf8')).some(s => s.id === creada.id));
    await solicitar(`/salidas/${creada.id}`, 400, 'PUT', { ...datos, precio: 0 });
    const editada = await solicitar(`/salidas/${creada.id}`, 200, 'PUT', { ...datos, precio: 45, fechaHora: '2020-01-01T10:00' });
    assert.equal(editada.precio, 45);
    assert.equal(editada.id, creada.id);
    await solicitar(`/salidas/${creada.id}`, 204, 'DELETE');
    for (const metodo of ['GET', 'PUT', 'DELETE']) await solicitar(`/salidas/${creada.id}`, 404, metodo, metodo === 'PUT' ? datos : undefined);
    assert.equal((await solicitar('/salidas', 200)).length, 12);
    const paralelas = await Promise.all(Array.from({ length: 3 }, () => solicitar('/salidas', 201, 'POST', datos)));
    assert.equal(new Set(paralelas.map(s => s.id)).size, 3);
    assert.equal(JSON.parse(await readFile(archivo, 'utf8')).length, 15);
    const invalida = await fetch(base + '/salidas', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{' });
    assert.equal(invalida.status, 400);
  } finally {
    await new Promise(resolve => servidor.close(resolve));
    delete process.env.SALIDAS_FILE;
    await rm(carpeta, { recursive: true, force: true });
  }
});
