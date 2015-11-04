Loggers
=======

Los logger son funciones que notifican por log notificaciones del sistema, este remplaza la funcionalidad de `console.log`.



## Environment `DEBUG`

La configuracuion `DEBUG` definida en las variables Environment definen el nivel que asocia los log de salida del sistema.

Ejemplo.

```shell
$ DEBUG=Warning node start
```

En este ejemplo nuestra unicamente las alertas hasta el nivel del **warning**.



### Environment `DEBUG=all`

Este valor `all` muestra todos los log emitidos, el cual esta por **defecto** si la variable no es definida.



### Environment `DEBUG=hidden`

El valor `hidden` oculta todos los logger emitidos.



## Level Log

| Value | Severity | Keyword  |
| ----- | -------- | -------- |
| 0 | Emergency | emerg |
| 1 | Alert | alert |
| 2 | Critical | crit |
| 3 | Error | err |
| 4 | Warning | warning |
| 5 | Notice | notice |
| 6 | Informational | info |
| 7 | Debug | debug |

* REF: <https://en.wikipedia.org/wiki/Syslog#Severity_level>

Funciones Asociadas
-------------------

### logger.log()

Genera un Logger Global el cual estara.

### logger.emergency()

Tambien se puede utilizar `logger.emerg()`, genera un logger en nivel critical.
enera un Logger de nivel emergency.

### logger.alert()

Genera un Logger de nivel alert.

### logger.critical()

Tambien se puede utilizar `logger.crit()`, genera un logger en nivel critical.

### logger.error()

Tambien se puedde utilizar `logger.err()`, genera un Logger de nivel error.

### logger.warning()

Tambien se puede utilizar `logger.warn()`, genera un Logger de nivel warning.

### logger.notice()

Genera un Logger de nivel notice.

### logger.informational()

Tambien se puede utilizar `logger.info()`, genera un Logger de nivel informational.

### logger.debug()

Tambien se puede utilizar `logger.deb()`, genera un Logger de nivel debug.
