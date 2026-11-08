process.env.NODE_ENV = 'production';
const app = require('../backend/src/index');
const puerto = process.env.PORT || 3000;
app.listen(puerto, () => console.log(`LanchaYa disponible en http://localhost:${puerto}`));
