Estructura de Applicación
=========================

```
CapJS/
|    app.js
|    package.json
|
+--- .tmp/
+--- api/
|    +--- controllers/
|    +--- models/
|    +--- policies/
|    +--- responses/
|    +--- services/
|
+--- config/
     |    http.js
     |    globals.js
     |    routes.js
     |    servers.js
     |
```

## `CapJS/api/`

Este directorio contiene todos los documento que hacen parte de la interecición de la aplicacion a un nivel funcional, como controlladores, permisos, modelos y responses.


## `CapJS/api/controllers/`

Contiene todos los controladores del sistema.


## `CapJS/api/models/`

Este directorio contiene todos los modelos del sistema.


## `CapJS/api/policies/`

Contiene todas las politicas definidas en las rutas.


## `CapJS/api/responses/`

Contiene todas las respuestas del servidor al cliente los cuales son retornados en el parametro response de la consulta HTTP.


## `CapJS/api/services/`

Contiene todos los servicios.


## `CapJS/app.js`

Constitulle el archivo que lanza la aplicacion server.


## `CapJS/package.json`

Constitulle toda la configuracion de la aplicación.


## `CapJS/config/`

Configuraciones de la aplicación.


## `CapJS/config/routes.js`

Contiene las rutas de la aplicación.

Ejemplor.

```javascript
module.exports.routes = {
  "/": {
    "server": "default", // *OPTIONAL
    "method": "GET", // GET | POST | PUT | DELETE | OPTIONS | HEAD
    "controller": function (req, res, next) {
      res.send("ok");
    },
    "policies": [],
  },
  "/images": {
    "public": app.pathResolve("public", "images")
  }
}
```

### Directorios publicos

Los directorios publicos, son un parametro de la configuración Corresponde a la definición de un directorio statico. Usando [Express Static](http://expressjs.com/guide/using-middleware.html#middleware.built-in).


## `CapJS/config/servers.js`

Contiene las configuraciones de los servidores que se levantaran.

Por defecto contiene la configuracion `default` con el puerto 80 y el host 0.0.0.0.

Ejemplo.

```javascript
module.exports.servers = {
  "default": {
    "enable": true, // or false, Default true.
    "port": 80, // Default 80 only Defualt.
    "host": "0.0.0.0", // Default 0.0.0.0 only Defualt.
  }
}
```


## `CapJS/config/globals.js`

Estas configuraciones permiten manipular el contecto de la aplicación permitiendo acceder de forma global a los complementos que CapJS implementa en su framework. ya que de otro modo se puede acceder a ellos mediante el uso de el parametro global CapJS. Ejemplo: `let _ = CapJS.lodash`.

Ejemplo.

```javascript
module.exports.globals = {
  "lodash": true, // default true.
}
```

### Configuraciones Environment.

Todas las configuraciones globales se manejan usando el prefijo `CAPJS_GLOBALS_` mas el nombre de la configuración.

> **NOTA:** Todas las configuraciones enviroment deben estar en letras mayusculas (uppercase).

Ejemplo.

```bash
CAPJS_GLOBALS_LODASH=false & npm start
```

### Configuraciones Environment segun aplicación

En caso de que el servidor este corriendo mas de una aplicación con CapJS las configuraciones con el prefijo `CAPJS_GLOBALS_` suelen tener otro comportamiento ya que se busca usando como prefijo el nombre de la aplicación, con la siguiente estructura `<NAME_APP>_GLOBALS_<CONFIGURATION>`.

> **NOTA:** El nombre de la aplicación es obtenida del documento `package.json` del parametro `"name"`. En caso de que el parametro no existe se omite el enaliceis de estas configuraciones.

Ejemplo.

```bash
MYAPP_GLOBALS_LODASH=false & npm start
```

## `CapJS/config/http.js`




## `CapJS/.tmp/`

Este directorio contiene todos los archivos temporales que maneja el sistema.

