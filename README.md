# TP12 -- CRUD web de reservas con MongoDB

Aplicación web para administrar reservas de salas de estudio, desarrollada con **Node.js, Express, EJS y MongoDB** mediante Mongoose.

Este trabajo práctico amplía las funcionalidades del TP11 incorporando el **cambio de estado y la eliminación de reservas desde la interfaz web**, con formularios independientes, validaciones específicas y confirmación de las operaciones.

Se conservan las funcionalidades web y la API REST heredadas, incluyendo la creación, consulta, edición por reemplazo completo, actualización parcial y eliminación de reservas.

## Tecnologías utilizadas

- **Node.js:** >= 22.13.0 (entorno de ejecución).
- **Express:** 5.2.1 (servidor y enrutamiento HTTP).
- **MongoDB Atlas y Mongoose:** rango declarado `^9.11.2` (persistencia y validación de documentos). La versión instalada y verificada es 9.12.1. Base de datos `reservas_salas_u12`.
- **EJS:** 6.0.1 y **express-ejs-layouts:** 2.5.1 (vistas HTML renderizadas en el servidor).
- **Morgan:** 1.12.1 (registro de solicitudes HTTP).
- **Prettier:** 3.9.9 y **ESLint:** 10.12.0 (formato y análisis estático del código).
- **Postman:** herramienta opcional para pruebas de la API REST.

## Requisitos previos

- Node.js 22.13.0 o superior.
- npm.
- Una cuenta y un clúster de MongoDB Atlas.
- Acceso de red al clúster de MongoDB Atlas.

## Instalación

Clonar el repositorio y entrar en la carpeta del proyecto:

```bash
git clone https://github.com/marcos-batallan/tp-12-salas-crud-web-mongodb.git
cd tp-12-salas-crud-web-mongodb
```

Instalar las dependencias declaradas en `package-lock.json`:

```bash
npm ci
```

## Configuración del entorno

Crear un archivo `.env` a partir de `.env.example`:

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb+srv://USUARIO:CLAVE@HOST/reservas_salas_u12?retryWrites=true&w=majority
```

Reemplazar `USUARIO`, `CLAVE` y `HOST` por los datos de conexión correspondientes. La URI debe apuntar a la base de datos `reservas_salas_u12`.

**Importante:** el archivo `.env` contiene credenciales y no debe subirse al repositorio. El archivo `.env.example` utiliza valores de ejemplo y no contiene secretos.

El archivo `.gitignore` excluye `node_modules`, `.env` y los demás archivos de entorno, conservando `.env.example`.

### Comprobar la conexión

Ejecutar:

```bash
node --env-file=.env scripts/comprobar-conexion.js
```

Si la conexión es correcta, se informa:

```text
Conexión con MongoDB establecida
```

## Ejecución

Iniciar la aplicación cargando las variables del archivo `.env`:

```bash
npm run start:local
```

También se puede ejecutar directamente:

```bash
node --env-file=.env src/index.js
```

Por defecto, la aplicación queda disponible en:

```text
http://localhost:3000
```

## Estructura del proyecto

```text
tp-12-salas-crud-web-mongodb/
│
├── public/
│   ├── css/
│   │   └── estilos.css
│   └── img/
│       ├── favicon.svg
│       └── salas-estudio.svg
│
├── scripts/
│   ├── comprobar-conexion.js
│   ├── crear-reservas.js
│   ├── listar-reservas.js
│   └── validar-reserva.js
│
├── src/
│   ├── config/
│   │   ├── base-datos.js
│   │   └── entorno.js
│   │
│   ├── controladores/
│   │   └── reservas.js
│   │
│   ├── middleware/
│   │   ├── cambios-reservas.js
│   │   ├── errores.js
│   │   ├── reservas.js
│   │   └── solicitudes.js
│   │
│   ├── modelos/
│   │   └── reserva.js
│   │
│   ├── rutas/
│   │   ├── reservas-api.js
│   │   └── reservas.js
│   │
│   ├── servicios/
│   │   ├── reservas-mongo.js
│   │   └── reservas.js
│   │
│   ├── app.js
│   └── index.js
│
├── views/
│   ├── layouts/
│   │   └── main.ejs
│   ├── partials/
│   │   ├── encabezado.ejs
│   │   └── pie.ejs
│   ├── reservas/
│   │   ├── detalle.ejs
│   │   ├── editar.ejs
│   │   ├── eliminar.ejs
│   │   ├── estado.ejs
│   │   ├── lista.ejs
│   │   └── nueva.ejs
│   ├── inicio.ejs
│   └── no-encontrado.ejs
│
├── .env.example
├── .gitignore
├── eslint.config.js
├── package-lock.json
├── package.json
└── README.md
```

La aplicación mantiene una separación por responsabilidades:

- **Configuración:** lectura y validación de variables de entorno, conexión y desconexión de MongoDB.
- **Modelo:** esquema Mongoose y reglas de validación de los documentos.
- **Servicio:** operaciones de persistencia, consultas, reemplazos, actualizaciones parciales y eliminaciones.
- **Controlador:** coordinación entre solicitudes HTTP, servicios y respuestas.
- **Rutas:** definición de endpoints web y API REST.
- **Middleware:** validación de entradas, preparación de datos para las vistas, identificación y medición de solicitudes, y manejo centralizado de errores.
- **Vistas:** formularios, listado, detalle, cambio de estado, confirmación de eliminación y mensajes HTML.

## Modelo de reserva

La aplicación utiliza la base de datos `reservas_salas_u12` y la colección `reservas`.

Cada documento contiene los siguientes campos:

| Campo | Tipo | Regla |
|---|---|---|
| `id` | ObjectId representado como texto | Identificador generado por MongoDB |
| `estudiante` | String | Obligatorio |
| `email` | String | Obligatorio; debe contener `@` |
| `sala` | String | `Sala Norte`, `Sala Sur` o `Sala Multimedia` |
| `fecha` | String | Obligatoria |
| `turno` | String | `Mañana`, `Tarde` o `Noche` |
| `personas` | Number | Número entero entre 1 y 6 |
| `estado` | String | `pendiente` o `confirmada`; valor predeterminado `pendiente` |

El identificador se genera automáticamente mediante MongoDB y no se modifica desde los formularios.

Al crear una reserva desde la web o la API, el estado se establece inicialmente en `pendiente` mediante el valor predeterminado del modelo.

## Funcionalidades web

La interfaz permite consultar reservas, crear nuevas, visualizar su detalle, editar sus siete campos, modificar su estado y eliminar registros mediante una confirmación explícita.

### Rutas web

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/` | Página de inicio |
| GET | `/estado` | Estado del servicio, cantidad de reservas e identificador de solicitud |
| GET | `/reservas` | Listado de reservas |
| GET | `/reservas/nueva` | Mostrar formulario de creación |
| POST | `/reservas` | Crear una reserva |
| GET | `/reservas/:id` | Mostrar el detalle de una reserva |
| GET | `/reservas/:id/editar` | Mostrar formulario de edición con los siete campos precargados |
| POST | `/reservas/:id/editar` | Guardar el reemplazo completo de una reserva |
| GET | `/reservas/:id/estado` | Mostrar formulario para modificar el estado |
| POST | `/reservas/:id/estado` | Actualizar únicamente el estado |
| GET | `/reservas/:id/eliminar` | Mostrar confirmación de eliminación |
| POST | `/reservas/:id/eliminar` | Confirmar y ejecutar la eliminación |

### Creación de reservas

El formulario de alta permite ingresar los seis campos principales:

- Estudiante.
- Email.
- Sala.
- Fecha.
- Turno.
- Cantidad de personas.

El estado no se recibe desde este formulario, ya que el modelo asigna automáticamente `pendiente`.

Si los datos son válidos, se crea el documento en MongoDB y se responde con **HTTP 302 Found**, redirigiendo al listado de reservas.

Si existen errores de validación, se responde con HTML 400 y se vuelve a mostrar el formulario conservando los valores ingresados y los mensajes correspondientes.

### Edición por reemplazo completo

El formulario de edición precarga los siete campos:

`estudiante`, `email`, `sala`, `fecha`, `turno`, `personas` y `estado`.

El identificador se obtiene exclusivamente del parámetro `:id` de la URL y no se envía como campo editable.

Al guardar, el servidor valida los datos y construye un objeto con los siete campos admitidos. Luego utiliza `servicio.reemplazar`, la misma operación de servicio utilizada por el endpoint PUT de la API.

El formulario debe enviar los siete campos aunque solo se haya modificado uno. No se trata de una actualización parcial.

Cuando el reemplazo se completa correctamente, el servidor responde con **HTTP 303 See Other** y redirige al detalle de la reserva:

```text
/reservas/:id
```

Si los datos no son válidos, se responde con HTML 400 y se vuelve a mostrar el formulario con los valores recibidos y los mensajes correspondientes. La reserva almacenada no se modifica.

Para identificadores inválidos se devuelve HTML 400; para identificadores válidos que no corresponden a una reserva existente, HTML 404.

La acción Cancelar vuelve al detalle sin enviar el formulario ni guardar cambios.

### Cambio de estado desde la web

Se incorpora un formulario independiente para modificar el estado de una reserva.

El formulario se accede mediante:

```text
GET /reservas/:id/estado
```

Muestra el identificador de la reserva y el estado actual, permitiendo seleccionar únicamente:

- `pendiente`
- `confirmada`

La operación se envía mediante:

```text
POST /reservas/:id/estado
```

El servidor acepta exactamente un campo de texto llamado `estado`. Rechaza valores vacíos, estados no permitidos, campos adicionales y campos repetidos.

Para guardar el cambio utiliza:

```js
servicioReservas.actualizar(id, { estado });
```

De esta manera se actualiza únicamente el estado, sin reemplazar el documento completo ni modificar el identificador o los otros seis campos.

Si la operación es correcta, responde con **HTTP 303 See Other** y redirige al detalle de la reserva:

```text
/reservas/:id
```

Si los datos no son válidos, responde con HTML 400 y vuelve a mostrar el formulario con el identificador, el valor recibido y los mensajes de error.

La acción Cancelar regresa al detalle sin enviar el formulario ni guardar cambios.

### Eliminación de reservas desde la web

La eliminación se realiza mediante una pantalla de confirmación independiente.

Se accede mediante:

```text
GET /reservas/:id/eliminar
```

La pantalla muestra:

- Identificador de la reserva.
- Estudiante.
- Sala.
- Fecha.
- Turno.
- Advertencia de que la eliminación es permanente.

La confirmación se envía mediante:

```text
POST /reservas/:id/eliminar
```

El formulario envía exclusivamente el campo:

```text
confirmar=si
```

El servidor rechaza solicitudes con confirmación ausente, incorrecta, repetida o acompañada de campos adicionales. Estas solicitudes responden con HTML 400 y no eliminan el documento.

Cuando la confirmación es válida, se ejecuta:

```js
servicioReservas.eliminar(id);
```

Si la eliminación se completa correctamente, el servidor responde con **HTTP 303 See Other** y redirige al listado:

```text
/reservas
```

La operación no redirige al detalle de una reserva eliminada.

La acción Cancelar vuelve al detalle mediante un enlace de lectura, sin ejecutar ninguna operación de escritura.

Si la reserva deja de existir mientras el formulario de confirmación permanece abierto, el servidor responde con HTML 404 y no vuelve a crear el documento.

Para identificadores inválidos se devuelve HTML 400; para identificadores válidos inexistentes, HTML 404. Un intento de eliminar nuevamente una reserva ya eliminada también responde 404.

## API REST

La API conserva las operaciones heredadas del proyecto anterior y permite crear, consultar, reemplazar, actualizar parcialmente y eliminar reservas.

### Endpoints

| Método | Ruta | Descripción | Respuesta exitosa |
|---|---|---|---|
| GET | `/api/reservas` | Consultar reservas | 200 OK |
| GET | `/api/reservas/:id` | Obtener una reserva por ID | 200 OK |
| POST | `/api/reservas` | Crear una reserva | 201 Created |
| PUT | `/api/reservas/:id` | Reemplazar todos los campos editables | 200 OK |
| PATCH | `/api/reservas/:id` | Actualizar parcialmente los campos admitidos | 200 OK |
| DELETE | `/api/reservas/:id` | Eliminar una reserva | 204 No Content |

Los errores de la API se responden en formato JSON.

Los identificadores inválidos se informan con HTTP 400 y las reservas inexistentes con HTTP 404.

### Consulta de reservas

El endpoint `GET /api/reservas` admite los siguientes parámetros:

| Parámetro | Descripción | Valores y límites |
|---|---|---|
| `sala` | Filtrar por sala | Texto correspondiente a una sala permitida |
| `orden` | Ordenar resultados | `estudiante`, `personas-asc` o `personas-desc` |
| `pagina` | Número de página | Entero entre 1 y 1000; por defecto 1 |
| `limite` | Cantidad de resultados | Entero entre 1 y 20; por defecto 2 |

Ejemplos:

```text
GET /api/reservas
GET /api/reservas?sala=Sala%20Norte
GET /api/reservas?orden=personas-desc
GET /api/reservas?pagina=1&limite=2
GET /api/reservas?sala=Sala%20Sur&orden=estudiante&pagina=1&limite=5
```

La respuesta del listado incluye:

- `datos`: reservas encontradas.
- `pagina`: página actual.
- `limite`: cantidad máxima de resultados.
- `total`: cantidad total de reservas que cumplen el filtro.
- `paginas`: cantidad total de páginas.

### Reemplazo completo con PUT

El endpoint:

```text
PUT /api/reservas/:id
```

permite reemplazar los siete campos editables de una reserva.

En Postman seleccionar **PUT**, ingresar una URL con un ID real y configurar **Body → raw → JSON**.

Ejemplo:

```http
PUT http://localhost:3000/api/reservas/ID_REAL
Content-Type: application/json
```

```json
{
  "estudiante": "Ana Ejemplo",
  "email": "ana@example.com",
  "sala": "Sala Norte",
  "fecha": "2026-11-04",
  "turno": "Mañana",
  "personas": 3,
  "estado": "pendiente"
}
```

El reemplazo completo responde HTTP 200 y devuelve la reserva actualizada con el mismo identificador.

Si se omite un campo obligatorio del reemplazo, la API responde HTTP 400 y no modifica el documento anterior.

### Actualización parcial con PATCH

El endpoint:

```text
PATCH /api/reservas/:id
```

permite modificar únicamente los campos admitidos por la API:

- `personas`
- `estado`

No permite modificar `estudiante`, `email`, `sala` ni `fecha`.

Ejemplo para actualizar el estado:

```http
PATCH http://localhost:3000/api/reservas/ID_REAL
Content-Type: application/json
```

```json
{
  "estado": "confirmada"
}
```

Ejemplo para modificar la cantidad de personas:

```json
{
  "personas": 4
}
```

La solicitud debe incluir al menos uno de los dos campos permitidos. Los campos adicionales, los valores inválidos y los cuerpos vacíos se rechazan con HTTP 400.

La actualización utiliza una operación parcial, conservando los campos que no se enviaron.

### Eliminación mediante DELETE

La API conserva el endpoint:

```text
DELETE /api/reservas/:id
```

Si la reserva existe, se elimina y se responde con:

```text
204 No Content
```

La respuesta no contiene cuerpo.

Si el identificador es válido pero la reserva no existe, se responde con HTTP 404 y un mensaje JSON.

**Importante:** la eliminación web y la eliminación de la API son operaciones independientes en cuanto a sus rutas y métodos HTTP. Ambas utilizan el servicio de persistencia para eliminar el documento de MongoDB.

## Validaciones y manejo de errores

La aplicación valida los datos tanto en los formularios web como en la API.

Reglas generales:

- Los textos obligatorios deben contener información.
- El email debe incluir `@`.
- La sala debe pertenecer a las opciones permitidas.
- El turno debe pertenecer a las opciones permitidas.
- La fecha es obligatoria.
- `personas` debe ser un número entero entre 1 y 6.
- `estado` debe ser `pendiente` o `confirmada`.
- Los identificadores deben tener formato ObjectId válido.

Reglas específicas de las nuevas operaciones web:

- El cambio de estado acepta exclusivamente un campo `estado`.
- La eliminación acepta exclusivamente `confirmar=si`.
- Se rechazan campos adicionales, vacíos o repetidos.
- La actualización del estado utiliza una operación parcial para conservar los demás campos.
- La eliminación requiere confirmación explícita.
- Las operaciones sobre reservas inexistentes no recrean documentos.

El manejo centralizado de errores distingue entre solicitudes web y solicitudes de la API:

- Los errores de formularios web se muestran mediante vistas HTML.
- Los errores de la API se responden en formato JSON.
- Los errores de entrada e identificadores inválidos se clasifican como HTTP 400.
- Los recursos inexistentes se responden con HTTP 404.
- Los errores internos del servidor se clasifican como HTTP 500.

Los errores de validación de Mongoose durante la edición completa y el cambio de estado permiten volver a mostrar el formulario correspondiente con los valores recibidos y los mensajes de error, sin perder el contexto de la operación.

## Persistencia y datos de prueba

La aplicación utiliza MongoDB Atlas con:

- Base de datos: `reservas_salas_u12`.
- Colección: `reservas`.

Los documentos permanecen almacenados en MongoDB al detener y volver a iniciar el servidor.

La aplicación no realiza una carga automática de reservas al iniciar. Los registros de prueba se pueden crear desde el formulario web o mediante la API.

Para las pruebas funcionales se utilizaron registros de ejemplo, verificando que:

- Los cambios de estado persisten después de reiniciar el servidor.
- Los documentos eliminados no vuelven a aparecer.
- Los identificadores se mantienen durante las actualizaciones.
- Las operaciones parciales conservan los demás campos.
- Las operaciones de eliminación no afectan a otras reservas.

Los scripts auxiliares permiten comprobar la conexión, crear registros de prueba, listar documentos y validar instancias del modelo.

**Precaución:** `scripts/crear-reservas.js` inserta una nueva reserva cada vez que se ejecuta. No es un proceso idempotente; utilizarlo conscientemente para evitar registros duplicados.

## Pruebas realizadas

Las verificaciones funcionales se realizaron con la aplicación conectada a MongoDB Atlas, utilizando el navegador y Postman.

| Caso | Verificación |
|---|---|
| Listado web | GET `/reservas` muestra las reservas existentes |
| Detalle | GET `/reservas/:id` muestra los siete campos |
| Precarga de edición | El formulario muestra los siete campos actuales |
| Reemplazo desde la web | POST exitoso responde 303 y redirige al detalle |
| Cambio de estado | El formulario permite seleccionar `pendiente` o `confirmada` |
| Actualización parcial | El cambio de estado conserva el ID y los otros seis campos |
| Cancelación del cambio de estado | Volver al detalle sin enviar el formulario no modifica la reserva |
| Estado inválido | Un valor no permitido responde HTML 400 |
| Estado vacío | La solicitud responde HTML 400 |
| Campo adicional | Enviar un campo no admitido responde HTML 400 |
| Campo repetido | Enviar dos campos `estado` responde HTML 400 |
| Confirmación de eliminación | GET de eliminación muestra los datos y la advertencia correspondiente |
| Cancelación de eliminación | Volver al detalle conserva el documento |
| Confirmación incorrecta | Una confirmación distinta de `si` responde HTML 400 |
| Confirmación vacía | La solicitud responde HTML 400 y conserva el documento |
| Campo adicional en eliminación | La solicitud responde HTML 400 y conserva el documento |
| Eliminación web | La confirmación válida responde HTTP 303 y redirige a `/reservas` |
| Verificación posterior | GET de API devuelve 404 para el documento eliminado |
| Eliminación repetida | Un segundo intento responde 404 |
| Eliminación mediante API | DELETE exitoso responde HTTP 204 sin cuerpo |
| Reserva inexistente | Se verifica HTTP 404 |
| Identificador inválido | Se verifica HTTP 400 |
| Formulario abierto y registro eliminado | El envío posterior responde 404 y no recrea el documento |
| Persistencia | Después de reiniciar el servidor, los cambios permanecen y los documentos eliminados siguen ausentes |
| Funcionalidades heredadas | Se comprueban creación, listado, detalle, edición completa, consultas y PATCH de la API |

### Verificación de persistencia

Se comprobó que las operaciones realizadas desde la web y desde la API modifican los mismos documentos almacenados en MongoDB.

En particular:

- El cambio de estado desde la web se reflejó en la consulta de la API.
- Los otros seis campos permanecieron sin modificaciones.
- La eliminación desde la web hizo que el GET de API correspondiente respondiera 404.
- La eliminación mediante API respondió 204 y el registro dejó de existir.
- Al reiniciar la aplicación, los cambios persistieron.

## Ejecución de controles de calidad

Formatear los archivos:

```bash
npm run format
```

Comprobar formato y lint:

```bash
npm run check
```

El script `check` ejecuta:

```bash
prettier --check src scripts
eslint src scripts
```

También se verificó la instalación limpia de las dependencias:

```bash
npm ci
```

Y la auditoría de seguridad:

```bash
npm audit
```

Durante la revisión se detectaron vulnerabilidades en una versión anterior de Mongoose. Se ejecutó:

```bash
npm audit fix
```

La actualización instaló Mongoose 9.12.1, manteniendo el rango de versiones declarado en `package.json`.

La verificación posterior informó:

```text
found 0 vulnerabilities
```

Después de la actualización se volvió a ejecutar `npm run check`, que finalizó correctamente.

También se comprobó la conexión con MongoDB y el arranque de la aplicación.

## Scripts disponibles

| Comando | Función |
|---|---|
| `npm start` | Inicia `src/index.js` utilizando las variables disponibles en el entorno |
| `npm run start:local` | Inicia la aplicación cargando las variables de `.env` |
| `npm run format` | Formatea los archivos de `src` y `scripts` |
| `npm run format:check` | Comprueba el formato de `src` y `scripts` |
| `npm run lint` | Ejecuta ESLint sobre `src` y `scripts` |
| `npm run check` | Ejecuta la comprobación de formato y lint |

Scripts auxiliares:

```bash
node --env-file=.env scripts/comprobar-conexion.js
node --env-file=.env scripts/crear-reservas.js
node --env-file=.env scripts/listar-reservas.js
node --env-file=.env scripts/validar-reserva.js
```

- `comprobar-conexion.js`: establece y cierra una conexión con MongoDB para verificar su disponibilidad.
- `crear-reservas.js`: crea una reserva de prueba en la base de datos.
- `listar-reservas.js`: consulta y muestra las reservas almacenadas.
- `validar-reserva.js`: valida una instancia del modelo sin guardarla en MongoDB.

## Alcance del TP12

El trabajo práctico incorpora las operaciones web de cambio de estado y eliminación de reservas, manteniendo las funcionalidades desarrolladas en las unidades anteriores.

La aplicación permite realizar el CRUD desde la interfaz web y conserva la API REST con sus operaciones de consulta, creación, reemplazo completo, actualización parcial y eliminación.

El cambio de estado web utiliza una actualización parcial que modifica exclusivamente `estado`. La eliminación web requiere una confirmación explícita y redirige al listado una vez completada.

Las operaciones se realizan sobre MongoDB mediante Mongoose, conservando la persistencia de los documentos y aplicando validaciones y manejo centralizado de errores.

**Proyecto correspondiente al TP12 -- CRUD web de reservas con MongoDB.**