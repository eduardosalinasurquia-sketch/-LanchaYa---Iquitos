const express = require('express');
const cors = require('cors');
const path = require('node:path');
const salidasRoutes = require('./routes/salidas');
const { listarDestinos } = require('./controllers/salidas.controller');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/salidas', salidasRoutes);
app.get('/api/destinos', listarDestinos);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../frontend/dist')));
}

app.use((req, res) => {
  res.status(404).json({ mensaje: 'Ruta no encontrada.' });
});

app.use((error, req, res, next) => {
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ mensaje: 'El cuerpo debe contener JSON válido.' });
  }
  if (error.status === 400 || error.status === 404) {
    return res.status(error.status).json({ mensaje: error.message });
  }
  console.error(error);
  res.status(500).json({ mensaje: 'No se pudo procesar la solicitud.' });
});

if (require.main === module) {
  const puerto = process.env.PORT || 3000;
  app.listen(puerto, () => {
    console.log(`LanchaYa disponible en http://localhost:${puerto}`);
  });
}

module.exports = app;
