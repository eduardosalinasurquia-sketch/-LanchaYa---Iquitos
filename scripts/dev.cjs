const { spawn } = require('node:child_process');
const path = require('node:path');
const backend = spawn(process.execPath, ['src/index.js'], { cwd: path.join(__dirname, '../backend'), stdio: 'inherit' });
const frontend = spawn(process.execPath, ['node_modules/vite/bin/vite.js'], { cwd: path.join(__dirname, '../frontend'), stdio: 'inherit' });
let cerrando = false;
function cerrar(code = 0) {
  if (cerrando) return;
  cerrando = true;
  backend.kill();
  frontend.kill();
  process.exitCode = code;
}
for (const proceso of [backend, frontend]) {
  proceso.on('error', error => { console.error(error.message); cerrar(1); });
  proceso.on('exit', code => cerrar(code || 0));
}
process.on('SIGINT', () => cerrar());
process.on('SIGTERM', () => cerrar());
