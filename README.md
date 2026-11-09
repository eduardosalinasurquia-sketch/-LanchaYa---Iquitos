# CARLOS EDUARDO SALINAS URQUIA
# LanchaYa Iquitos

Aplicación full stack para consultar y administrar salidas fluviales desde Iquitos. Backend Express 4, frontend React 18 con Vite y persistencia en archivo JSON. Probado con Node.js 24.19.0; el manual propone Node.js 20.

## Instalación

Requisitos: Node.js 24, npm y Git.

```sh
cd -LanchaYa---Iquitos
npm --prefix backend ci
npm --prefix frontend ci
```

Los comandos siguientes se ejecutan desde la raíz del repositorio. No se necesita instalar dependencias en la raíz.

## Ejecución en desarrollo

```sh
npm run dev
```

Interfaz: http://localhost:5173. API: http://localhost:3000/api/salidas. Mantener la terminal abierta; Ctrl+C detiene ambos servicios. Cerrar instancias anteriores para liberar los puertos 3000 y 5173.

Alternativa en dos terminales: `npm --prefix backend run dev` y `npm --prefix frontend run dev`. Vite reenvía `/api` a `http://127.0.0.1:3000`.

Si aparece ERR_CONNECTION_REFUSED, comprobar que los procesos estén encendidos. Si la interfaz abre pero no carga salidas, comprobar el backend en el puerto 3000.

## Administración de salidas

- Registrar salida: completar empresa, destino, puerto, fecha y hora, tipo y precio; embarcación, duración y cupos son opcionales.
- Editar: consulta el detalle actualizado y abre el formulario. Guardar persiste los cambios.
- Eliminar: abre un modal liquid glass con el destino, empresa y horario antes de borrar permanentemente. Cancelar o Escape cierra la confirmación; durante la eliminación los controles se bloquean y los errores aparecen dentro del modal.
- Filtrar: destino (obtenido de la API), fecha y tipo; los filtros se combinan. Limpiar filtros recupera el listado completo.

Precio debe ser numérico y mayor que cero. Tipo acepta lancha, rapido o deslizador. Al registrar, la fecha no puede estar en el pasado. Los horarios se interpretan y muestran en Iquitos (UTC-05:00). Cupos debe ser entero no negativo y duración no negativa.

El alcance del manual excluye login y roles. La interfaz de administración es la misma aplicación y cualquier persona con acceso a la API puede modificar salidas. Para un uso administrativo restringido, el administrador del servidor debe limitar el acceso mediante red privada o autenticación en un proxy externo. El proyecto no implementa cuentas ni contraseñas de administrador.

## Despliegue para programadores

Guía técnica para preparar, configurar y ejecutar la aplicación compilada en un servidor con Node.js. Subir el código a GitHub no publica la aplicación. Se usa un despliegue conjunto: Express entrega el build de React y la API desde el mismo puerto.

1. Clonar el repositorio e instalar las dependencias como se indica arriba.
2. Ejecutar las pruebas, compilar el frontend y arrancar el servidor:

```sh
npm test
npm run build
npm start
```

`npm start` activa el modo producción: Express sirve `frontend/dist` y `/api` desde el mismo origen. Abrir http://localhost:3000. Vite no se usa como servidor de producción. La compilación debe realizarse antes de arrancar.

Para cambiar el puerto en PowerShell:

```powershell
$env:PORT = '8080'
npm start
```

En Linux:

```sh
PORT=8080 npm start
```

Mantener el proceso con el supervisor del servidor y configurar un proxy HTTPS hacia ese puerto si se publica con dominio. En instalaciones restringidas, aplicar el control de acceso tanto a la interfaz como a `/api`.

### Variables de configuración

| Variable | Valor predeterminado | Uso |
| --- | --- | --- |
| `PORT` | `3000` | Puerto HTTP del backend en desarrollo y producción |
| `SALIDAS_FILE` | `backend/src/data/salidas.json` | Ruta absoluta a un JSON existente para persistencia |
| `VITE_API_URL` | `/api` | Base de la API, incorporada al compilar React |
| `NODE_ENV` | `production` al usar `npm start` en la raíz | Habilita servir `frontend/dist` desde Express |

El proxy de desarrollo de Vite apunta al puerto 3000. Si se cambia ese puerto durante el desarrollo, actualizar también `frontend/vite.config.js`.

### Actualización de una instalación

Usar `SALIDAS_FILE` fuera del checkout para separar los datos operativos del código. Respaldar ese archivo y detener el proceso antes de actualizar. Desde la raíz:

```sh
git pull --ff-only origin main
npm --prefix backend ci
npm --prefix frontend ci
npm test
npm run build
npm start
```

Si el servicio se gestiona con un supervisor, reiniciarlo con ese supervisor en lugar de ejecutar una segunda instancia con `npm start`. Conservar las variables configuradas. Tras iniciar, comprobar que `/` carga la interfaz y `/api/salidas` devuelve HTTP 200 con un arreglo. Revisar registro, edición, filtros y eliminación con un registro de prueba.

### Persistencia y respaldo

Por defecto los cambios se guardan en `backend/src/data/salidas.json`, con 12 registros semilla ficticios y precios referenciales. Ejecutar una sola instancia del backend: la cola de escrituras protege solicitudes concurrentes dentro de un proceso, no entre servidores.

La variable opcional `SALIDAS_FILE` permite indicar la ruta absoluta a otro JSON existente. Copiar primero el archivo semilla a esa ubicación, dar permisos de escritura al proceso y conservarlo en almacenamiento persistente. Hacer copias de respaldo antes de actualizar; no reemplazar los datos operativos por los semilla al actualizar el código. Un disco efímero pierde los cambios al reiniciar.

Si frontend y API se alojan separados, definir `VITE_API_URL` con la URL completa terminada en `/api` antes de compilar. Esta variable se incorpora al build y exige recompilar al cambiarla. En el despliegue conjunto no hace falta definirla. Las variables del backend se suministran mediante el entorno; no se cargan archivos .env automáticamente.

## API REST

| Método | Ruta | Respuesta |
| --- | --- | --- |
| GET | `/api/salidas` | 200, lista ordenada por fecha |
| GET | `/api/salidas/:id` | 200 o 404 |
| POST | `/api/salidas` | 201 o 400 |
| PUT | `/api/salidas/:id` | 200, 400 o 404 |
| DELETE | `/api/salidas/:id` | 204 sin cuerpo o 404 |
| GET | `/api/destinos` | 200, destinos sin repetir |

Filtros combinables: `/api/salidas?destino=Nauta&fecha=2026-11-09&tipo=rapido`.

POST y PUT usan `Content-Type: application/json`. Ejemplo (usar una fecha futura para crear):

```json
{
  "empresa": "Transportes Río Itaya",
  "embarcacion": "Don José II",
  "tipo": "rapido",
  "destino": "Nauta",
  "puerto": "Puerto Productores",
  "fechaHora": "2027-11-09T06:30",
  "duracionHoras": 2,
  "precio": 20,
  "cupos": 30
}
```

Los errores usan `{ "mensaje": "..." }`. PUT requiere todos los campos obligatorios y permite editar registros con fecha pasada. El ID se genera en el backend.

## Verificación

```sh
npm test
npm run build
```

Las pruebas HTTP cubren CRUD, filtros, validaciones, códigos de respuesta, persistencia y creaciones simultáneas con un JSON temporal sin alterar los datos del proyecto. La compilación verifica el frontend; no sustituye las pruebas manuales de sus controles en navegador.

Colección Postman: `backend/LanchaYa.postman_collection.json`. Importar y ejecutar en orden con el backend encendido; POST guarda el ID para las siguientes solicitudes. Las solicitudes manuales modifican el JSON del servidor; el paso DELETE retira el registro de prueba. La colección también fue ejecutada mediante Newman: 9 solicitudes y 18 verificaciones aprobadas. El reporte se conserva en `backend/reportes/postman-resultados.json`.

## Estructura y diseño

- `backend/src`: arranque, rutas, controlador y datos JSON.
- `backend/test`: pruebas de integración HTTP.
- `frontend/src/components`: SalidaCard, Filtros y SalidaForm.
- `frontend/src/components/Modal.jsx` y `ConfirmarEliminar.jsx`: diálogos de la aplicación con estilo compartido, foco contenido, devolución del foco y bloqueo del desplazamiento de fondo. Registro y edición muestran las validaciones en la aplicación, sin cuadros de alerta del navegador.
- `frontend/src/services/api.js`: consumo de los seis endpoints con fetch.
- `frontend/public`: logo, fondos y decoraciones.
- `scripts`: arranque conjunto de desarrollo y servidor de producción.

Diseño responsive con franjas textiles originales, fondo fijo, cabecera amazónica y prueba de liquid glass. El botón Registrar salida conserva un fondo verde sólido. Los estilos de vidrio están separados en `liquid-glass.css` y `glass-controls.css`; retirar sus imports en `main.jsx` permite desactivar esa prueba. Las imágenes generadas con IA incluyen archivos de texto con los prompts usados. No hay pagos ni venta de pasajes.


